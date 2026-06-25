import { Action, ActionPanel, Detail, showHUD } from "@raycast/api";
import { useWritingTranslate } from "../hooks/useWritingTranslate";
import { buildWritingTranslateMarkdown } from "../libs/markdown";

interface WritingTranslateDetailProps {
  inputText: string;
  onNew: () => void;
}

export function WritingTranslateDetail({ inputText, onNew }: WritingTranslateDetailProps) {
  const { loading, response, error, retry } = useWritingTranslate(inputText);

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
            <Action title="New Translation" shortcut={{ modifiers: ["cmd"], key: "n" }} onAction={onNew} />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <Detail
      markdown={buildWritingTranslateMarkdown(response!)}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="Copy Improved Writing"
            content={response!.improved_writing}
            onCopy={() => showHUD("Improved Writing Copied!")}
          />
          <Action.CopyToClipboard
            title="Copy Translation"
            content={response!.english_translation}
            onCopy={() => showHUD("Translation Copied!")}
          />
          <Action title="New Translation" shortcut={{ modifiers: ["cmd"], key: "n" }} onAction={onNew} />
        </ActionPanel>
      }
    />
  );
}
