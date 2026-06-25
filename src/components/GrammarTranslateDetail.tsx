import { Action, ActionPanel, Detail, showHUD } from "@raycast/api";
import { useGrammarTranslate } from "../hooks/useGrammarTranslate";
import { buildGrammarTranslateMarkdown } from "../libs/markdown";

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
      markdown={buildGrammarTranslateMarkdown(response!)}
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
