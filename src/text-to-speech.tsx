import { Action, ActionPanel, Form, getPreferenceValues, showToast, Toast } from "@raycast/api";
import OpenAI, { APIError } from "openai";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as child_process from "node:child_process";

const TTS_MODEL = "gpt-4o-mini-tts";
const TTS_VOICE = "marin";
const TTS_RESPONSE_FORMAT = "mp3";
const TTS_MAX_CHARS = 4096;

interface Preferences {
  openaiApiKey: string;
}

interface TtsFormValues {
  ttsInput: string;
}

function playAudio(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = child_process.spawn("afplay", [filePath]);
    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`afplay exited with code ${code}`));
      }
    });
    proc.on("error", (err) => {
      reject(err);
    });
  });
}

async function handleSpeak(values: TtsFormValues): Promise<void> {
  if (values.ttsInput.length > TTS_MAX_CHARS) {
    await showToast({ style: Toast.Style.Failure, title: "Text too long (max 4096 characters)." });
    return;
  }

  const toast = await showToast({ style: Toast.Style.Animated, title: "Generating speech..." });

  const { openaiApiKey } = getPreferenceValues<Preferences>();
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const tmpFilePath = path.join(os.tmpdir(), `tts-${Date.now()}.mp3`);

  try {
    let response;
    try {
      response = await openai.audio.speech.create({
        model: TTS_MODEL,
        voice: TTS_VOICE as Parameters<typeof openai.audio.speech.create>[0]["voice"],
        response_format: TTS_RESPONSE_FORMAT,
        input: values.ttsInput,
      });
    } catch (err) {
      if (err instanceof APIError) {
        if (err.status === 401) {
          toast.style = Toast.Style.Failure;
          toast.title = "Invalid OpenAI API Key. Check your preferences.";
        } else {
          toast.style = Toast.Style.Failure;
          toast.title = err.message;
        }
        return;
      }
      throw err;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(tmpFilePath, buffer);

    toast.style = Toast.Style.Success;
    toast.title = "Playing with Marin's voice...";

    try {
      await playAudio(tmpFilePath);
    } catch {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to play audio.";
    }
  } finally {
    fs.rmSync(tmpFilePath, { force: true });
  }
}

export default function TextToSpeechCommand() {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Speak" onSubmit={handleSpeak} />
        </ActionPanel>
      }
    >
      <Form.TextArea id="ttsInput" title="Text" placeholder="Enter text to speak..." />
    </Form>
  );
}
