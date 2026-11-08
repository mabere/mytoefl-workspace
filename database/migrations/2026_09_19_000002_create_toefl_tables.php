<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('username')->unique();
            $table->string('password');
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('exam_packages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('sections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('package_id')->constrained('exam_packages')->cascadeOnDelete();
            $table->string('section_type');
            $table->string('title');
            $table->unsignedSmallInteger('duration_minutes');
            $table->unsignedSmallInteger('order_index');
            $table->timestamps();
            $table->index(['package_id', 'order_index']);
        });

        Schema::create('passages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('section_id')->constrained('sections')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->longText('content')->nullable();
            $table->text('audio_url')->nullable();
            $table->unsignedSmallInteger('order_index');
            $table->timestamps();
            $table->index(['section_id', 'order_index']);
        });

        Schema::create('questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('section_id')->constrained('sections')->cascadeOnDelete();
            $table->foreignUuid('passage_id')->nullable()->constrained('passages')->nullOnDelete();
            $table->unsignedSmallInteger('question_number');
            $table->longText('question_text')->nullable();
            $table->text('audio_url')->nullable();
            $table->text('option_a');
            $table->text('option_b');
            $table->text('option_c');
            $table->text('option_d');
            $table->char('correct_answer', 1);
            $table->string('part_type')->nullable();
            $table->timestamps();
            $table->index(['section_id', 'question_number']);
        });

        Schema::create('score_conversions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('section_type');
            $table->unsignedSmallInteger('raw_score');
            $table->unsignedSmallInteger('scaled_score');
            $table->timestamps();
            $table->unique(['section_type', 'raw_score']);
        });

        Schema::create('exam_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('token_code')->unique();
            $table->string('label');
            $table->foreignUuid('package_id')->nullable()->constrained('exam_packages')->nullOnDelete();
            $table->boolean('is_used')->default(false);
            $table->timestamps();
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->longText('value');
            $table->timestamp('updated_at')->nullable();
        });

        Schema::create('exam_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('package_id')->constrained('exam_packages')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->dateTime('registration_deadline')->nullable();
            $table->unsignedInteger('price')->default(0);
            $table->unsignedInteger('quota')->default(50);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('exam_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('package_id')->constrained('exam_packages');
            $table->string('token_code');
            $table->string('participant_name');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('current_section')->default('LISTENING');
            $table->string('status')->default('IN_PROGRESS');
            $table->unsignedSmallInteger('violation_count')->default(0);
            $table->dateTime('started_at');
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        Schema::create('exam_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('session_id')->constrained('exam_sessions')->cascadeOnDelete();
            $table->foreignUuid('question_id')->constrained('questions');
            $table->char('selected_answer', 1)->nullable();
            $table->boolean('is_marked_for_review')->default(false);
            $table->timestamps();
            $table->unique(['session_id', 'question_id']);
        });

        Schema::create('exam_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('session_id')->unique()->constrained('exam_sessions')->cascadeOnDelete();
            $table->unsignedSmallInteger('listening_raw');
            $table->unsignedSmallInteger('listening_scaled');
            $table->unsignedSmallInteger('structure_raw');
            $table->unsignedSmallInteger('structure_scaled');
            $table->unsignedSmallInteger('reading_raw');
            $table->unsignedSmallInteger('reading_scaled');
            $table->unsignedSmallInteger('total_score');
            $table->string('cefr_level');
            $table->timestamps();
        });

        Schema::create('exam_registrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('schedule_id')->constrained('exam_schedules')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('registration_number')->unique();
            $table->unsignedInteger('amount')->default(0);
            $table->string('status')->default('CONFIRMED');
            $table->string('payment_method')->nullable()->default('FREE_PASS');
            $table->text('payment_proof_url')->nullable();
            $table->text('payment_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->dateTime('verified_at')->nullable();
            $table->string('verified_by')->nullable();
            $table->foreignUuid('session_id')->nullable()->unique()->constrained('exam_sessions')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('certificates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('certificate_number')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('session_id')->unique()->constrained('exam_sessions')->cascadeOnDelete();
            $table->string('participant_name');
            $table->string('id_number')->nullable();
            $table->dateTime('test_date');
            $table->unsignedSmallInteger('listening_score');
            $table->unsignedSmallInteger('structure_score');
            $table->unsignedSmallInteger('reading_score');
            $table->unsignedSmallInteger('total_score');
            $table->string('cefr_level');
            $table->string('verification_code')->unique();
            $table->boolean('is_revoked')->default(false);
            $table->dateTime('issued_at');
            $table->timestamps();
        });

        Schema::create('demo_leads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('phone_number')->nullable();
            $table->unsignedSmallInteger('listening_raw')->default(0);
            $table->unsignedSmallInteger('listening_scaled')->default(0);
            $table->unsignedSmallInteger('structure_raw')->default(0);
            $table->unsignedSmallInteger('structure_scaled')->default(0);
            $table->unsignedSmallInteger('reading_raw')->default(0);
            $table->unsignedSmallInteger('reading_scaled')->default(0);
            $table->unsignedSmallInteger('total_score')->default(0);
            $table->string('cefr_level')->nullable();
            $table->string('status')->default('IN_PROGRESS');
            $table->json('answers_json')->nullable();
            $table->dateTime('started_at');
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demo_leads');
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('exam_registrations');
        Schema::dropIfExists('exam_results');
        Schema::dropIfExists('exam_answers');
        Schema::dropIfExists('exam_sessions');
        Schema::dropIfExists('exam_schedules');
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('exam_tokens');
        Schema::dropIfExists('score_conversions');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('passages');
        Schema::dropIfExists('sections');
        Schema::dropIfExists('exam_packages');
        Schema::dropIfExists('admin_users');
    }
};
