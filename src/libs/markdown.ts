import { TutorResponse } from "./tutor-service";

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
