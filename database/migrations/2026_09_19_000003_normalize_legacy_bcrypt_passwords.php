<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['admin_users', 'users'] as $table) {
            DB::table($table)
                ->where('password', 'like', '$2b$%')
                ->orderBy('id')
                ->get(['id', 'password'])
                ->each(function (object $row) use ($table): void {
                    DB::table($table)
                        ->where('id', $row->id)
                        ->update(['password' => '$2y$'.substr((string) $row->password, 4)]);
                });
        }
    }

    public function down(): void
    {
        // Password hashes cannot be safely converted back without distinguishing
        // legacy hashes from passwords created natively by Laravel afterward.
    }
};
