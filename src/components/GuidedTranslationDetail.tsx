import { Action, ActionPanel, Detail, Icon } from "@raycast/api";
import OpenAI from "openai";
import { useSpeech } from "../hooks/useSpeech";
import { buildGuidedTranslationMarkdown } from "../libs/markdown";
import { GuidedTranslationModel } from "../libs/models/guided-translation.model";

interface GuidedTranslationDetailProps {
  originalText: string;
  model: GuidedTranslationModel;
  enableSpeech: boolean;
  openai: OpenAI;
}

export function GuidedTranslationDetail({ originalText, model, enableSpeech, openai }: GuidedTranslationDetailProps) {
  const markdown = buildGuidedTranslationMarkdown(model, originalText);
  const { handlePlaySpeech } = useSpeech({ openai, text: model.translation, autoPlay: enableSpeech });

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Translation" content={model.translation} />
          <Action title="Play Speech" icon={Icon.Speaker} onAction={handlePlaySpeech} />
        </ActionPanel>
      }
    />
  );
}
