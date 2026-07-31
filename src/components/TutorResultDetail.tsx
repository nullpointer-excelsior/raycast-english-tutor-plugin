import { Action, ActionPanel, Detail, Icon } from "@raycast/api";
import { showHUD } from "@raycast/api";
import { useTutor } from "../hooks/useTutor";
import { useSpeech } from "../hooks/useSpeech";
import { buildTutorMarkdown, buildCorrectionsSpeechText } from "../libs/markdown";
import { createOpenAIClient } from "../libs/openai-client";

interface TutorResultDetailProps {
  inputContext: string;
  inputText: string;
  onAnalyzeNew: () => void;
}

export function TutorResultDetail({ inputContext, inputText, onAnalyzeNew }: TutorResultDetailProps) {
  const { loading, response, error, retry } = useTutor(inputContext, inputText);
  const openai = createOpenAIClient();
  const { handlePlaySpeech: handlePlayCorrectedTextSpeech } = useSpeech({
    openai,
    text: response?.corrected_text ?? "",
    autoPlay: false,
  });
  const correctionsSpeechText = buildCorrectionsSpeechText(response?.corrections ?? []);
  const { handlePlaySpeech: handlePlayCorrectionsSpeech } = useSpeech({
    openai,
    text: correctionsSpeechText,
    autoPlay: false,
  });

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
            <Action title="Analyze New Text" shortcut={{ modifiers: ["cmd"], key: "n" }} onAction={onAnalyzeNew} />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <Detail
      markdown={buildTutorMarkdown(response!, inputText)}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="Copy Corrected Text"
            content={response!.corrected_text}
            onCopy={() => showHUD("Corrected Text Copied!")}
          />
          <Action
            title="Play Speech"
            icon={Icon.Speaker}
            shortcut={{ modifiers: ["cmd"], key: "s" }}
            onAction={handlePlayCorrectedTextSpeech}
          />
          <Action
            title="Play Corrections Speech"
            icon={Icon.Speaker}
            shortcut={{ modifiers: ["cmd", "shift"], key: "s" }}
            onAction={handlePlayCorrectionsSpeech}
          />
          <Action title="Analyze New Text" shortcut={{ modifiers: ["cmd"], key: "n" }} onAction={onAnalyzeNew} />
        </ActionPanel>
      }
    />
  );
}
