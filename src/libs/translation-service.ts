import OpenAI from "openai";

const TRANSLATION_MODEL = "gpt-4.1-nano";

const DETECT_AND_TRANSLATE_PROMPT = `You are a translation assistant. Detect the language of the given text.
- If it is in English, translate it to Spanish.
- If it is in Spanish, translate it to English.
Return ONLY the translated text, with no explanations or extra content.`;

export async function translateText(client: OpenAI, text: string): Promise<string> {
  const completion = await client.chat.completions.create({
    model: TRANSLATION_MODEL,
    messages: [
      { role: "system", content: DETECT_AND_TRANSLATE_PROMPT },
      { role: "user", content: text },
    ],
  });
  return completion.choices[0].message.content ?? text;
}
