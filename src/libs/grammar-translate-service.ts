import OpenAI from "openai";
import { GrammarTranslateResponse } from "./models/grammar-translate.model";

const MODEL = "gpt-4.1-mini";
const TEMPERATURE = 0;

const SYSTEM_PROMPT = `You are an expert Spanish-to-English translator.

The user will provide text in Spanish. Translate it into natural, idiomatic English.

Important:
- Preserve the original meaning, tone, and nuance.
- The English translation must sound natural and idiomatic.
- Translate directly; do not add commentary, explanations, or corrections.

Respond ONLY with valid JSON matching this schema:
{
  "english_translation": "string"
}`;

export async function grammarAndTranslate(client: OpenAI, inputText: string): Promise<GrammarTranslateResponse> {
  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: TEMPERATURE,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: inputText },
    ],
  });

  const content = completion.choices[0].message.content ?? "";
  let parsed: GrammarTranslateResponse;
  try {
    parsed = JSON.parse(content) as GrammarTranslateResponse;
  } catch {
    throw new Error("Unexpected AI response format");
  }

  return {
    original_text: inputText,
    corrected_spanish: inputText,
    corrections: [],
    english_translation: parsed.english_translation ?? "",
  };
}
