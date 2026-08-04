import * as React from "react";

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

const ActionSubmitForm = jest.fn(({ title, onSubmit }: { title?: string; onSubmit?: (values: unknown) => void }) =>
  React.createElement("button", { "data-testid": "action-submit-form", onClick: onSubmit }, title),
);

const ActionCopyToClipboard = jest.fn(({ title, onCopy }: { title?: string; onCopy?: () => void }) =>
  React.createElement("button", { "data-testid": "action-copy-to-clipboard", onClick: onCopy }, title),
);

const ActionPush = jest.fn(({ title }: { title?: string }) =>
  React.createElement("button", { "data-testid": "action-push" }, title),
);

const ActionBase = jest.fn(({ title, onAction }: { title?: string; onAction?: () => void }) =>
  React.createElement("button", { "data-testid": "action", onClick: onAction }, title),
);

export const Action = Object.assign(ActionBase, {
  SubmitForm: ActionSubmitForm,
  CopyToClipboard: ActionCopyToClipboard,
  Push: ActionPush,
});

const ActionPanelSubmenu = jest.fn(({ title, children }: { title?: string; children?: React.ReactNode }) =>
  React.createElement("div", { "data-testid": "action-panel-submenu", "data-title": title }, children),
);

export const ActionPanel = Object.assign(
  jest.fn(({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "action-panel" }, children),
  ),
  { Submenu: ActionPanelSubmenu },
);

export const Detail = jest.fn(
  ({ children, markdown, actions }: { children?: React.ReactNode; markdown?: string; actions?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "detail" }, actions, children || markdown),
);

const FormTextArea = jest.fn(({ id, title }: { id?: string; title?: string }) =>
  React.createElement("textarea", { "data-testid": `form-textarea-${id}`, placeholder: title }),
);

const FormCheckbox = jest.fn(({ id, label }: { id?: string; label?: string }) =>
  React.createElement("input", { "data-testid": `form-checkbox-${id}`, type: "checkbox", value: label }),
);

const FormSeparator = jest.fn(() => React.createElement("hr", { "data-testid": "form-separator" }));

const FormDropdownItem = jest.fn(({ value, title }: { value?: string; title?: string }) =>
  React.createElement("option", { "data-testid": `form-dropdown-item-${value}`, value }, title),
);

const FormDropdown = jest.fn(
  ({ id, title, value, onChange }: { id?: string; title?: string; value?: string; onChange?: (v: string) => void }) =>
    React.createElement(
      "select",
      {
        "data-testid": `form-dropdown-${id}`,
        value,
        onChange: (e: { target: { value: string } }) => onChange?.(e.target.value),
      },
      title,
    ),
);

export const Form = Object.assign(
  jest.fn(({ children, actions }: { children?: React.ReactNode; actions?: React.ReactNode }) =>
    React.createElement("form", { "data-testid": "form" }, actions, children),
  ),
  {
    TextArea: FormTextArea,
    Checkbox: FormCheckbox,
    Separator: FormSeparator,
    Dropdown: Object.assign(FormDropdown, { Item: FormDropdownItem }),
  },
);

export const Icon = { Speaker: "speaker", Checkmark: "checkmark" };
