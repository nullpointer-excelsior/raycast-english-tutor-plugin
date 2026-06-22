import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { APIError } from "openai";
import { createOpenAIClient } from "./libs/openai-client";
import { translate } from "./libs/guided-translation-service";
import { GuidedTranslationDetail } from "./components/GuidedTranslationDetail";
import { GuidedTranslationModel, TranslationOptions } from "./libs/models/guided-translation.model";

const TTS_MAX_CHARS = 4096;

interface TranslateFormValues {
  ttsInput: string;
  enableVocabulary: boolean;
  enableVerbTenses: boolean;
  enableAlternatives: boolean;
  enableSpeech: boolean;
}

export default function TranslateCommand() {
  const [enableSpeech, setEnableSpeech] = useState(false);
  const [enableAlternativeWays, setEnableAlternativeWays] = useState(true);
  const [enableVerbTenses, setEnableVerbTenses] = useState(true);
  const [enableVocabularyBreakdown, setEnableVocabularyBreakdown] = useState(true);
  const { push } = useNavigation();

  async function handleSubmit(values: TranslateFormValues) {
    if (values.ttsInput.length > TTS_MAX_CHARS) {
      await showToast({ style: Toast.Style.Failure, title: "Text too long (max 4096 characters)." });
      return;
    }

    const toast = await showToast({ style: Toast.Style.Animated, title: "Translating text..." });
    const openai = createOpenAIClient();

    const options: TranslationOptions = {
      enableVocabulary: values.enableVocabulary,
      enableVerbTenses: values.enableVerbTenses,
      enableAlternatives: values.enableAlternatives,
    };

    let model: GuidedTranslationModel;
    try {
      model = await translate(openai, values.ttsInput, options);
    } catch (err) {
      if (err instanceof APIError) {
        toast.style = Toast.Style.Failure;
        toast.title = err.status === 401 ? "Invalid OpenAI API Key. Check your preferences." : err.message;
        return;
      }
      throw err;
    }

    toast.style = Toast.Style.Success;
    toast.title = "Translation ready";

    push(
      <GuidedTranslationDetail
        originalText={values.ttsInput}
        model={model}
        enableSpeech={values.enableSpeech}
        openai={openai}
      />,
    );
  }

  return (
    <Form
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
      <Form.Checkbox
        id="enableAlternatives"
        label="Add alternative ways to say it"
        value={enableAlternativeWays}
        onChange={setEnableAlternativeWays}
      />
      <Form.Separator></Form.Separator>
      <Form.Checkbox id="enableSpeech" label="Enable Speech" value={enableSpeech} onChange={setEnableSpeech} />
    </Form>
  );
}
