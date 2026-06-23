import { Action, ActionPanel, Detail, Icon } from "@raycast/api";
import { createOpenAIClient } from "../libs/openai-client";
import { useGuidedTranslation } from "../hooks/useGuidedTranslation";
import { useSpeech } from "../hooks/useSpeech";
import { buildGuidedTranslationMarkdown } from "../libs/markdown";
import { GuidedTranslationModel } from "../libs/models/guided-translation.model";

interface GuidedTranslationDetailProps {
  inputText: string;
  enableVocabulary: boolean;
  enableVerbTenses: boolean;
  enableSpeech: boolean;
  onTranslateNew: () => void;
}

interface GuidedTranslationSuccessProps {
  model: GuidedTranslationModel;
  inputText: string;
  enableSpeech: boolean;
}

function GuidedTranslationSuccess({ model, inputText, enableSpeech }: GuidedTranslationSuccessProps) {
  const openai = createOpenAIClient();
  const { handlePlaySpeech } = useSpeech({ openai, text: model.translation, autoPlay: enableSpeech });

  return (
    <Detail
      markdown={buildGuidedTranslationMarkdown(model, inputText)}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Translation" content={model.translation} />
          <Action title="Play Speech" icon={Icon.Speaker} onAction={handlePlaySpeech} />
        </ActionPanel>
      }
    />
  );
}

export function GuidedTranslationDetail({
  inputText,
  enableVocabulary,
  enableVerbTenses,
  enableSpeech,
  onTranslateNew,
}: GuidedTranslationDetailProps) {
  const { loading, model, error, retry } = useGuidedTranslation(inputText, enableVocabulary, enableVerbTenses);

  if (loading) {
    return <Detail isLoading={true} markdown="" />;
  }

  if (error) {
    return (
      <Detail
        markdown={`## ⚠️ Error\n\n${error}`}
        actions={
          <ActionPanel>
            <Action title="Retry" shortcut={{ modifiers: ["cmd"], key: "r" }} onAction={retry} />
            <Action title="Translate New Text" onAction={onTranslateNew} />
          </ActionPanel>
        }
      />
    );
  }

  return <GuidedTranslationSuccess model={model!} inputText={inputText} enableSpeech={enableSpeech} />;
}
