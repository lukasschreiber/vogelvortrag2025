import { useSettings } from "../../hooks/useSettings";
import { Checkbox } from "../Checkbox";
import { Modal } from "../Modal";
import { Select } from "../Select";

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
    const { settings, layout, set } = useSettings();

    return (
        <Modal open={open} onClose={onClose} title="Einstellungen" size="lg">
            <div className="flex flex-col gap-2">
                {layout.map((group) => (
                    <div key={group.name} className="flex flex-col gap-2">
                        <h2 className="text-lg font-bold">{group.name}</h2>
                        <div className="flex flex-col gap-4">
                            {Object.entries(group.settings).map(([_key, setting]) => {
                                const key = _key as keyof typeof settings;

                                if (
                                    setting.hidden &&
                                    (typeof setting.hidden === "function" ? setting.hidden(settings) : setting.hidden)
                                ) {
                                    return null;
                                }

                                if (setting.type === "checkbox") {
                                    return (
                                        <div key={key} className="flex flex-col gap-0.5">
                                            <Checkbox
                                                id={key}
                                                label={setting.label}
                                                value={settings[key] as boolean}
                                                onChange={(value) => set(key, value)}
                                                className="flex flex-col"
                                            />
                                            <span className="text-black/80 text-xs">{setting.helpText}</span>
                                        </div>
                                    );
                                } else if (setting.type === "select") {
                                    return (
                                        <div key={key} className="flex flex-col gap-1">
                                            <div className="w-full">
                                                <Select
                                                    label={setting.label}
                                                    key={key}
                                                    id={key}
                                                    value={settings[key] as string}
                                                    options={setting.options as { value: string; label: string }[]}
                                                    // @ts-expect-error ...
                                                    onChange={(e) => set(key, e.target.value)}
                                                />
                                            </div>
                                            <span className="text-black/80 text-xs">{setting.helpText}</span>
                                        </div>
                                    );
                                } else if (setting.type === "range") {
                                    return (
                                        <div key={key} className="flex flex-col">
                                            <label className="text-sm font-medium text-gray-700">
                                                {setting.label} (
                                                {setting.valueFormatter
                                                    ? setting.valueFormatter(settings[key] as number)
                                                    : settings[key]}
                                                )
                                            </label>
                                            <input
                                                type="range"
                                                min={setting.min}
                                                max={setting.max}
                                                step={setting.stepSize}
                                                value={settings[key] as number}
                                                onChange={(e) => set(key, parseFloat(e.target.value))}
                                            />
                                            <span className="text-black/80 text-xs">{setting.helpText}</span>
                                        </div>
                                    );
                                    // } else if (setting.type === "color") {
                                    //     return (
                                    //         <div key={key} className="flex flex-col">
                                    //             <label>{setting.label}</label>
                                    //             <div>Not implemented</div>
                                    //             <span className="text-black/80">{setting.helpText}</span>
                                    //         </div>
                                    //     );
                                }
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
}
