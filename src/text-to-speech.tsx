import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { APIError } from "openai";
import { createOpenAIClient } from "./libs/openai-client";
import { translateText } from "./libs/translation-service";
import { TranslationDetail } from "./components/TranslationDetail";

const TTS_MAX_CHARS = 4096;

interface TtsFormValues {
  ttsInput: string;
  enableSpeech: boolean;
}

export default function TextToSpeechCommand() {
  const [enableSpeech, setEnableSpeech] = useState(true);
  const { push } = useNavigation();

  async function handleSubmit(values: TtsFormValues) {
    if (values.ttsInput.length > TTS_MAX_CHARS) {
      await showToast({ style: Toast.Style.Failure, title: "Text too long (max 4096 characters)." });
      return;
    }

    const toast = await showToast({ style: Toast.Style.Animated, title: "Translating text..." });
    const openai = createOpenAIClient();

    let translatedText: string;
    try {
      translatedText = await translateText(openai, values.ttsInput);
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
      <TranslationDetail
        originalText={values.ttsInput}
        translatedText={translatedText}
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
      <Form.Checkbox id="enableSpeech" label="Enable Speech" value={enableSpeech} onChange={setEnableSpeech} />
    </Form>
  );
}
