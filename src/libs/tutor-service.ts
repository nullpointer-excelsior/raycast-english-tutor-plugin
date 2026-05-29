import OpenAI from "openai";

const TUTOR_MODEL = "gpt-4o-mini";
const TUTOR_TEMPERATURE = 0;

const TUTOR_SYSTEM_PROMPT = `You are an expert English tutor. Help the user learn English following these instructions:

- Respond directly and as concisely as possible.
- Any English text the user provides may have errors; you must correct it and provide a list of corrections.
- Important: the corrected text MUST BE AT THE BEGINNING OF THE RESPONSE.
- If the user provides text in Spanish, you must translate it.
- Provide suggestions to improve phrases if they are in English but don't sound natural.
- Give all your responses with a summary of errors and suggestions, and finally the text the user needs or asked you to correct.
- Explain grammar, phrasal verbs, or verb tenses.
- If a phrase contains numbers, provide the written number; for example: I'm 30 → I'm thirty (30).
- The user may provide English text with Spanish words enclosed in "<>", which means they don't know how to say that word in English; provide the translation in the corrected text.
  Examples:
    - I want to <ser libre> → "I want to break free"
    - He <tenía que ir a trabajar> on Sunday → "He had to go to work on Sunday"
- Provide the English lesson with a short, appropriate English name to help the user learn from their mistakes.

Respond ONLY with valid JSON matching this schema:
{
  "corrected_text": "string",
  "corrections": ["string"],
  "errors": ["string"],
  "suggestions": ["string"]
}`;

export interface TutorResponse {
  corrected_text: string;
  corrections: string[];
  errors: string[];
  suggestions: string[];
}

export async function analyzeTutor(client: OpenAI, inputText: string): Promise<TutorResponse> {
  const completion = await client.chat.completions.create({
    model: TUTOR_MODEL,
    temperature: TUTOR_TEMPERATURE,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: TUTOR_SYSTEM_PROMPT },
      { role: "user", content: inputText },
    ],
  });

  const content = completion.choices[0].message.content ?? "";
  let parsed: TutorResponse;
  try {
    parsed = JSON.parse(content) as TutorResponse;
  } catch {
    throw new Error("Unexpected AI response format");
  }

  return {
    corrected_text: parsed.corrected_text ?? "",
    corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],
    errors: Array.isArray(parsed.errors) ? parsed.errors : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
  };
}
