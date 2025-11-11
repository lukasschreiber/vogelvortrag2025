import L from "leaflet";
import { renderToString } from "react-dom/server";
import type { BirdImage } from "../data/types";
import { BirdImage as BirdImageComp } from "./BirdImage";

interface BirdIconOptions {
    size?: number; // Diameter of the circular image, e.g. 64
    image?: BirdImage;
    borderColor?: string;
    className?: string;
}

export function createBirdIcon({ size = 64, image, className, borderColor = "white" }: BirdIconOptions): L.DivIcon {
    // Pointer triangle dimensions relative to size
    const pointerWidth = Math.round(size * 0.15);
    const pointerHeight = Math.round(size * 0.2);
    const translateY = -(size / 32);

    // fallback background (if no image)
    const fallback = (
        <div
            className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-600 text-xs font-semibold select-none"
            style={{
                fontSize: `${size * 0.25}px`,
            }}
        >
            ?
        </div>
    );

    return L.divIcon({
        html: renderToString(
            <div className={`relative flex flex-col items-center ${className || ""}`}>
                <div
                    className="relative rounded-full overflow-hidden shadow-md"
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        border: `${Math.round(size * 0.06)}px solid ${borderColor}`,
                    }}
                >
                    {image ? (
                        <BirdImageComp image={image} className="w-full h-full" imageSize={400} hideAttribution />
                    ) : (
                        fallback
                    )}
                </div>
                <div
                    className="w-0 h-0"
                    style={{
                        borderLeft: `${pointerWidth}px solid transparent`,
                        borderRight: `${pointerWidth}px solid transparent`,
                        borderTop: `${pointerHeight}px solid ${borderColor}`,
                        transform: `translateY(${translateY}px)`,
                    }}
                />
            </div>
        ),
        iconSize: [size, size + pointerHeight],
        iconAnchor: [size / 2, size + pointerHeight],
        popupAnchor: [0, -size * 0.9],
        className: "",
    });
}
