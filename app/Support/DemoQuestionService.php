<?php

namespace App\Support;

class DemoQuestionService
{
    /** @return array<string, mixed> */
    public function all(string $demoId, bool $sanitized = false): array
    {
        $data = json_decode((string) file_get_contents(database_path('data/demoQuestions.json')), true);
        $questions = array_map(fn (array $question) => $this->shuffle($question, $demoId), $data['questions'] ?? []);
        if ($sanitized) {
            $questions = array_map(function (array $question) {
                unset($question['correctAnswer'], $question['explanation']);

                return $question;
            }, $questions);
        }

        return ['questions' => $questions, 'passages' => $data['passages'] ?? []];
    }

    /**
     * @param  array<string, mixed>  $question
     * @return array<string, mixed>
     */
    private function shuffle(array $question, string $demoId): array
    {
        if (($question['partType'] ?? '') === 'WRITTEN_EXPRESSION') {
            return $question;
        }
        $keys = ['A', 'B', 'C', 'D'];
        $shuffledKeys = $keys;
        usort($shuffledKeys, fn (string $a, string $b) => strcmp(hash('sha256', $demoId.':'.$question['id'].':'.$a), hash('sha256', $demoId.':'.$question['id'].':'.$b)));
        $newOptions = [];
        $newCorrect = 'A';
        foreach ($shuffledKeys as $index => $original) {
            $key = $keys[$index];
            $newOptions[$key] = $question['options'][$original] ?? '';
            if ($original === ($question['correctAnswer'] ?? null)) {
                $newCorrect = $key;
            }
        }
        $question['options'] = $newOptions;
        $question['correctAnswer'] = $newCorrect;

        return $question;
    }
}
