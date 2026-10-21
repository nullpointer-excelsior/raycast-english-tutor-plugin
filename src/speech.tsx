import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { createOpenAIClient } from "./libs/openai-client";
import { SpeechDetail } from "./components/SpeechDetail";

const TTS_MAX_CHARS = 4096;

interface SpeechFormValues {
  text: string;
  enableSpeech: boolean;
}

export default function SpeechCommand() {
  const [enableSpeech, setEnableSpeech] = useState(true);
  const { push } = useNavigation();

  async function handleSubmit(values: SpeechFormValues) {
    if (values.text.length > TTS_MAX_CHARS) {
      await showToast({ style: Toast.Style.Failure, title: "Text too long (max 4096 characters)." });
      return;
    }

    push(<SpeechDetail text={values.text} autoPlay={values.enableSpeech} openai={createOpenAIClient()} />);
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Speak" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea id="text" title="Text" placeholder="Enter text to speak..." />
      <Form.Checkbox id="enableSpeech" label="Auto-play Speech" value={enableSpeech} onChange={setEnableSpeech} />
    </Form>
  );
}
