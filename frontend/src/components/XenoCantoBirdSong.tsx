import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Button } from "./Button";
import PauseIcon from "../assets/icons/pause.svg?react";
import PlayIcon from "../assets/icons/play.svg?react";

interface XenoCantoBirdSongProps {
    recording: XenoCantoRecording;
    selectable?: boolean;
    isSelected?: boolean;
    onSelectChange?: (selected: boolean) => void;
}

export function XenoCantoBirdSong({ recording, selectable, isSelected, onSelectChange }: XenoCantoBirdSongProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");
        return `${min}:${sec}`;
    };

    const getDurationInSeconds = (length: string) => {
        const [min, sec] = length.split(":").map(Number);
        return min * 60 + sec;
    };

    const getScaleFactor = (length: string) => {
        const sec = getDurationInSeconds(length);
        const perfectLength = 9.5; // seconds
        if (sec < perfectLength) {
            return perfectLength / sec;
        }

        return 1;
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);

        audio.addEventListener("timeupdate", updateTime);
        return () => {
            audio.removeEventListener("timeupdate", updateTime);
        };
    }, [recording]);

    const togglePlay = (e: MouseEvent) => {
        e.stopPropagation();
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div
            onClick={() => {
                if (selectable) {
                    onSelectChange && onSelectChange(!isSelected);
                }
            }}
            className={`max-w-xl w-full rounded-lg shadow-sm flex flex-col gap-1 overflow-hidden pb-2 ${selectable ? "cursor-pointer hover:border-blue-500 hover:ring-2 hover:ring-blue-100" : ""} ${selectable && isSelected ? "border-blue-500 border-2 ring-2 ring-blue-100" : "border border-gray-300/30"}`}
        >
            <div className="relative w-full overflow-hidden h-20">
                <img
                    src={fixLink(recording.sono.med)}
                    alt="Sonogram"
                    className="w-full transform origin-left h-full sono"
                    style={{
                        transform: `scaleX(${getScaleFactor(recording.length)})`,
                        filter: "brightness(0.95)",
                    }}
                />
                <div
                    className="absolute top-0 left-0 right-0  bottom-0 bg-blue-500/30 transition-all z-10000"
                    style={{
                        width: `${(currentTime / getDurationInSeconds(recording.length)) * 100}%`,
                    }}
                />
            </div>

            <audio
                ref={audioRef}
                src={fixLink(recording.osci.med).split("/wave")[0] + "/" + recording["file-name"]}
                onEnded={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                }}
            />

            <div className="flex flex-row justify-between mt-1 px-2">
                <div className="flex flex-row gap-2">
                    <Button
                        onClick={togglePlay}
                        className="text-white rounded cursor-pointer flex items-center justify-center shrink-0 w-10 h-10"
                    >
                        {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                    </Button>
                    <div>
                        <h2 className="text-md font-semibold">{recording.en}</h2>
                        <div className="text-xs text-gray-500">
                            {recording.rec}, XC{recording.id}, Aufrufbar unter{" "}
                            <a
                                target="_blank"
                                className="text-blue-500 underline"
                                href={`https://xeno-canto.org/${recording.id}`}
                            >
                                https://xeno-canto.org/{recording.id}
                            </a>
                        </div>
                    </div>
                </div>
                <div className="text-gray-500 text-xs">
                    <span>{formatTime(currentTime)}</span>
                    <span className="mx-1">/</span>
                    <span>{recording.length}</span>
                </div>
            </div>
        </div>
    );
}

function fixLink(link: string) {
    if (link.startsWith("https://")) {
        return link;
    }
    if (link.startsWith("//")) {
        return `https:${link}`;
    }
    return link;
}

export interface XenoCantoApiResponse {
    numRecordings: number;
    numSpecies: number;
    numPages: number;
    page: number;
    recordings: XenoCantoRecording[];
}

export interface XenoCantoRecording {
    id: string;
    gen: string;
    sp: string;
    ssp: string;
    grp: string;
    en: string;
    rec: string;
    cnt: string;
    loc: string;
    lat: string;
    lon: string;
    alt: string;
    type: string;
    sex: string;
    stage: string;
    method: string;
    url: string;
    file: string;
    "file-name": string;
    sono: {
        small: string;
        med: string;
        large: string;
        full: string;
    };
    osci: {
        small: string;
        med: string;
        large: string;
    };
    lic: string;
    q: string;
    length: string;
    time: string;
    date: string;
    uploaded: string;
    also: string[];
    rmk: string;
    "animal-seen": string;
    "playback-used": string;
    temp: string;
    regnr: string;
    auto: string;
    dvc: string;
    mic: string;
    smp: string;
}
