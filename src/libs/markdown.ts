import { TutorResponse, GrammarCorrection } from "./tutor-service";
import { GuidedTranslationModel } from "./models/guided-translation.model";
import { WritingTranslateResponse } from "./models/writing-translate.model";

function formatCorrection(correction: GrammarCorrection, index: number): string {
  const original = correction.original || "—";
  const corrected = correction.corrected || "—";
  const explanation = correction.explanation || "No explanation provided.";
  return `${index + 1}. **${original}** → **${corrected}**\n   ${explanation}`;
}

function formatCorrections(corrections: GrammarCorrection[]): string {
  return corrections.length > 0
    ? corrections.map((c, index) => formatCorrection(c, index)).join("\n")
    : "No corrections needed.";
}

export function buildCorrectionsSpeechText(corrections: GrammarCorrection[]): string {
  if (corrections.length === 0) {
    return "No corrections needed.";
  }

  const spokenCorrections = corrections.map((correction, index) => {
    const original = correction.original || "unknown";
    const corrected = correction.corrected || "unknown";
    const explanation = correction.explanation || "No explanation provided.";
    return `Correction ${index + 1}. '${original}' should be '${corrected}'. ${explanation}`;
  });

  return `Grammar and spelling corrections. ${spokenCorrections.join(" ")}`;
}

export function buildTutorMarkdown(response: TutorResponse, originalText: string): string {
  return [
    `## ✏️ Original\n${originalText}`,
    `## ✅ Corrected Text\n${response.corrected_text}`,
    `## 📝 Grammar & Spelling Corrections\n${formatCorrections(response.corrections)}`,
  ].join("\n\n");
}

export function buildGuidedTranslationMarkdown(model: GuidedTranslationModel, originalText: string): string {
  const sections: string[] = [`# 🦜 Translation\n${model.translation}`];

  if (model.vocabulary.trim()) {
    sections.push(`## 📖 Vocabulary Breakdown\n${model.vocabulary}`);
  }
  if (model.verbTenses.trim()) {
    sections.push(`## ⏱ Verb Tenses\n${model.verbTenses}`);
  }

  sections.push(`---\n\n**Original:** ${originalText}`);
  return sections.join("\n\n");
}

export function buildWritingTranslateMarkdown(response: WritingTranslateResponse): string {
  const correctionsList =
    response.corrections.length > 0
      ? response.corrections
          .map((c, i) => `${i + 1}. **${c.original}** → **${c.corrected}**\n   ${c.explanation}`)
          .join("\n")
      : "No corrections needed.";

  return [
    `## 🇪🇸 Original\n${response.original_text}`,
    `## 🇬🇧 Translation\n${response.english_translation}`,
    `## ✅ Improved Writing\n${response.improved_writing}`,
    `## 📝 Writing Corrections\n${correctionsList}`,
  ].join("\n\n");
}
