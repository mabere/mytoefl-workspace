<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin_users', function (Blueprint $table) {
            $table->string('email')->nullable()->unique()->after('username');
            $table->string('photo_url')->nullable()->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('admin_users', function (Blueprint $table) {
            $table->dropUnique(['email']);
            $table->dropColumn(['email', 'photo_url']);
        });
    }
};
