<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_schedules', function (Blueprint $table): void {
            $table->string('timezone', 64)->default('UTC')->after('end_time');
            $table->index(['is_active', 'start_time'], 'exam_schedules_active_start_index');
        });

        Schema::table('exam_sessions', function (Blueprint $table): void {
            $table->index(['status', 'section_deadline_at'], 'exam_sessions_status_deadline_index');
        });

        Schema::table('exam_results', function (Blueprint $table): void {
            $table->string('scoring_version', 32)->default('itp-level1-v1')->after('cefr_level');
        });
    }

    public function down(): void
    {
        Schema::table('exam_results', function (Blueprint $table): void {
            $table->dropColumn('scoring_version');
        });

        Schema::table('exam_sessions', function (Blueprint $table): void {
            $table->dropIndex('exam_sessions_status_deadline_index');
        });

        Schema::table('exam_schedules', function (Blueprint $table): void {
            $table->dropIndex('exam_schedules_active_start_index');
            $table->dropColumn('timezone');
        });
    }
};
