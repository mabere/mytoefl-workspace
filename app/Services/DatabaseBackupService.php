<?php

namespace App\Services;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\Process\Process;

class DatabaseBackupService
{
    private const DISK = 'local';

    private const FILENAME_PATTERN = '/^toefl_[a-z0-9_-]+_\d{8}_\d{6}_[a-z0-9]+\.sql\.gz$/';

    /** @return array{filename: string, path: string, size: int, checksum: string, createdAt: string, driver: string, database: string} */
    public function create(): array
    {
        $disk = $this->disk();
        $directory = $this->directory();
        $disk->makeDirectory($directory);

        $database = (string) config('database.connections.'.config('database.default').'.database', 'database');
        $safeDatabase = Str::of($database)->lower()->replaceMatches('/[^a-z0-9_-]+/', '-')->trim('-')->value() ?: 'database';
        $filename = sprintf('toefl_%s_%s_%s.sql.gz', $safeDatabase, now()->format('Ymd_His'), Str::lower(Str::random(8)));
        $relativePath = $directory.'/'.$filename;
        $absolutePath = $disk->path($relativePath);
        $temporarySql = tempnam(sys_get_temp_dir(), 'toefl-db-backup-');

        if ($temporarySql === false) {
            throw new RuntimeException('Tidak dapat membuat berkas sementara untuk backup database.');
        }

        try {
            $this->dumpToSqlFile($temporarySql);
            $this->compress($temporarySql, $absolutePath);
        } catch (\Throwable $exception) {
            if (is_file($absolutePath)) {
                @unlink($absolutePath);
            }

            throw $exception;
        } finally {
            if (is_file($temporarySql)) {
                @unlink($temporarySql);
            }
        }

        return [
            'filename' => $filename,
            'path' => $relativePath,
            'size' => (int) filesize($absolutePath),
            'checksum' => hash_file('sha256', $absolutePath) ?: '',
            'createdAt' => now()->toISOString(),
            'driver' => (string) config('database.default'),
            'database' => $database,
        ];
    }

    /** @return list<array{filename: string, path: string, size: int, createdAt: string}> */
    public function list(): array
    {
        $disk = $this->disk();
        $directory = $this->directory();
        $limit = max(1, (int) config('backup.list_limit', 50));
        $files = [];

        foreach ($disk->files($directory) as $path) {
            $filename = basename($path);
            if (! preg_match(self::FILENAME_PATTERN, $filename)) {
                continue;
            }

            $files[] = [
                'filename' => $filename,
                'path' => $path,
                'size' => (int) $disk->size($path),
                'createdAt' => now()->setTimestamp($disk->lastModified($path))->toISOString(),
            ];
        }

        usort($files, fn (array $left, array $right): int => strcmp($right['filename'], $left['filename']));

        return array_slice($files, 0, $limit);
    }

    public function download(string $filename): string
    {
        [, $absolutePath] = $this->backupPath($filename);

        return $absolutePath;
    }

    /** @return array{filename: string, database: string, checksum: string, restoredAt: string, safetyBackup: array<string, mixed>} */
    public function restore(string $filename): array
    {
        [, $absolutePath] = $this->backupPath($filename);

        return $this->restorePath($filename, $absolutePath);
    }

    /** @return array{filename: string, database: string, checksum: string, restoredAt: string, safetyBackup: array<string, mixed>} */
    public function restoreUploaded(UploadedFile $file): array
    {
        if (! $file->isValid()) {
            throw new RuntimeException('File restore gagal diunggah.');
        }

        $originalFilename = (string) $file->getClientOriginalName();
        $isGzip = (bool) preg_match('/\.sql\.gz$/i', $originalFilename);
        if (! $isGzip && ! preg_match('/\.sql$/i', $originalFilename)) {
            throw new RuntimeException('File restore harus berformat .sql atau .sql.gz.');
        }

        $maxBytes = max(1, (int) config('backup.restore_max_bytes', 536870912));
        if ((int) $file->getSize() > $maxBytes) {
            throw new RuntimeException('Ukuran file restore melebihi batas yang diizinkan.');
        }

        $uploadedPath = $file->getRealPath();
        if ($uploadedPath === false || ! is_file($uploadedPath)) {
            throw new RuntimeException('File restore tidak dapat dibaca.');
        }

        $handle = fopen($uploadedPath, 'rb');
        $magic = $handle === false ? false : fread($handle, 2);
        if (is_resource($handle)) {
            fclose($handle);
        }
        if ($isGzip && $magic !== "\x1f\x8b") {
            throw new RuntimeException('File restore bukan arsip gzip yang valid.');
        }

        $stagedPath = tempnam(sys_get_temp_dir(), 'toefl-upload-restore-');
        if (! is_string($stagedPath)) {
            throw new RuntimeException('File restore tidak dapat disiapkan.');
        }
        if (! copy($uploadedPath, $stagedPath)) {
            if (is_file($stagedPath)) {
                @unlink($stagedPath);
            }

            throw new RuntimeException('File restore tidak dapat disiapkan.');
        }

        $label = preg_replace('/[^A-Za-z0-9._-]+/', '_', $originalFilename) ?: 'uploaded.sql.gz';
        $label = substr($label, 0, 180);

        $restorePath = $stagedPath;
        $compressedPath = null;
        try {
            if (! $isGzip) {
                $candidatePath = tempnam(sys_get_temp_dir(), 'toefl-upload-sql-');
                if (! is_string($candidatePath)) {
                    throw new RuntimeException('File SQL tidak dapat dikompresi untuk restore.');
                }
                $compressedPath = $candidatePath;
                $this->compress($stagedPath, $candidatePath);
                $restorePath = $compressedPath;
            }

            return $this->restorePath($label, $restorePath);
        } finally {
            if (is_file($stagedPath)) {
                @unlink($stagedPath);
            }
            if ($compressedPath !== null && is_file($compressedPath)) {
                @unlink($compressedPath);
            }
        }
    }

    /** @return array{filename: string, size: int, checksum: string} */
    public function delete(string $filename): array
    {
        [$path, $absolutePath] = $this->backupPath($filename);
        $metadata = [
            'filename' => $filename,
            'size' => (int) filesize($absolutePath),
            'checksum' => hash_file('sha256', $absolutePath) ?: '',
        ];
        if (! $this->disk()->delete($path) || $this->disk()->exists($path)) {
            throw new RuntimeException('Berkas backup tidak dapat dihapus.');
        }

        return $metadata;
    }

    /** @return array{filename: string, database: string, checksum: string, restoredAt: string, safetyBackup: array<string, mixed>} */
    private function restorePath(string $filename, string $absolutePath): array
    {
        $driver = (string) config('database.default');
        if (! in_array($driver, ['mysql', 'mariadb'], true)) {
            throw new RuntimeException('Restore otomatis saat ini mendukung database MySQL/MariaDB.');
        }

        $connection = (array) config('database.connections.'.$driver, []);
        $database = (string) ($connection['database'] ?? '');
        if ($database === '') {
            throw new RuntimeException('Nama database belum dikonfigurasi.');
        }

        $temporarySql = $this->decompress($absolutePath);

        try {
            // Always keep a fresh rollback point before replacing the active database.
            $safetyBackup = $this->create();
            $this->importSql($temporarySql, $connection, $database);
        } finally {
            if (is_file($temporarySql)) {
                @unlink($temporarySql);
            }
        }

        return [
            'filename' => $filename,
            'database' => $database,
            'checksum' => hash_file('sha256', $absolutePath) ?: '',
            'restoredAt' => now()->toISOString(),
            'safetyBackup' => $safetyBackup,
        ];
    }

    private function dumpToSqlFile(string $temporarySql): void
    {
        $driver = (string) config('database.default');
        if (! in_array($driver, ['mysql', 'mariadb'], true)) {
            throw new RuntimeException('Backup otomatis saat ini mendukung database MySQL/MariaDB.');
        }

        $connection = (array) config('database.connections.'.$driver, []);
        $binary = $this->dumpBinary();
        $database = (string) ($connection['database'] ?? '');
        if ($database === '') {
            throw new RuntimeException('Nama database belum dikonfigurasi.');
        }

        $command = [
            $binary,
            '--protocol=tcp',
            '--host='.(string) ($connection['host'] ?? '127.0.0.1'),
            '--port='.(string) ($connection['port'] ?? '3306'),
            '--user='.(string) ($connection['username'] ?? 'root'),
            '--single-transaction',
            '--quick',
            '--skip-lock-tables',
            '--routines',
            '--triggers',
            '--hex-blob',
            '--no-tablespaces',
            $database,
        ];

        $process = new Process($command, base_path(), [
            'MYSQL_PWD' => (string) ($connection['password'] ?? ''),
        ]);
        $process->setTimeout(max(30, (int) config('backup.timeout', 300)));
        $handle = fopen($temporarySql, 'wb');
        if ($handle === false) {
            throw new RuntimeException('Tidak dapat membuka berkas sementara backup.');
        }

        $stderr = '';
        try {
            $exitCode = $process->run(function (string $type, string $buffer) use ($handle, &$stderr): void {
                if ($type === Process::ERR) {
                    $stderr .= $buffer;

                    return;
                }
                fwrite($handle, $buffer);
            });
        } finally {
            fclose($handle);
        }

        if ($exitCode !== 0) {
            $message = trim(preg_replace('/\s+/', ' ', $stderr) ?: 'mysqldump gagal dijalankan.');
            throw new RuntimeException($message);
        }

        if ((int) filesize($temporarySql) < 100) {
            throw new RuntimeException('Backup database menghasilkan berkas kosong.');
        }
    }

    /** @return array{0: string, 1: string} */
    private function backupPath(string $filename): array
    {
        if (! preg_match(self::FILENAME_PATTERN, $filename) || basename($filename) !== $filename) {
            throw new RuntimeException('Nama berkas backup tidak valid.');
        }

        $path = $this->directory().'/'.$filename;
        if (! $this->disk()->exists($path)) {
            throw new RuntimeException('Berkas backup tidak ditemukan.');
        }

        return [$path, $this->disk()->path($path)];
    }

    private function decompress(string $absolutePath): string
    {
        $temporarySql = tempnam(sys_get_temp_dir(), 'toefl-db-restore-');
        $source = gzopen($absolutePath, 'rb');
        $target = $temporarySql === false ? false : fopen($temporarySql, 'wb');

        if ($temporarySql === false || $source === false || $target === false) {
            if (is_resource($source)) {
                gzclose($source);
            }
            if (is_resource($target)) {
                fclose($target);
            }
            if ($temporarySql !== false && is_file($temporarySql)) {
                @unlink($temporarySql);
            }

            throw new RuntimeException('Arsip backup tidak dapat dibaca.');
        }

        $maxBytes = max(1, (int) config('backup.restore_max_sql_bytes', 2147483648));
        $totalBytes = 0;
        try {
            while (! gzeof($source)) {
                $chunk = gzread($source, 1024 * 1024);
                if ($chunk === false) {
                    throw new RuntimeException('Arsip backup rusak atau tidak lengkap.');
                }
                $totalBytes += strlen($chunk);
                if ($totalBytes > $maxBytes) {
                    throw new RuntimeException('Ukuran SQL hasil restore melebihi batas yang diizinkan.');
                }
                if ($chunk !== '' && fwrite($target, $chunk) === false) {
                    throw new RuntimeException('Berkas sementara restore tidak dapat ditulis.');
                }
            }
        } finally {
            gzclose($source);
            fclose($target);
        }

        if ((int) filesize($temporarySql) < 100) {
            @unlink($temporarySql);
            throw new RuntimeException('Backup database menghasilkan SQL kosong.');
        }

        return $temporarySql;
    }

    /** @param array<string, mixed> $connection */
    private function importSql(string $temporarySql, array $connection, string $database): void
    {
        $command = [
            $this->mysqlBinary(),
            '--protocol=tcp',
            '--host='.(string) ($connection['host'] ?? '127.0.0.1'),
            '--port='.(string) ($connection['port'] ?? '3306'),
            '--user='.(string) ($connection['username'] ?? 'root'),
            '--binary-mode',
            $database,
        ];
        $input = fopen($temporarySql, 'rb');
        if ($input === false) {
            throw new RuntimeException('SQL restore tidak dapat dibuka.');
        }

        $process = new Process($command, base_path(), [
            'MYSQL_PWD' => (string) ($connection['password'] ?? ''),
        ]);
        $process->setInput($input);
        $process->setTimeout(max(30, (int) config('backup.timeout', 300)));
        $stderr = '';

        try {
            $exitCode = $process->run(function (string $type, string $buffer) use (&$stderr): void {
                if ($type === Process::ERR) {
                    $stderr .= $buffer;
                }
            });
        } finally {
            fclose($input);
        }

        if ($exitCode !== 0) {
            $message = trim(preg_replace('/\s+/', ' ', $stderr) ?: 'mysql restore gagal dijalankan.');
            throw new RuntimeException($message);
        }
    }

    private function compress(string $temporarySql, string $absolutePath): void
    {
        $source = fopen($temporarySql, 'rb');
        $target = gzopen($absolutePath, 'wb'.max(1, min(9, (int) config('backup.compression_level', 9))));
        if ($source === false || $target === false) {
            if (is_resource($source)) {
                fclose($source);
            }
            if ($target !== false) {
                gzclose($target);
            }
            throw new RuntimeException('Tidak dapat menulis arsip backup database.');
        }

        try {
            while (! feof($source)) {
                $chunk = fread($source, 1024 * 1024);
                if ($chunk === false) {
                    throw new RuntimeException('Gagal membaca hasil dump database.');
                }
                if ($chunk !== '') {
                    gzwrite($target, $chunk);
                }
            }
        } finally {
            fclose($source);
            gzclose($target);
        }
    }

    private function dumpBinary(): string
    {
        $configured = trim((string) config('backup.dump_binary'));
        if ($configured !== '') {
            return $configured;
        }

        $candidates = [];
        if (PHP_OS_FAMILY === 'Windows') {
            $candidates[] = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
        } else {
            $candidates[] = '/usr/bin/mysqldump';
            $candidates[] = '/usr/local/bin/mysqldump';
        }

        foreach ($candidates as $candidate) {
            if (is_file($candidate)) {
                return $candidate;
            }
        }

        return 'mysqldump';
    }

    private function mysqlBinary(): string
    {
        $configured = trim((string) config('backup.mysql_binary'));
        if ($configured !== '') {
            return $configured;
        }

        $candidates = [];
        if (PHP_OS_FAMILY === 'Windows') {
            $candidates[] = 'C:\\xampp\\mysql\\bin\\mysql.exe';
        } else {
            $candidates[] = '/usr/bin/mysql';
            $candidates[] = '/usr/local/bin/mysql';
        }

        foreach ($candidates as $candidate) {
            if (is_file($candidate)) {
                return $candidate;
            }
        }

        return 'mysql';
    }

    private function directory(): string
    {
        $directory = trim((string) config('backup.directory', 'backups'), '/\\');
        if ($directory === '' || str_contains($directory, '..') || preg_match('/^[A-Za-z]:/', $directory)) {
            throw new RuntimeException('Direktori backup tidak valid.');
        }

        return str_replace('\\', '/', $directory);
    }

    private function disk(): FilesystemAdapter
    {
        return Storage::disk(self::DISK);
    }
}
