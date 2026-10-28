import { Action, Icon, closeMainWindow, PopToRootType } from "@raycast/api";

export function CloseAction() {
  return (
    <Action
      title="Close"
      icon={Icon.XmarkCircle}
      shortcut={{ modifiers: ["cmd", "shift"], key: "w" }}
      onAction={async () => {
        await closeMainWindow({ clearRootSearch: true, popToRootType: PopToRootType.Immediate });
      }}
    />
  );
}
