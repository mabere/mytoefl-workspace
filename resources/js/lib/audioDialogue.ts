export interface DialogueTurn {
  speaker: "man" | "woman" | "narrator" | "professor" | "advisor" | "student" | "general";
  text: string;
}

/**
 * Parses script containing speaker markers like (Man), (Woman), (Narrator), etc.
 * and returns clean speech turns without the speaker labels.
 */
export function parseDialogueTurns(rawScript: string): DialogueTurn[] {
  if (!rawScript) return [];

  // Match tags like (Man), (Woman), (Narrator), (Professor), (Advisor), (Student), Man:, Woman:
  const regex = /\((Man|Woman|Narrator|Professor|Advisor|Student)\)|(Man|Woman|Narrator|Professor|Advisor|Student):/gi;

  const turns: DialogueTurn[] = [];
  const lines = rawScript.split("\n");

  let currentSpeaker: DialogueTurn["speaker"] = "general";
  let currentText = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line starts with or contains a speaker tag
    const match = trimmed.match(
      /^\((Man|Woman|Narrator|Professor|Advisor|Student)\)\s*(.*)$/i
    ) || trimmed.match(
      /^(Man|Woman|Narrator|Professor|Advisor|Student):\s*(.*)$/i
    );

    if (match) {
      if (currentText.trim()) {
        turns.push({ speaker: currentSpeaker, text: currentText.trim() });
      }
      const speakerTag = match[1].toLowerCase() as DialogueTurn["speaker"];
      currentSpeaker = speakerTag;
      currentText = match[2] ?? "";
    } else {
      currentText += (currentText ? " " : "") + trimmed;
    }
  }

  if (currentText.trim()) {
    turns.push({ speaker: currentSpeaker, text: currentText.trim() });
  }

  return turns.length > 0 ? turns : [{ speaker: "narrator", text: rawScript }];
}

/**
 * Extracts only the question portion from Part A (e.g. from "(Narrator) What does the woman mean?")
 * so that the dialogue transcript remains completely hidden.
 */
export function extractQuestionPrompt(rawScript: string): string {
  if (!rawScript) return "";

  // Check if narrator question exists
  const narratorMatch = rawScript.match(
    /\(Narrator\)\s*([\s\S]*?)$/i
  ) || rawScript.match(
    /Narrator:\s*([\s\S]*?)$/i
  );

  if (narratorMatch && narratorMatch[1].trim()) {
    return narratorMatch[1].trim();
  }

  // If no narrator tag, check if it's already just a question
  if (!rawScript.includes("(Man)") && !rawScript.includes("(Woman)")) {
    return rawScript.trim();
  }

  return "Choose the best answer (A, B, C, or D) based on what you hear.";
}
