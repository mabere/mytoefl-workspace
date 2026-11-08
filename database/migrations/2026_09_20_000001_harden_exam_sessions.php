<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_sessions', function (Blueprint $table): void {
            $table->dateTime('section_started_at')->nullable()->after('started_at');
            $table->dateTime('section_deadline_at')->nullable()->after('section_started_at');
            $table->dateTime('last_saved_at')->nullable()->after('section_deadline_at');
            $table->json('package_snapshot')->nullable()->after('last_saved_at');
        });

        Schema::table('exam_registrations', function (Blueprint $table): void {
            $table->text('payment_proof_path')->nullable()->after('payment_proof_url');
            $table->unique(['schedule_id', 'user_id'], 'exam_registrations_schedule_user_unique');
        });
    }

    public function down(): void
    {
        Schema::table('exam_registrations', function (Blueprint $table): void {
            $table->dropUnique('exam_registrations_schedule_user_unique');
            $table->dropColumn('payment_proof_path');
        });

        Schema::table('exam_sessions', function (Blueprint $table): void {
            $table->dropColumn(['section_started_at', 'section_deadline_at', 'last_saved_at', 'package_snapshot']);
        });
    }
};
