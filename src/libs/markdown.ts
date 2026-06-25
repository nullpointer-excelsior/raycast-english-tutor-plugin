import { TutorResponse, GrammarCorrection } from "./tutor-service";
import { GuidedTranslationModel } from "./models/guided-translation.model";
import { GrammarTranslateResponse } from "./models/grammar-translate.model";

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

export function buildGrammarTranslateMarkdown(response: GrammarTranslateResponse): string {
  const correctionsList =
    response.corrections.length > 0
      ? response.corrections
          .map((c, i) => `${i + 1}. **${c.original}** → **${c.corrected}**\n   ${c.explanation}`)
          .join("\n")
      : "No corrections needed.";

  return [
    `## 🇪🇸 Original\n${response.original_text}`,
    `## ✅ Corrected Spanish\n${response.corrected_spanish}`,
    `## 📝 Corrections\n${correctionsList}`,
    `## 🇬🇧 English Translation\n${response.english_translation}`,
  ].join("\n\n");
}
