<?php

namespace Tests\Audit;

use App\Models\AdminUser;
use App\Models\ExamPackage;
use App\Models\ExamSession;
use App\Services\DatabaseBackupService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;

class DatabaseBackupTest extends TestCase
{
    use RefreshDatabase;

    public function test_backup_endpoints_require_an_admin_session(): void
    {
        $this->getJson('/api/admin/backups')->assertUnauthorized();
        $this->postJson('/api/admin/backups')->assertUnauthorized();
        $this->getJson('/api/admin/backups/toefl_test_20260920_120000_abcd1234.sql.gz/download')->assertUnauthorized();
        $this->postJson('/api/admin/backups/toefl_test_20260920_120000_abcd1234.sql.gz/restore', ['confirmation' => 'RESTORE'])->assertUnauthorized();
        $this->deleteJson('/api/admin/backups/toefl_test_20260920_120000_abcd1234.sql.gz', ['confirmation' => 'DELETE'])->assertUnauthorized();
        $this->post('/api/admin/backups/restore-upload', ['confirmation' => 'RESTORE'], ['Accept' => 'application/json'])->assertUnauthorized();
    }

    public function test_admin_can_list_only_private_backup_archives(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('backups/toefl_test_20260920_120000_abcd1234.sql.gz', 'backup');
        Storage::disk('local')->put('backups/README.txt', 'not a backup');

        $admin = AdminUser::create([
            'username' => 'backup-list-admin',
            'password' => bcrypt('test-only-password'),
            'name' => 'Backup Admin',
        ]);

        $this->withSession(['admin_id' => $admin->id])
            ->getJson('/api/admin/backups')
            ->assertOk()
            ->assertJsonCount(1, 'backups')
            ->assertJsonPath('backups.0.filename', 'toefl_test_20260920_120000_abcd1234.sql.gz');
    }

    public function test_admin_can_create_backup_and_creation_is_audited(): void
    {
        $admin = AdminUser::create([
            'username' => 'backup-create-admin',
            'password' => bcrypt('test-only-password'),
            'name' => 'Backup Admin',
        ]);
        $backup = [
            'filename' => 'toefl_test_20260920_120000_abcd1234.sql.gz',
            'path' => 'backups/toefl_test_20260920_120000_abcd1234.sql.gz',
            'size' => 128,
            'checksum' => str_repeat('a', 64),
            'createdAt' => now()->toISOString(),
            'driver' => 'mysql',
            'database' => 'toefl_laravel',
        ];
        $service = Mockery::mock(DatabaseBackupService::class);
        $service->shouldReceive('create')->once()->andReturn($backup);
        $this->app->instance(DatabaseBackupService::class, $service);

        $this->withSession(['admin_id' => $admin->id])
            ->postJson('/api/admin/backups')
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('backup.filename', $backup['filename']);

        $this->assertDatabaseHas('audit_events', [
            'event' => 'database.backup_created',
            'actor_id' => $admin->id,
        ]);
    }

    public function test_admin_can_download_an_existing_private_backup(): void
    {
        Storage::fake('local');
        $filename = 'toefl_test_20260920_120000_abcd1234.sql.gz';
        Storage::disk('local')->put('backups/'.$filename, gzencode('database backup'));

        $admin = AdminUser::create([
            'username' => 'backup-download-admin',
            'password' => bcrypt('test-only-password'),
            'name' => 'Backup Admin',
        ]);

        $response = $this->withSession(['admin_id' => $admin->id])
            ->get('/api/admin/backups/'.$filename.'/download');

        $response->assertOk();
        $this->assertStringContainsString('attachment', (string) $response->headers->get('content-disposition'));
        $this->assertDatabaseHas('audit_events', [
            'event' => 'database.backup_downloaded',
            'actor_id' => $admin->id,
        ]);
    }

    public function test_admin_can_restore_with_explicit_confirmation_and_it_is_audited(): void
    {
        $admin = AdminUser::create([
            'username' => 'backup-restore-admin',
            'password' => bcrypt('test-only-password'),
            'name' => 'Backup Admin',
        ]);
        $filename = 'toefl_test_20260920_120000_abcd1234.sql.gz';
        $restore = [
            'filename' => $filename,
            'database' => 'toefl_laravel',
            'checksum' => str_repeat('b', 64),
            'restoredAt' => now()->toISOString(),
            'safetyBackup' => ['filename' => 'toefl_test_20260920_120001_safety123.sql.gz'],
        ];
        $service = Mockery::mock(DatabaseBackupService::class);
        $service->shouldReceive('restore')->once()->with($filename)->andReturn($restore);
        $this->app->instance(DatabaseBackupService::class, $service);

        $this->withSession(['admin_id' => $admin->id])
            ->postJson('/api/admin/backups/'.$filename.'/restore', ['confirmation' => 'RESTORE'])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('restore.filename', $filename)
            ->assertJsonPath('restore.safetyBackup.filename', $restore['safetyBackup']['filename']);

        $this->assertDatabaseHas('audit_events', [
            'event' => 'database.backup_restored',
            'actor_id' => $admin->id,
        ]);
    }

    public function test_restore_requires_the_exact_confirmation_phrase(): void
    {
        $admin = AdminUser::create([
            'username' => 'backup-confirm-admin',
            'password' => bcrypt('test-only-password'),
            'name' => 'Backup Admin',
        ]);
        $service = Mockery::mock(DatabaseBackupService::class);
        $service->shouldReceive('restore')->never();
        $this->app->instance(DatabaseBackupService::class, $service);

        $this->withSession(['admin_id' => $admin->id])
            ->postJson('/api/admin/backups/toefl_test_20260920_120000_abcd1234.sql.gz/restore', ['confirmation' => 'yes'])
            ->assertStatus(422);
    }

    public function test_restore_is_blocked_while_an_exam_is_in_progress(): void
    {
        $admin = AdminUser::create([
            'username' => 'backup-active-session-admin',
            'password' => bcrypt('test-only-password'),
            'name' => 'Backup Admin',
        ]);
        $package = ExamPackage::create(['code' => 'BACKUP-ACTIVE', 'title' => 'Backup active fixture', 'is_active' => true]);
        ExamSession::create([
            'package_id' => $package->id,
            'token_code' => 'BACKUP-ACTIVE-TOKEN',
            'participant_name' => 'Active participant',
            'status' => 'IN_PROGRESS',
            'started_at' => now(),
            'section_started_at' => now(),
            'section_deadline_at' => now()->addMinutes(35),
        ]);
        $service = Mockery::mock(DatabaseBackupService::class);
        $service->shouldReceive('restore')->never();
        $this->app->instance(DatabaseBackupService::class, $service);

        $this->withSession(['admin_id' => $admin->id])
            ->postJson('/api/admin/backups/toefl_test_20260920_120000_abcd1234.sql.gz/restore', ['confirmation' => 'RESTORE'])
            ->assertStatus(409);
    }

    public function test_admin_can_delete_a_backup_with_explicit_confirmation_and_it_is_audited(): void
    {
        Storage::fake('local');
        $filename = 'toefl_test_20260920_120000_abcd1234.sql.gz';
        Storage::disk('local')->put('backups/'.$filename, gzencode('database backup'));
        $admin = AdminUser::create([
            'username' => 'backup-delete-admin',
            'password' => bcrypt('test-only-password'),
            'name' => 'Backup Admin',
        ]);
        $service = Mockery::mock(DatabaseBackupService::class);
        $service->shouldReceive('delete')->once()->with($filename)->andReturn([
            'filename' => $filename,
            'size' => 42,
            'checksum' => str_repeat('c', 64),
        ]);
        $this->app->instance(DatabaseBackupService::class, $service);

        $this->withSession(['admin_id' => $admin->id])
            ->deleteJson('/api/admin/backups/'.$filename, ['confirmation' => 'DELETE'])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('deleted.filename', $filename);

        $this->assertDatabaseHas('audit_events', [
            'event' => 'database.backup_deleted',
            'actor_id' => $admin->id,
        ]);
    }

    public function test_admin_can_restore_from_an_uploaded_backup_file(): void
    {
        $admin = AdminUser::create([
            'username' => 'backup-upload-admin',
            'password' => bcrypt('test-only-password'),
            'name' => 'Backup Admin',
        ]);
        $restore = [
            'filename' => 'uploaded_backup.sql.gz',
            'database' => 'toefl_laravel',
            'checksum' => str_repeat('d', 64),
            'restoredAt' => now()->toISOString(),
            'safetyBackup' => ['filename' => 'toefl_test_20260920_120001_safety123.sql.gz'],
        ];
        $service = Mockery::mock(DatabaseBackupService::class);
        $service->shouldReceive('restoreUploaded')->once()->with(Mockery::type(UploadedFile::class))->andReturn($restore);
        $this->app->instance(DatabaseBackupService::class, $service);

        $file = UploadedFile::fake()->createWithContent('uploaded_backup.sql.gz', gzencode('database backup'));
        $this->withSession(['admin_id' => $admin->id])
            ->post('/api/admin/backups/restore-upload', ['confirmation' => 'RESTORE', 'backup' => $file], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('restore.filename', $restore['filename']);

        $this->assertDatabaseHas('audit_events', [
            'event' => 'database.backup_restored_from_upload',
            'actor_id' => $admin->id,
        ]);
    }

    public function test_uploaded_restore_requires_a_gzip_sql_archive(): void
    {
        $admin = AdminUser::create([
            'username' => 'backup-upload-validation-admin',
            'password' => bcrypt('test-only-password'),
            'name' => 'Backup Admin',
        ]);
        $service = app(DatabaseBackupService::class);

        $this->withSession(['admin_id' => $admin->id]);
        $this->expectException(\RuntimeException::class);
        $service->restoreUploaded(UploadedFile::fake()->createWithContent('not-a-backup.txt', 'plain text'));
    }

    public function test_backup_service_rejects_path_traversal_and_untrusted_names(): void
    {
        Storage::fake('local');
        $service = app(DatabaseBackupService::class);

        $this->expectException(\RuntimeException::class);
        $service->download('../secrets.sql.gz');
    }
}
