import { TutorResponse } from "./tutor-service";
import { GuidedTranslationModel } from "./models/guided-translation.model";

function formatList(items: string[]): string {
  return items.length > 0 ? items.map((i) => `- ${i}`).join("\n") : "None";
}

export function buildTutorMarkdown(response: TutorResponse): string {
  return [
    `## ✅ Corrected Text\n${response.corrected_text}`,
    `## ❌ Errors\n${formatList(response.errors)}`,
    `## 📝 Corrections\n${formatList(response.corrections)}`,
    `## 💡 Suggestions\n${formatList(response.suggestions)}`,
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
  if (model.alternatives.trim()) {
    sections.push(`## 🔁 Alternative Ways\n${model.alternatives}`);
  }

  sections.push(`---\n\n**Original:** ${originalText}`);
  return sections.join("\n\n");
}
