import { Action, ActionPanel, Detail } from "@raycast/api";
import { showHUD } from "@raycast/api";
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
            title="Copy English Translation"
            content={response!.english_translation}
            onCopy={() => showHUD("English Translation Copied!")}
          />
          <Action.CopyToClipboard
            title="Copy Corrected Spanish"
            content={response!.corrected_spanish}
            onCopy={() => showHUD("Corrected Spanish Copied!")}
          />
          <Action title="New Translation" shortcut={{ modifiers: ["cmd"], key: "n" }} onAction={onNew} />
        </ActionPanel>
      }
    />
  );
}
