import { Action, ActionPanel, Detail, showHUD } from "@raycast/api";
import { useGrammarTranslate } from "../hooks/useGrammarTranslate";

interface GrammarTranslateDetailProps {
  inputText: string;
  onNew: () => void;
}

export function GrammarTranslateDetail({ inputText, onNew }: GrammarTranslateDetailProps) {
  const { loading, response, error, retry } = useGrammarTranslate(inputText);

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
      markdown={response!.english_translation}
      actions={
        <ActionPanel>
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
