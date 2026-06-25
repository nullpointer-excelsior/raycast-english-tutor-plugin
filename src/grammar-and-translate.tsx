import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { GrammarTranslateDetail } from "./components/GrammarTranslateDetail";

interface GrammarTranslateFormValues {
  inputText: string;
}

function GrammarTranslateForm() {
  const { push } = useNavigation();
  const [inputKey, setInputKey] = useState(0);

  function handleNew() {
    setInputKey((k) => k + 1);
  }

  async function handleSubmit(values: GrammarTranslateFormValues) {
    if (!values.inputText?.trim()) {
      await showToast({ style: Toast.Style.Failure, title: "Please enter some Spanish text." });
      return;
    }

    push(<GrammarTranslateDetail inputText={values.inputText} onNew={handleNew} />);
  }

  return (
    <Form
      key={inputKey}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Correct & Translate" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="inputText"
        title="Spanish Text"
        placeholder="Enter Spanish text to correct grammar/spelling and translate to English..."
      />
    </Form>
  );
}

export default function Command() {
  return <GrammarTranslateForm />;
}
