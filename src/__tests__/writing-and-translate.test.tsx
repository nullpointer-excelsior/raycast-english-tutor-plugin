/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { render, screen, act } from "@testing-library/react";
import { Action, Form, showToast, useNavigation } from "@raycast/api";
import WritingTranslateCommand from "../writing-and-translate";
import { WritingTranslateDetail } from "../components/WritingTranslateDetail";

jest.mock("../components/WritingTranslateDetail", () => ({
  WritingTranslateDetail: jest.fn(() => <div data-testid="writing-translate-detail" />),
}));

const mockPush = jest.fn();
const mockOnNew = jest.fn();

describe("WritingTranslateCommand", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnNew.mockReset();
    (useNavigation as jest.Mock).mockReturnValue({ push: mockPush, pop: jest.fn() });
  });

  it("renders the form with a text area", () => {
    render(<WritingTranslateCommand />);

    expect(screen.getByTestId("form")).toBeTruthy();
    expect(screen.getByTestId("form-textarea-inputText")).toBeTruthy();
  });

  it("shows a failure toast when the input is empty", async () => {
    render(<WritingTranslateCommand />);
    const onSubmit = (Action.SubmitForm as unknown as jest.Mock).mock.calls[0][0].onSubmit;

    await onSubmit({ inputText: "" });

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Please enter some Spanish text." }),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows a failure toast when the input contains only whitespace", async () => {
    render(<WritingTranslateCommand />);
    const onSubmit = (Action.SubmitForm as unknown as jest.Mock).mock.calls[0][0].onSubmit;

    await onSubmit({ inputText: "   \n\t  " });

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Please enter some Spanish text." }),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("pushes the detail view when a valid input is submitted", async () => {
    render(<WritingTranslateCommand />);
    const onSubmit = (Action.SubmitForm as unknown as jest.Mock).mock.calls[0][0].onSubmit;

    await onSubmit({ inputText: "Hola mundo" });

    expect(showToast).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledTimes(1);

    const pushedElement = mockPush.mock.calls[0][0];
    expect(pushedElement.type).toBe(WritingTranslateDetail);
    expect(pushedElement.props.inputText).toBe("Hola mundo");
    expect(typeof pushedElement.props.onNew).toBe("function");
  });

  it("re-renders the form when the pushed onNew callback is called", async () => {
    render(<WritingTranslateCommand />);
    const onSubmit = (Action.SubmitForm as unknown as jest.Mock).mock.calls[0][0].onSubmit;
    await onSubmit({ inputText: "Hola mundo" });

    const formCallsBefore = (Form as unknown as jest.Mock).mock.calls.length;
    const pushedElement = mockPush.mock.calls[0][0];

    act(() => {
      pushedElement.props.onNew();
    });

    const formCallsAfter = (Form as unknown as jest.Mock).mock.calls.length;
    expect(formCallsAfter).toBeGreaterThan(formCallsBefore);
  });
});
