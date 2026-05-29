import OpenAI from "openai";

const TTS_MODEL = "gpt-4o-mini-tts";
const TTS_VOICE = "marin";
const TTS_RESPONSE_FORMAT = "mp3";

export async function generateSpeech(client: OpenAI, text: string): Promise<Buffer> {
  const response = await client.audio.speech.create({
    model: TTS_MODEL,
    voice: TTS_VOICE as Parameters<typeof client.audio.speech.create>[0]["voice"],
    response_format: TTS_RESPONSE_FORMAT,
    input: text,
  });
  return Buffer.from(await response.arrayBuffer());
}
