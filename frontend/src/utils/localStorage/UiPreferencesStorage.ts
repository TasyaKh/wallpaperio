import { LOCAL_STORAGE_KEYS } from "@/constants/localStorageKeys";

export class UiPreferencesStorage {
  static setShowPrompt(value: boolean) {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.SHOW_PROMPT,
      value ? "true" : "false"
    );
  }

  static getShowPrompt(defaultValue = false): boolean {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SHOW_PROMPT);
    return stored !== null ? stored === "true" : defaultValue;
  }
}
