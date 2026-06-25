/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { showHUD } from "@raycast/api";
import { WritingTranslateDetail } from "../components/WritingTranslateDetail";
import { useWritingTranslate } from "../hooks/useWritingTranslate";
import { buildWritingTranslateMarkdown } from "../libs/markdown";

jest.mock("../hooks/useWritingTranslate");
jest.mock("../libs/markdown", () => ({
  buildWritingTranslateMarkdown: jest.fn(() => "## Mocked Markdown"),
}));

const mockUseWritingTranslate = useWritingTranslate as jest.Mock;
const mockBuildWritingTranslateMarkdown = buildWritingTranslateMarkdown as jest.Mock;

const MOCK_RESPONSE = {
  original_text: "Hola mundo",
  english_translation: "Hello world",
  improved_writing: "Hello, world!",
  corrections: [{ original: "Hello world", corrected: "Hello, world!", explanation: "Add punctuation." }],
};

describe("WritingTranslateDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a loading detail", () => {
    mockUseWritingTranslate.mockReturnValue({
      loading: true,
      response: undefined,
      error: undefined,
      retry: jest.fn(),
    });

    render(<WritingTranslateDetail inputText="Hola mundo" onNew={jest.fn()} />);

    expect(screen.getByTestId("detail")).toBeTruthy();
    expect(mockBuildWritingTranslateMarkdown).not.toHaveBeenCalled();
  });

  it("renders an error detail when the hook returns an error", () => {
    mockUseWritingTranslate.mockReturnValue({
      loading: false,
      response: undefined,
      error: "Something went wrong",
      retry: jest.fn(),
    });

    render(<WritingTranslateDetail inputText="Hola mundo" onNew={jest.fn()} />);

    expect(screen.getByTestId("detail").textContent).toContain("Something went wrong");
    expect(mockBuildWritingTranslateMarkdown).not.toHaveBeenCalled();
  });

  it("renders the response markdown on success", () => {
    mockUseWritingTranslate.mockReturnValue({
      loading: false,
      response: MOCK_RESPONSE,
      error: undefined,
      retry: jest.fn(),
    });

    render(<WritingTranslateDetail inputText="Hola mundo" onNew={jest.fn()} />);

    expect(screen.getByText("## Mocked Markdown")).toBeTruthy();
    expect(mockBuildWritingTranslateMarkdown).toHaveBeenCalledWith(MOCK_RESPONSE);
  });

  it("passes the input text to useWritingTranslate", () => {
    mockUseWritingTranslate.mockReturnValue({
      loading: true,
      response: undefined,
      error: undefined,
      retry: jest.fn(),
    });

    render(<WritingTranslateDetail inputText="Hola mundo" onNew={jest.fn()} />);

    expect(mockUseWritingTranslate).toHaveBeenCalledWith("Hola mundo");
  });

  it("calls retry when the retry action is triggered", () => {
    const retry = jest.fn();
    mockUseWritingTranslate.mockReturnValue({
      loading: false,
      response: undefined,
      error: "Error",
      retry,
    });

    render(<WritingTranslateDetail inputText="Hola mundo" onNew={jest.fn()} />);
    fireEvent.click(screen.getByText("Retry"));

    expect(retry).toHaveBeenCalled();
  });

  it("calls onNew from the error state", () => {
    const onNew = jest.fn();
    mockUseWritingTranslate.mockReturnValue({
      loading: false,
      response: undefined,
      error: "Error",
      retry: jest.fn(),
    });

    render(<WritingTranslateDetail inputText="Hola mundo" onNew={onNew} />);
    fireEvent.click(screen.getByText("New Translation"));

    expect(onNew).toHaveBeenCalled();
  });

  it("shows a HUD when improved writing is copied", () => {
    mockUseWritingTranslate.mockReturnValue({
      loading: false,
      response: MOCK_RESPONSE,
      error: undefined,
      retry: jest.fn(),
    });

    render(<WritingTranslateDetail inputText="Hola mundo" onNew={jest.fn()} />);
    const copyButtons = screen.getAllByTestId("action-copy-to-clipboard");
    fireEvent.click(copyButtons[0]);

    expect(showHUD).toHaveBeenCalledWith("Improved Writing Copied!");
  });

  it("shows a HUD when translation is copied", () => {
    mockUseWritingTranslate.mockReturnValue({
      loading: false,
      response: MOCK_RESPONSE,
      error: undefined,
      retry: jest.fn(),
    });

    render(<WritingTranslateDetail inputText="Hola mundo" onNew={jest.fn()} />);
    const copyButtons = screen.getAllByTestId("action-copy-to-clipboard");
    fireEvent.click(copyButtons[1]);

    expect(showHUD).toHaveBeenCalledWith("Translation Copied!");
  });

  it("calls onNew from the success state", () => {
    const onNew = jest.fn();
    mockUseWritingTranslate.mockReturnValue({
      loading: false,
      response: MOCK_RESPONSE,
      error: undefined,
      retry: jest.fn(),
    });

    render(<WritingTranslateDetail inputText="Hola mundo" onNew={onNew} />);
    fireEvent.click(screen.getByText("New Translation"));

    expect(onNew).toHaveBeenCalled();
  });
});
