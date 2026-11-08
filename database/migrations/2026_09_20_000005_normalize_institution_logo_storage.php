<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    public function up(): void
    {
        $setting = DB::table('system_settings')->where('key', 'INSTITUTION_LOGO_URL')->first();
        if (! $setting) {
            return;
        }

        $path = parse_url((string) $setting->value, PHP_URL_PATH);
        if (! is_string($path) || ! str_starts_with($path, '/storage/branding/logo_')) {
            return;
        }

        $source = ltrim(substr($path, strlen('/storage/')), '/');
        $disk = Storage::disk('public');
        if (! $disk->exists($source)) {
            return;
        }

        $extension = strtolower((string) pathinfo($source, PATHINFO_EXTENSION));
        $canonical = 'branding/institution-logo.'.($extension ?: 'png');
        if ($source !== $canonical && ! $disk->copy($source, $canonical)) {
            return;
        }

        foreach ($disk->files('branding') as $candidate) {
            $candidateName = basename($candidate);
            if (str_starts_with($candidateName, 'logo_')) {
                $disk->delete($candidate);
            }
        }

        DB::table('system_settings')
            ->where('key', 'INSTITUTION_LOGO_URL')
            ->update(['value' => '/storage/'.$canonical.'?v='.now()->timestamp, 'updated_at' => now()]);
    }

    public function down(): void
    {
        // The migration only consolidates duplicate generated files.
    }
};
