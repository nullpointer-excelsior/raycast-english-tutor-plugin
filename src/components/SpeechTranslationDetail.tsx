import { Action, ActionPanel, Detail, Icon } from "@raycast/api";
import OpenAI from "openai";
import { useSpeech } from "../hooks/useSpeech";
import { SourceLanguage } from "../libs/models/guided-translation.model";

interface TranslationDetailProps {
  originalText: string;
  sourceLanguage: SourceLanguage;
  translatedText: string;
  enableSpeech: boolean;
  openai: OpenAI;
}

export function SpeechTranslationDetail({
  originalText,
  sourceLanguage,
  translatedText,
  enableSpeech,
  openai,
}: TranslationDetailProps) {
  const markdown = `## 🦜 Translation\n\n${translatedText}\n\n---\n\n**Original:** ${originalText}`;
  const speechText = sourceLanguage === "english" ? originalText : translatedText;
  const { handlePlaySpeech } = useSpeech({ openai, text: speechText, autoPlay: enableSpeech });

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action title="Play English Speech" icon={Icon.Speaker} onAction={handlePlaySpeech} />
          <Action.CopyToClipboard title="Copy Translation" content={translatedText} />
        </ActionPanel>
      }
    />
  );
}
