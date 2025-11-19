import type { ReactNode } from "react";
import {
    type LayoutSettings as layout,
} from "./settings";

export type LayoutSettings = layout;

export type Settings = { [K in keyof LayoutSettings]: LayoutSettings[K]["default"] };
type SettingLayoutTypes = "range" | "text" | "checkbox" | "color" | "radio" | "select" | "custom" | "multiSelect" | "multiNumber";

export interface LayoutGroup {
    settings: Partial<LayoutSettings>;
    name: string;
}

export interface Setting<T> {
    type: SettingLayoutTypes;
    default: T;
    helpText?: string | ReactNode;
    label: string;
    hidden?: boolean | ((settings: Settings) => boolean);
}

export interface RangeSetting extends Setting<number> {
    type: "range";
    min: number;
    max: number;
    stepSize?: number;
    valueFormatter?: (value: number) => string;
}

export interface TextSetting extends Setting<string> {
    type: "text";
}

export interface CheckboxSetting extends Setting<boolean> {
    type: "checkbox";
}

export interface ColorSetting extends Setting<string> {
    type: "color";
}

export interface RadioSetting extends Setting<string> {
    type: "radio";
    options: { label: string; value: string }[];
}

export interface SelectSetting<T extends string | number> extends Setting<T> {
    type: "select";
    options: {value: T, label: string, icon?: ReactNode}[] | ((settings: Settings) => {value: T, label: string, icon?: ReactNode}[]);
}

export interface MultiSelectSetting<T extends string> extends Setting<T[]> {
    type: "multiSelect";
    options: {value: T, label: string, icon?: ReactNode | (() => Promise<{ default: React.ComponentType }>)}[];
}

export interface MultiNumberSetting extends Setting<number[]> {
    type: "multiNumber";
    min: number;
    max: number;
}

export interface CustomSetting<T> extends Setting<T> {
    type: "custom";
    render: (value: T, onChange: (value: T) => void) => ReactNode;
}

export function defineSettings(settings: LayoutGroup[]) {
    return settings;
}

export function isRangeSetting(setting: Setting<unknown>): setting is RangeSetting {
    return setting.type === "range";
}

export function isTextSetting(setting: Setting<unknown>): setting is TextSetting {
    return setting.type === "text";
}

export function isCheckboxSetting(setting: Setting<unknown>): setting is CheckboxSetting {
    return setting.type === "checkbox";
}

export function isColorSetting(setting: Setting<unknown>): setting is ColorSetting {
    return setting.type === "color";
}

export function isRadioSetting(setting: Setting<unknown>): setting is RadioSetting {
    return setting.type === "radio";
}

export function getDefaultSettings(layout: LayoutGroup[]): Settings {
    const defaultSettings: Partial<Settings> = {};

    for (const group of layout) {
        Object.assign(
            defaultSettings,
            Object.fromEntries(
                (Object.keys(group.settings) as (keyof LayoutSettings)[]).reduce<
                    [keyof Settings, Settings[keyof Settings]][]
                >((accumulator, current) => {
                    const value = group.settings[current];
                    if (value === undefined) return accumulator;
                    accumulator.push([current, value.default]);
                    return accumulator;
                }, [])
            ) as Settings
        );
    }

    return defaultSettings as Settings;
}