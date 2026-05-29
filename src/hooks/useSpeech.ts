import { useEffect, useRef } from "react";
import { showToast, Toast } from "@raycast/api";
import { APIError } from "openai";
import OpenAI from "openai";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { generateSpeech } from "../libs/speech-service";
import { playAudio } from "../libs/audio";

interface UseSpeechOptions {
  openai: OpenAI;
  text: string;
  autoPlay: boolean;
}

export function useSpeech({ openai, text, autoPlay }: UseSpeechOptions) {
  const hasPlayedRef = useRef(false);

  async function handlePlaySpeech() {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Generating speech..." });
    const tmpFilePath = path.join(os.tmpdir(), `tts-${Date.now()}.mp3`);

    try {
      let buffer: Buffer;
      try {
        buffer = await generateSpeech(openai, text);
      } catch (err) {
        if (err instanceof APIError) {
          toast.style = Toast.Style.Failure;
          toast.title = err.status === 401 ? "Invalid OpenAI API Key. Check your preferences." : err.message;
          return;
        }
        throw err;
      }

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

  useEffect(() => {
    if (autoPlay && !hasPlayedRef.current) {
      hasPlayedRef.current = true;
      handlePlaySpeech();
    }
  }, []);

  return { handlePlaySpeech };
}
