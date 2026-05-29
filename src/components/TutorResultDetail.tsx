import { Action, ActionPanel, Detail } from "@raycast/api";
import { showHUD } from "@raycast/api";
import { useTutor } from "../hooks/useTutor";
import { buildTutorMarkdown } from "../libs/markdown";

interface TutorResultDetailProps {
  inputText: string;
  onAnalyzeNew: () => void;
}

export function TutorResultDetail({ inputText, onAnalyzeNew }: TutorResultDetailProps) {
  const { loading, response, error, retry } = useTutor(inputText);

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
      markdown={buildTutorMarkdown(response!)}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="Copy Corrected Text"
            content={response!.corrected_text}
            onCopy={() => showHUD("Corrected Text Copied!")}
          />
          <Action title="Analyze New Text" shortcut={{ modifiers: ["cmd"], key: "n" }} onAction={onAnalyzeNew} />
        </ActionPanel>
      }
    />
  );
}
