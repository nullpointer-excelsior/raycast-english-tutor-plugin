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
  const cachedTextRef = useRef<string | null>(null);
  const cachedBufferRef = useRef<Buffer | null>(null);
  const tmpFilePathRef = useRef<string | null>(null);

  async function handlePlaySpeech() {
    const isCached = cachedBufferRef.current !== null && cachedTextRef.current === text;
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: isCached ? "Playing with Marin's voice..." : "Generating speech...",
    });

    if (!isCached) {
      try {
        cachedBufferRef.current = await generateSpeech(openai, text);
        cachedTextRef.current = text;
      } catch (err) {
        if (err instanceof APIError) {
          toast.style = Toast.Style.Failure;
          toast.title = err.status === 401 ? "Invalid OpenAI API Key. Check your preferences." : err.message;
          return;
        }
        throw err;
      }

      if (!tmpFilePathRef.current) {
        tmpFilePathRef.current = path.join(os.tmpdir(), `tts-${Date.now()}.mp3`);
      }
      fs.writeFileSync(tmpFilePathRef.current, cachedBufferRef.current);
    }

    toast.style = Toast.Style.Success;
    toast.title = "Playing with Marin's voice...";

    try {
      await playAudio(tmpFilePathRef.current!);
    } catch {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to play audio.";
    }
  }

  useEffect(() => {
    if (autoPlay && !hasPlayedRef.current) {
      hasPlayedRef.current = true;
      handlePlaySpeech();
    }
  }, []);

  useEffect(() => {
    const tmpFilePath = tmpFilePathRef.current;
    return () => {
      if (tmpFilePath) {
        fs.rmSync(tmpFilePath, { force: true });
      }
    };
  }, []);

  return { handlePlaySpeech };
}
