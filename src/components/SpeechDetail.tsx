import { Action, ActionPanel, Detail, Icon } from "@raycast/api";
import OpenAI from "openai";
import { useSpeech } from "../hooks/useSpeech";

interface SpeechDetailProps {
  text: string;
  autoPlay: boolean;
  openai: OpenAI;
}

export function SpeechDetail({ text, autoPlay, openai }: SpeechDetailProps) {
  const { handlePlaySpeech } = useSpeech({ openai, text, autoPlay });

  return (
    <Detail
      markdown={`## Speech\n\n${text}`}
      actions={
        <ActionPanel>
          <Action title="Play Speech" icon={Icon.Speaker} onAction={handlePlaySpeech} />
          <Action.CopyToClipboard title="Copy Text" content={text} />
        </ActionPanel>
      }
    />
  );
}
