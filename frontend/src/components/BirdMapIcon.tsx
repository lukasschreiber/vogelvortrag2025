import L from "leaflet";
import { useMemo } from "react";
import { Marker } from "react-leaflet";
import { createRoot } from "react-dom/client";
import { BirdImage as BirdImageComp } from "./BirdImage";
import CheckIcon from "../assets/icons/check.svg?react";
import PlayIcon from "../assets/icons/play.svg?react";
import PauseIcon from "../assets/icons/pause.svg?react";
import type { BirdImage } from "../data/types";
import { fixLink, type XenoCantoRecording } from "./XenoCantoBirdSong";

interface BirdMarkerIconProps {
    position: L.LatLngExpression;
    image?: BirdImage;
    visited?: boolean;
    blurredImage?: boolean;
    borderColor?: string;
    size?: number;
    className?: string;
    audio?: XenoCantoRecording;
    onClick?: () => void;
}

/**
 * A React Leaflet marker whose icon is a React component rendered into a Leaflet DivIcon.
 * If the marker has audio, only clicks on the border trigger `onClick`.
 */
export function BirdMarkerIcon({
    position,
    image,
    visited,
    blurredImage,
    borderColor = "white",
    size = 128,
    className,
    audio,
    onClick,
}: BirdMarkerIconProps) {
    const pointerWidth = Math.round(size * 0.15);
    const pointerHeight = Math.round(size * 0.2);
    const translateY = -(size / 32);

    // The icon is built once and memoized for performance.
    const icon = useMemo(() => {
        const container = document.createElement("div");
        const audioId = `audio-${Math.random().toString(36).substring(2, 15)}`;

        const root = createRoot(container);
        root.render(
            <div
                className={`relative flex flex-col items-center ${className || ""}`}
                // stopPropagation to keep Leaflet click clean
                onClick={(e) => e.stopPropagation()}
            >
                {visited && (
                    <div className="absolute top-1 right-1 bg-green-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md z-50 text-white">
                        <CheckIcon className="w-5 h-5" />
                    </div>
                )}

                {/* Main circle (clickable area) */}
                <div
                    className="relative rounded-full overflow-hidden shadow-md bg-white flex items-center justify-center"
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        border: `${Math.round(size * 0.06)}px solid ${borderColor}`,
                        cursor: "pointer",
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick?.();
                    }}
                >
                    {image ? (
                        <BirdImageComp
                            image={image}
                            className="w-full h-full"
                            imageSize={400}
                            hideAttribution
                            style={{ filter: blurredImage ? "blur(4px)" : "none" }}
                        />
                    ) : (
                        <div
                            className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-600 text-xs font-semibold select-none"
                            style={{ fontSize: `${size * 0.25}px` }}
                        >
                            ?
                        </div>
                    )}

                    {/* Audio overlay */}
                    {audio && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors">
                            <div
                                className="w-6 h-6 cursor-pointer hover:scale-110 transform transition-transform"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const el = document.getElementById(audioId) as HTMLAudioElement;
                                    if (!el) return;
                                    if (el.paused) el.play();
                                    else el.pause();
                                }}
                            >
                                <PlayIcon className="w-6 h-6 text-white pointer-events-none play-icon" />
                                <PauseIcon className="w-6 h-6 text-white pointer-events-none pause-icon hidden" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Pointer triangle */}
                <div
                    className="w-0 h-0"
                    style={{
                        borderLeft: `${pointerWidth}px solid transparent`,
                        borderRight: `${pointerWidth}px solid transparent`,
                        borderTop: `${pointerHeight}px solid ${borderColor}`,
                        transform: `translateY(${translateY}px)`,
                    }}
                />

                {/* Hidden audio element */}
                {audio && (
                    <audio
                        id={audioId}
                        src={fixLink(audio.file)}
                        preload="none"
                        onPlay={(e) => {
                            const parent = (e.target as HTMLAudioElement).parentElement;
                            const playIcon = parent?.querySelector(".play-icon") as HTMLElement;
                            const pauseIcon = parent?.querySelector(".pause-icon") as HTMLElement;
                            if (playIcon && pauseIcon) {
                                playIcon.classList.add("hidden");
                                pauseIcon.classList.remove("hidden");
                            }
                        }}
                        onPause={(e) => {
                            const parent = (e.target as HTMLAudioElement).parentElement;
                            const playIcon = parent?.querySelector(".play-icon") as HTMLElement;
                            const pauseIcon = parent?.querySelector(".pause-icon") as HTMLElement;
                            if (playIcon && pauseIcon) {
                                playIcon.classList.remove("hidden");
                                pauseIcon.classList.add("hidden");
                            }
                        }}
                    />
                )}
            </div>
        );

        const icon = L.divIcon({
            html: container,
            className: "",
            iconSize: [size, size + pointerHeight],
            iconAnchor: [size / 2, size + pointerHeight],
            popupAnchor: [0, -size * 0.9],
        });

        return icon;
    }, [size, image, blurredImage, visited, borderColor, className, audio, onClick]);

    return <Marker position={position} icon={icon} />;
}
