import {
  Action,
  ActionPanel,
  Detail,
  Form,
  getPreferenceValues,
  showHUD,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { useEffect, useState } from "react";
import OpenAI, { APIError } from "openai";

const TUTOR_MODEL = "gpt-4o-mini";
const TUTOR_TEMPERATURE = 0;

const TUTOR_SYSTEM_PROMPT = `You are an expert English tutor. Help the user learn English following these instructions:

- Respond directly and as concisely as possible.
- Any English text the user provides may have errors; you must correct it and provide a list of corrections.
- Important: the corrected text MUST BE AT THE BEGINNING OF THE RESPONSE.
- If the user provides text in Spanish, you must translate it.
- Provide suggestions to improve phrases if they are in English but don't sound natural.
- Give all your responses with a summary of errors and suggestions, and finally the text the user needs or asked you to correct.
- Explain grammar, phrasal verbs, or verb tenses.
- If a phrase contains numbers, provide the written number; for example: I'm 30 → I'm thirty (30).
- The user may provide English text with Spanish words enclosed in "<>", which means they don't know how to say that word in English; provide the translation in the corrected text.
  Examples:
    - I want to <ser libre> → "I want to break free"
    - He <tenía que ir a trabajar> on Sunday → "He had to go to work on Sunday"
- Provide the English lesson with a short, appropriate English name to help the user learn from their mistakes.

Respond ONLY with valid JSON matching this schema:
{
  "corrected_text": "string",
  "corrections": ["string"],
  "errors": ["string"],
  "suggestions": ["string"]
}`;

interface Preferences {
  openaiApiKey: string;
}

interface TutorFormValues {
  inputText: string;
}

interface TutorResponse {
  corrected_text: string;
  corrections: string[];
  errors: string[];
  suggestions: string[];
}

function buildMarkdown(response: TutorResponse): string {
  const fmt = (items: string[]) => (items.length > 0 ? items.map((i) => `- ${i}`).join("\n") : "None");
  return [
    `## ✅ Corrected Text\n${response.corrected_text}`,
    `## ❌ Errors\n${fmt(response.errors)}`,
    `## 📝 Corrections\n${fmt(response.corrections)}`,
    `## 💡 Suggestions\n${fmt(response.suggestions)}`,
  ].join("\n\n");
}

async function analyzeText(apiKey: string, inputText: string): Promise<TutorResponse> {
  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: TUTOR_MODEL,
    temperature: TUTOR_TEMPERATURE,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: TUTOR_SYSTEM_PROMPT },
      { role: "user", content: inputText },
    ],
  });

  const content = completion.choices[0].message.content ?? "";
  let parsed: TutorResponse;
  try {
    parsed = JSON.parse(content) as TutorResponse;
  } catch {
    throw new Error("Unexpected AI response format");
  }

  return {
    corrected_text: parsed.corrected_text ?? "",
    corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],
    errors: Array.isArray(parsed.errors) ? parsed.errors : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
  };
}

interface TutorDetailProps {
  inputText: string;
  apiKey: string;
  onAnalyzeNew: () => void;
}

function TutorDetail({ inputText, apiKey, onAnalyzeNew }: TutorDetailProps) {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<TutorResponse | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    setResponse(undefined);

    analyzeText(apiKey, inputText)
      .then((result) => {
        if (!cancelled) {
          setResponse(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        let message = "Network error. Check your connection.";
        if (err instanceof APIError) {
          message = err.status === 401 ? "Invalid OpenAI API Key. Check your preferences." : err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        showToast({ style: Toast.Style.Failure, title: message });
        setError(message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  function handleRetry() {
    setRetryCount((c) => c + 1);
  }

  if (loading) {
    return <Detail isLoading={true} markdown="" />;
  }

  if (error) {
    return (
      <Detail
        markdown={`## ⚠️ Error\n\n${error}`}
        actions={
          <ActionPanel>
            <Action title="Retry" shortcut={{ modifiers: ["cmd"], key: "r" }} onAction={handleRetry} />
            <Action title="Analyze New Text" shortcut={{ modifiers: ["cmd"], key: "n" }} onAction={onAnalyzeNew} />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <Detail
      markdown={buildMarkdown(response!)}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="Copy Corrected Text"
            content={response!.corrected_text}
            onCopy={() => showHUD("Corrected Text Copied!")}
          />
          <Action title="Analyze New Text" shortcut={{ modifiers: ["cmd"], key: "n" }} onAction={onAnalyzeNew} />
        </ActionPanel>
      }
    />
  );
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

    const { openaiApiKey } = getPreferenceValues<Preferences>();

    push(<TutorDetail inputText={values.inputText} apiKey={openaiApiKey} onAnalyzeNew={handleAnalyzeNew} />);
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
