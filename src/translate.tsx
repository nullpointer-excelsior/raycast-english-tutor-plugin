import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { GuidedTranslationDetail } from "./components/GuidedTranslationDetail";

const TTS_MAX_CHARS = 4096;

interface TranslateFormValues {
  ttsInput: string;
  enableVocabulary: boolean;
  enableVerbTenses: boolean;
  enableSpeech: boolean;
}

export default function TranslateCommand() {
  const [enableSpeech, setEnableSpeech] = useState(false);
  const [enableVerbTenses, setEnableVerbTenses] = useState(true);
  const [enableVocabularyBreakdown, setEnableVocabularyBreakdown] = useState(true);
  const [inputKey, setInputKey] = useState(0);
  const { push } = useNavigation();

  function handleTranslateNew() {
    setInputKey((key) => key + 1);
  }

  async function handleSubmit(values: TranslateFormValues) {
    if (values.ttsInput.length > TTS_MAX_CHARS) {
      await showToast({ style: Toast.Style.Failure, title: "Text too long (max 4096 characters)." });
      return;
    }

    push(
      <GuidedTranslationDetail
        inputText={values.ttsInput}
        enableVocabulary={values.enableVocabulary}
        enableVerbTenses={values.enableVerbTenses}
        enableSpeech={values.enableSpeech}
        onTranslateNew={handleTranslateNew}
      />,
    );
  }

  return (
    <Form
      key={inputKey}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Translate" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea id="ttsInput" title="Text" placeholder="Enter text to translate..." />
      <Form.Checkbox
        id="enableVocabulary"
        label="Vocabulary breakdown for words or phrases"
        value={enableVocabularyBreakdown}
        onChange={setEnableVocabularyBreakdown}
      />
      <Form.Checkbox
        id="enableVerbTenses"
        label="Analyze Verb Tenses"
        value={enableVerbTenses}
        onChange={setEnableVerbTenses}
      />
      <Form.Separator></Form.Separator>
      <Form.Checkbox id="enableSpeech" label="Enable Speech" value={enableSpeech} onChange={setEnableSpeech} />
    </Form>
  );
}
