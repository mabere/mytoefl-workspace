<?php

namespace App\Console\Commands;

use App\Models\ExamSession;
use Illuminate\Console\Command;

class ExpireExamSessions extends Command
{
    protected $signature = 'toefl:expire-sessions {--dry-run : Report sessions without changing them}';

    protected $description = 'Mark overdue TOEFL sessions as expired.';

    public function handle(): int
    {
        $now = now();
        $query = ExamSession::query()
            ->where('status', 'IN_PROGRESS')
            ->whereNotNull('section_deadline_at')
            ->where('section_deadline_at', '<', $now);

        $count = (clone $query)->count();
        if ($this->option('dry-run')) {
            $this->info("{$count} session(s) would expire.");

            return self::SUCCESS;
        }

        $updated = 0;
        $query->select(['id', 'status', 'completed_at'])->chunkById(200, function ($sessions) use (&$updated): void {
            foreach ($sessions as $session) {
                $updated += ExamSession::query()
                    ->whereKey($session->id)
                    ->where('status', 'IN_PROGRESS')
                    ->update(['status' => 'EXPIRED', 'completed_at' => now()]);
            }
        });

        $this->info("{$updated} session(s) expired.");

        return self::SUCCESS;
    }
}
