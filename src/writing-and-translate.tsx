import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { WritingTranslateDetail } from "./components/WritingTranslateDetail";

interface WritingTranslateFormValues {
  inputText: string;
}

function WritingTranslateForm() {
  const { push } = useNavigation();
  const [inputKey, setInputKey] = useState(0);

  function handleNew() {
    setInputKey((k) => k + 1);
  }

  async function handleSubmit(values: WritingTranslateFormValues) {
    if (!values.inputText?.trim()) {
      await showToast({ style: Toast.Style.Failure, title: "Please enter some Spanish text." });
      return;
    }

    push(<WritingTranslateDetail inputText={values.inputText} onNew={handleNew} />);
  }

  return (
    <Form
      key={inputKey}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Translate & Improve Writing" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="inputText"
        title="Spanish Text"
        placeholder="Enter Spanish text to translate to English and improve its writing..."
      />
    </Form>
  );
}

export default function Command() {
  return <WritingTranslateForm />;
}
