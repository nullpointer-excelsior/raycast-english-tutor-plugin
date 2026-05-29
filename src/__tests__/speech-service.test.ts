import { generateSpeech } from "../libs/speech-service";
import OpenAI from "openai";

function makeOpenAIClient(arrayBuffer: ArrayBuffer): OpenAI {
  return {
    audio: {
      speech: {
        create: jest.fn().mockResolvedValue({
          arrayBuffer: jest.fn().mockResolvedValue(arrayBuffer),
        }),
      },
    },
  } as unknown as OpenAI;
}

describe("generateSpeech", () => {
  it("returns a Buffer from the API response", async () => {
    const data = new Uint8Array([1, 2, 3, 4]).buffer;
    const client = makeOpenAIClient(data);
    const result = await generateSpeech(client, "Hello");
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result).toEqual(Buffer.from(data));
  });

  it("calls the TTS API with correct model, voice, and format", async () => {
    const client = makeOpenAIClient(new ArrayBuffer(0));
    await generateSpeech(client, "Test text");

    const createMock = (client.audio.speech.create as jest.Mock);
    const callArgs = createMock.mock.calls[0][0];
    expect(callArgs.model).toBe("gpt-4o-mini-tts");
    expect(callArgs.voice).toBe("marin");
    expect(callArgs.response_format).toBe("mp3");
    expect(callArgs.input).toBe("Test text");
  });
});
