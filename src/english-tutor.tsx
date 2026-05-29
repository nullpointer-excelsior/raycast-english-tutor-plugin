import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { TutorResultDetail } from "./components/TutorResultDetail";

interface TutorFormValues {
  inputText: string;
}

function EnglishTutorForm() {
  const { push } = useNavigation();
  const [inputKey, setInputKey] = useState(0);

  function handleAnalyzeNew() {
    setInputKey((k) => k + 1);
  }

  async function handleSubmit(values: TutorFormValues) {
    if (!values.inputText?.trim()) {
      await showToast({ style: Toast.Style.Failure, title: "Please enter some text to analyze." });
      return;
    }

    push(<TutorResultDetail inputText={values.inputText} onAnalyzeNew={handleAnalyzeNew} />);
  }

  return (
    <Form
      key={inputKey}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Analyze" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="inputText"
        title="Text"
        placeholder="Type or paste your English text here... Use <word> for words you don't know in English."
      />
    </Form>
  );
}

export default function Command() {
  return <EnglishTutorForm />;
}
