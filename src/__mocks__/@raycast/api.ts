export const getPreferenceValues = jest.fn(() => ({ openaiApiKey: "test-api-key" }));

export const showToast = jest.fn();
export const showHUD = jest.fn();

export const Toast = {
  Style: {
    Animated: "animated",
    Success: "success",
    Failure: "failure",
  },
};

export const useNavigation = jest.fn(() => ({ push: jest.fn(), pop: jest.fn() }));

export const Action = {
  SubmitForm: jest.fn(),
  CopyToClipboard: jest.fn(),
  Push: jest.fn(),
};

export const ActionPanel = jest.fn();
export const Detail = jest.fn();
export const Form = Object.assign(jest.fn(), {
  TextArea: jest.fn(),
  Checkbox: jest.fn(),
});
export const Icon = { Speaker: "speaker", Checkmark: "checkmark" };
