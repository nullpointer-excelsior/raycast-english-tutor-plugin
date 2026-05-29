import { Action, ActionPanel, Detail, Icon } from "@raycast/api";
import OpenAI from "openai";
import { useSpeech } from "../hooks/useSpeech";

interface TranslationDetailProps {
  originalText: string;
  translatedText: string;
  enableSpeech: boolean;
  openai: OpenAI;
}

export function TranslationDetail({ originalText, translatedText, enableSpeech, openai }: TranslationDetailProps) {
  const markdown = `## 🦜 Translation\n\n${translatedText}\n\n---\n\n**Original:** ${originalText}`;
  const { handlePlaySpeech } = useSpeech({ openai, text: translatedText, autoPlay: enableSpeech });

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action title="Play Speech" icon={Icon.Speaker} onAction={handlePlaySpeech} />
          <Action.CopyToClipboard title="Copy Translation" content={translatedText} />
        </ActionPanel>
      }
    />
  );
}
