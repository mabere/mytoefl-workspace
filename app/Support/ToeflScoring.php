<?php

namespace App\Support;

class ToeflScoring
{
    public const VERSION = 'itp-level1-v1';

    private const LISTENING = [31, 31, 31, 32, 32, 33, 34, 35, 36, 37, 38, 39, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 52, 53, 54, 55, 55, 56, 57, 57, 58, 58, 59, 60, 61, 61, 62, 63, 64, 65, 65, 66, 67, 67, 68, 68, 68, 68, 68];

    private const STRUCTURE = [31, 31, 31, 32, 33, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 63, 64, 65, 66, 67, 68, 68, 68, 68, 68];

    private const READING = [31, 31, 31, 31, 32, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 48, 49, 50, 51, 52, 52, 53, 54, 54, 55, 56, 56, 57, 58, 58, 59, 60, 61, 62, 63, 63, 64, 65, 65, 66, 66, 67, 67, 67];

    private const DEMO_LISTENING = [31, 33, 37, 41, 44, 48, 51, 54, 58, 64, 68];

    private const DEMO_STRUCTURE = [31, 33, 36, 40, 44, 47, 50, 54, 58, 64, 68];

    private const DEMO_READING = [31, 33, 36, 39, 43, 47, 51, 54, 58, 63, 67];

    public static function scaled(string $section, int $raw): int
    {
        $table = match ($section) {
            'LISTENING' => self::LISTENING,
            'STRUCTURE' => self::STRUCTURE,
            'READING' => self::READING,
            default => [31],
        };
        $max = count($table) - 1;

        return $table[max(0, min($raw, $max))] ?? 31;
    }

    public static function demoScaled(string $section, int $raw): int
    {
        $table = match ($section) {
            'LISTENING' => self::DEMO_LISTENING,
            'STRUCTURE' => self::DEMO_STRUCTURE,
            'READING' => self::DEMO_READING,
            default => [31],
        };

        return $table[max(0, min($raw, 10))] ?? 31;
    }

    public static function total(int $listening, int $structure, int $reading): int
    {
        return (int) round((($listening + $structure + $reading) * 10) / 3);
    }

    /** @return array{level: string, description: string} */
    public static function cefr(int $total): array
    {
        return match (true) {
            $total >= 627 => ['level' => 'C1', 'description' => 'Effective Operational Proficiency (Advanced)'],
            $total >= 543 => ['level' => 'B2', 'description' => 'Vantage (Upper Intermediate)'],
            $total >= 460 => ['level' => 'B1', 'description' => 'Threshold (Intermediate)'],
            $total >= 337 => ['level' => 'A2', 'description' => 'Waystage (Elementary)'],
            default => ['level' => '<A2', 'description' => 'Below the recommended A2 benchmark'],
        };
    }

    /**
     * @param  array<string, mixed>  $raw
     * @return array<string, int|string>
     */
    public static function result(array $raw, bool $demo = false): array
    {
        $scale = $demo ? [self::class, 'demoScaled'] : [self::class, 'scaled'];
        $listening = $scale('LISTENING', (int) ($raw['listeningRaw'] ?? 0));
        $structure = $scale('STRUCTURE', (int) ($raw['structureRaw'] ?? 0));
        $reading = $scale('READING', (int) ($raw['readingRaw'] ?? 0));
        $total = self::total($listening, $structure, $reading);
        $cefr = self::cefr($total);

        return [
            'listeningRaw' => (int) ($raw['listeningRaw'] ?? 0), 'listeningScaled' => $listening,
            'structureRaw' => (int) ($raw['structureRaw'] ?? 0), 'structureScaled' => $structure,
            'readingRaw' => (int) ($raw['readingRaw'] ?? 0), 'readingScaled' => $reading,
            'totalScore' => $total, 'cefrLevel' => $cefr['level'], 'cefrDescription' => $cefr['description'],
            'scoringVersion' => self::VERSION,
        ];
    }
}
