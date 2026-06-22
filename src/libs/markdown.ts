import { TutorResponse, GrammarCorrection } from "./tutor-service";
import { GuidedTranslationModel } from "./models/guided-translation.model";

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

export function buildTutorMarkdown(response: TutorResponse): string {
  return [
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
