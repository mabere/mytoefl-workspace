<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

// Read-only inventory. Outputs only aggregate counts/configuration, never participant data.
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
$db = DB::connection();
$out = ['driver' => $db->getDriverName(), 'environment' => config('app.env'), 'debug' => config('app.debug'), 'timezone' => config('app.timezone'), 'session_driver' => config('session.driver'), 'secure_cookie' => config('session.secure'), 'php_memory_limit' => ini_get('memory_limit')];
foreach (['exam_packages', 'sections', 'questions', 'exam_sessions', 'exam_registrations', 'certificates', 'demo_leads'] as $table) {
    $out['counts'][$table] = $db->table($table)->count();
}
$out['section_inventory'] = $db->table('sections')->leftJoin('questions', 'sections.id', '=', 'questions.section_id')->select('section_type', 'duration_minutes')->selectRaw('count(distinct sections.id) as sections, count(questions.id) as questions')->groupBy('section_type', 'duration_minutes')->get();
$out['duplicate_registrations'] = count($db->select('SELECT schedule_id, user_id FROM exam_registrations GROUP BY schedule_id, user_id HAVING COUNT(*) > 1'));
$out['invalid_answer_keys'] = $db->table('questions')->whereNotIn('correct_answer', ['A', 'B', 'C', 'D'])->count();
$out['revoked_certificates'] = $db->table('certificates')->where('is_revoked', true)->count();
$out['peak_php_bytes'] = memory_get_peak_usage(true);
echo json_encode($out, JSON_PRETTY_PRINT), PHP_EOL;
