# English Tutor

Raycast extension for macOS/Windows that improves English writing with AI-powered grammar feedback, translation, and text-to-speech via the OpenAI API. Four view-mode commands: English Tutor, Speech to text, Quick Translator, and Writing & Translate.

## Overview

Read the **overview** artifacts for project context:

- `artifacts/overview/summary.md`: project purpose, capabilities, and the four commands
- `artifacts/overview/stack.md`: core frameworks and runtimes
- `artifacts/overview/architecture.md`: module interactions, design patterns, and folder structure
- `artifacts/overview/dependencies.md`: external libraries with exact versions
- `artifacts/overview/commands.md`: CLI commands to build, lint, and test
- `artifacts/overview/testing.md`: how to write, place, and run tests
- `artifacts/overview/deploy.md`: publishing to the Raycast Store

## Restrictions

- Reserved Raycast keyboard shortcuts must not be used in action `shortcut` props (Raycast removes them at runtime with a warning): Escape and `cmd+escape`, `Enter` and `cmd+enter`, `cmd+k`, `cmd+w`. The Close action uses `cmd+shift+w`.
- Do not intercept the Esc key in a command root view; Esc behavior is native to Raycast and governed by the user's "Pop to Root Search" preference.
- Never close windows or pop navigation without clearing state intentionally; use `closeMainWindow({ clearRootSearch: true, popToRootType: PopToRootType.Immediate })` (see `src/components/CloseAction.tsx`).
