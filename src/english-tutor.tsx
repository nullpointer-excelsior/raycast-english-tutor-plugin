import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { TutorResultDetail } from "./components/TutorResultDetail";

interface TutorFormValues {
  inputContext: string;
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

    push(
      <TutorResultDetail
        inputContext={values.inputContext}
        inputText={values.inputText}
        onAnalyzeNew={handleAnalyzeNew}
      />,
    );
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
      <Form.TextField
        id="inputContext"
        title="What do you want to say?"
        placeholder="Type the idea you want to say in English"
      />
      <Form.TextArea
        id="inputText"
        title="Text to evaluate"
        placeholder="Type or paste your English text here... Use <word> for words you don't know in English."
      />
    </Form>
  );
}

export default function Command() {
  return <EnglishTutorForm />;
}
