# English Tutor

A Raycast extension that helps you correct and improve your English writing using AI, and translate text between English and Spanish with text-to-speech playback.

## Features

### English Tutor
- Corrects grammar and spelling errors in your English text.
- Provides a list of corrections, errors found, and suggestions.
- Translates Spanish text into English.
- Handles mixed input: wrap unknown words in `<>` to get the English translation inline (e.g., `I want to <ser libre>`).
- Returns the corrected text ready to copy to clipboard.

### Text to Speech
- Translates text between English and Spanish automatically (language is auto-detected).
- Plays the translation out loud using OpenAI's TTS with Marin's voice.
- Optionally enables auto-play on result, or triggers playback manually.
- Supports up to 4096 characters per request.

## Requirements

- [Raycast](https://raycast.com/) installed on macOS.
- An [OpenAI API Key](https://platform.openai.com/api-keys) with access to:
  - `gpt-4o-mini` (English Tutor)
  - `gpt-4.1-nano` (translation)
  - `gpt-4o-mini-tts` (text to speech)

## Configuration

On first use, Raycast will prompt you to enter your **OpenAI API Key** in the extension preferences. You can also update it at any time via:

`Raycast → Extensions → English Tutor → Preferences`

| Preference | Type | Required | Description |
|---|---|---|---|
| `OpenAI API Key` | Password | Yes | Your personal OpenAI API key |

## Local Deployment

Follow these steps to run the extension locally without publishing it to the Raycast Store.

### 1. Prerequisites

- Node.js >= 18
- npm >= 9
- Raycast installed

### 2. Clone and install dependencies

```bash
git clone <repository-url>
cd english-tutor
npm install
```

### 3. Run in development mode

```bash
npm run dev
```

This registers the extension in Raycast under the **Development** section of the root search. The terminal process must remain running for the extension to stay active.

### 4. Switch to production environment (recommended)

By default the extension runs in `development` mode. To get optimized performance:

1. Open **Raycast Preferences** (`Cmd` + `,`).
2. Go to the **Advanced** tab.
3. Find the **Node Environment** setting and switch it from `development` to **`production`**.

The extension will now run with production optimizations while still being served from your local machine.

> **Note:** The `npm run dev` process must stay active in your terminal. Closing it removes the extension from Raycast.

## Available Commands

| Command | Description |
|---|---|
| `English Tutor` | Analyze and correct English text |
| `Text to Speech` | Translate and listen to text in English or Spanish |

## Development

```bash
# Run linter
npm run lint

# Auto-fix lint issues
npm run fix-lint

# Build for validation
npm run build
```
