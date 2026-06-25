import OpenAI from "openai";
import { WritingTranslateResponse } from "./models/writing-translate.model";

const MODEL = "gpt-4.1-mini";
const TEMPERATURE = 0;

const SYSTEM_PROMPT = `You are an expert Spanish-to-English translator and English writing editor.

Perform the following steps in order:
1. Translate the user's Spanish text into natural, idiomatic English. This is the direct translation.
2. Improve the writing of that English translation for clarity, flow, grammar, and style, while preserving the original meaning, tone, and nuance. Identify every change you made to transform the translation into the improved version.

Important:
- The improved writing must remain faithful to the original meaning and tone.
- Each correction should describe a single, specific change between the direct translation and the improved writing.

Respond ONLY with valid JSON matching this schema:
{
  "english_translation": "string (the direct Spanish-to-English translation)",
  "improved_writing": "string (the improved English text)",
  "corrections": [
    { "original": "string (phrase from the translation)", "corrected": "string (the improved phrase)", "explanation": "string" }
  ]
}`;

export async function writingAndTranslate(client: OpenAI, inputText: string): Promise<WritingTranslateResponse> {
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
  let parsed: WritingTranslateResponse;
  try {
    parsed = JSON.parse(content) as WritingTranslateResponse;
  } catch {
    throw new Error("Unexpected AI response format");
  }

  return {
    original_text: inputText,
    english_translation: parsed.english_translation ?? "",
    improved_writing: parsed.improved_writing ?? "",
    corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],
  };
}
