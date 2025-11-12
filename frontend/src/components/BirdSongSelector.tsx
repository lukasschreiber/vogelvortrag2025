import { useEffect, useMemo, useState } from "react";
import type { BirdSpecies } from "../data/types";
import { XenoCantoBirdSong, type XenoCantoApiResponse, type XenoCantoRecording } from "./XenoCantoBirdSong";
import { Input } from "./Input";
import { Select } from "./Select";

interface BirdSongSelectorProps {
    species: BirdSpecies;
    area?: string;
    quality?: "A" | "B" | "C" | "D";
    onBirdSongsChange: (songs: XenoCantoRecording[]) => void;
    selectedSongs: XenoCantoRecording[];
    maxSelectable?: number;
}

export function BirdSongSelector({ species, area, maxSelectable, onBirdSongsChange, selectedSongs, quality = "A" }: BirdSongSelectorProps) {
    const [availableRecordings, setAvailableRecordings] = useState<XenoCantoRecording[]>([]);
    const [showResultsNumber, setShowResultsNumber] = useState<number>(4);
    const [country, setCountry] = useState<string | undefined>(undefined);
    const [type, setType] = useState<
        "song" | "call" | "social call" | "drumming" | "alarm call" | "pecking" | "hammering" | undefined
    >(undefined);
    const [maxLength, setMaxLength] = useState<number | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const url = useMemo(() => {
        const queryParts: string[] = [];

        if (species) queryParts.push(`sp:"${encodeURIComponent(species.scientificName)}"`);
        if (area) queryParts.push(`area:"${encodeURIComponent(area)}"`);
        if (type) queryParts.push(`type:"${encodeURIComponent(type)}"`);
        if (quality) queryParts.push(`q:"${encodeURIComponent(quality)}"`);
        if (maxLength !== undefined) queryParts.push(`len:"<${maxLength}"`);
        if (country) queryParts.push(`cnt:"${encodeURIComponent(country)}"`);

        const query = queryParts.join("+");

        return `https://xeno-canto.org/api/3/recordings?query=${query}&key=05461395bfe19881f0ec99497a395e16b12bbae4`;
    }, [species, area, type, quality, maxLength, country]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const response = await fetch(url);
                const data: XenoCantoApiResponse = await response.json();
                setAvailableRecordings(data.recordings);
                setShowResultsNumber(4);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching recording data:", error);
            }
        })();
    }, [url]);

    return (
        <div className="pt-2 mt-4">
            <label className="block text-md font-semibold text-gray-700">
                Vogelgesänge auswählen (von Xeno Canto)
            </label>
            <div className="mb-2 text-xs text-gray-500">
                Maximal {maxSelectable ? maxSelectable : "beliebig viele"} Vogelgesänge auswählbar ({selectedSongs.length} ausgewählt)
            </div>

            <div className="flex flex-row gap-2 p-1 px-2 bg-gray-100 rounded-lg mb-2">
                <Input
                    label="Land"
                    value={country || "Germany"}
                    onChange={(e) => setCountry(e.target.value || undefined)}
                    placeholder="z.B. Germany"
                />
                <Input
                    label="Maximale Länge in Sekunden"
                    type="number"
                    value={maxLength !== undefined ? maxLength : ""}
                    onChange={(e) => {
                        const val = e.target.value;
                        setMaxLength(val ? parseInt(val) : undefined);
                    }}
                    placeholder="z.B. 30"
                />
                <Select
                    label="Vogelgesangstyp"
                    value={type || ""}
                    onChange={(e) => setType(e.target.value || (undefined as any))}
                    options={[
                        { value: "", label: "Alle Typen" },
                        { value: "song", label: "Lied" },
                        { value: "call", label: "Ruf" },
                        { value: "social call", label: "Sozialer Ruf" },
                        { value: "drumming", label: "Trommeln" },
                        { value: "alarm call", label: "Alarmruf" },
                        { value: "pecking", label: "Picken" },
                        { value: "hammering", label: "Hämmern" },
                    ]}
                />
            </div>
            {!species.scientificName || species.scientificName.trim() === "" ? (
                <p className="text-sm text-gray-500">
                    Bitte geben Sie zuerst den wissenschaftlichen Namen der Vogelart ein, um Vogelgesänge hinzuzufügen.
                </p>
            ) : (
                <div>
                    {isLoading ? (
                        <p className="text-sm text-gray-500">Lade Vogelgesänge...</p>
                    ) : availableRecordings.length === 0 ? (
                        <p className="text-sm text-gray-500">Keine Vogelgesänge gefunden.</p>
                    ) : (
                        <>
                            <div className="gap-2 grid grid-cols-2">
                                {availableRecordings
                                    .slice(0, Math.min(showResultsNumber, availableRecordings.length))
                                    .map((recording) => (
                                        <XenoCantoBirdSong key={recording.id} recording={recording} selectable
                                            isSelected={selectedSongs.find((r) => r.id === recording.id) !== undefined}
                                            onSelectChange={(selected) => {
                                                let newSelectedSongs: XenoCantoRecording[] = [];
                                                if (selected) {
                                                    // Add song
                                                    if (
                                                        !maxSelectable ||
                                                        selectedSongs.length < maxSelectable
                                                    ) {
                                                        newSelectedSongs = [...selectedSongs, recording];
                                                    } else {
                                                        newSelectedSongs = [...selectedSongs];
                                                    }
                                                } else {
                                                    // Remove song
                                                    newSelectedSongs = selectedSongs.filter((r) => r.id !== recording.id);
                                                }
                                                onBirdSongsChange(newSelectedSongs);
                                            }}
                                        />
                                    ))}
                            </div>
                            {showResultsNumber < availableRecordings.length && (
                                <button
                                    className="mt-2 text-blue-500 underline cursor-pointer text-xs"
                                    onClick={() => setShowResultsNumber((prev) => prev + 4)}
                                >
                                    Weitere Vogelstimmen Anzeigen...
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
