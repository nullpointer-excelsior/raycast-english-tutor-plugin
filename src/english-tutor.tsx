import { Action, ActionPanel, Form, Icon, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { TutorResultDetail } from "./components/TutorResultDetail";
import { useRandomPhrase } from "./hooks/useRandomPhrase";
import { PROFICIENCY_LEVELS, ProficiencyLevel } from "./libs/models/proficiency-level.model";

interface TutorFormValues {
  inputContext: string;
  inputText: string;
}

function EnglishTutorForm() {
  const { push } = useNavigation();
  const [inputKey, setInputKey] = useState(0);
  const [inputContext, setInputContext] = useState("");
  const { generate, loading } = useRandomPhrase();

  function handleAnalyzeNew() {
    setInputKey((k) => k + 1);
  }

  async function handleGenerateRandomPhrase(level: ProficiencyLevel) {
    const toast = await showToast({ style: Toast.Style.Animated, title: `Generating ${level} phrase...` });
    const phrase = await generate(level);
    if (phrase) {
      setInputContext(phrase);
      toast.style = Toast.Style.Success;
      toast.title = `${level} phrase added — now translate it to English below`;
    } else {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to generate phrase";
    }
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
      isLoading={loading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Analyze" onSubmit={handleSubmit} />
          <ActionPanel.Submenu
            title="Generate Random Phrase"
            icon={Icon.Wand}
            shortcut={{ modifiers: ["cmd"], key: "g" }}
          >
            {PROFICIENCY_LEVELS.map((level) => (
              <Action key={level} title={level} onAction={() => handleGenerateRandomPhrase(level)} />
            ))}
          </ActionPanel.Submenu>
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="inputContext"
        title="Context / Intention (optional)"
        placeholder="What you want to say — in Spanish. Press ⌘G to generate a random phrase to translate into English."
        info="Optional. Helps the tutor understand your intention. Use ⌘G to generate a random Spanish phrase to practice translating it."
        value={inputContext}
        onChange={setInputContext}
      />
      <Form.Separator />
      <Form.TextArea
        id="inputText"
        title="Your English text to evaluate"
        placeholder="Write your English translation here. Use <word> for words you don't know in English."
        autoFocus
      />
    </Form>
  );
}

export default function Command() {
  return <EnglishTutorForm />;
}
