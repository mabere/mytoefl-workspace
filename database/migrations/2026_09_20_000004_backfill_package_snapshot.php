<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('exam_sessions', 'package_snapshot')) {
            Schema::table('exam_sessions', function (Blueprint $table): void {
                $table->json('package_snapshot')->nullable()->after('last_saved_at');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('exam_sessions', 'package_snapshot')) {
            Schema::table('exam_sessions', function (Blueprint $table): void {
                $table->dropColumn('package_snapshot');
            });
        }
    }
};
