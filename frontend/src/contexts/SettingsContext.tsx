import React, { createContext, useCallback } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { getSettingsDefinition } from "../settings/settings";
import { getDefaultSettings, type LayoutGroup, type Settings } from "../settings/settings_definition";

export interface SettingsContextValue {
    settings: Settings;
    layout: LayoutGroup[];
    set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
    isHidden: <K extends keyof Settings>(key: K) => boolean;
}

const LOCAL_STORAGE_KEY = "vogelvortrag-settings";

// eslint-disable-next-line
export const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const layout = getSettingsDefinition();

    const [settings, setSettings] = useLocalStorage<Settings>(LOCAL_STORAGE_KEY, getDefaultSettings(layout));

    const set = useCallback(
        <K extends keyof Settings>(key: K, value: Settings[K]) => {
            setSettings((prev) => ({ ...prev, [key]: value }));
        },
        [setSettings]
    );

    const isHidden = useCallback(
        <K extends keyof Settings>(key: K) => {
            const group = layout.find((g) => Object.keys(g.settings).includes(key));
            const setting = group?.settings[key];
            if (!setting) return false;
            return typeof setting.hidden === "function" ? setting.hidden(settings) : (setting.hidden ?? false);
        },
        [settings, layout]
    );

    return <SettingsContext.Provider value={{ settings, layout, set, isHidden }}>{children}</SettingsContext.Provider>;
};
