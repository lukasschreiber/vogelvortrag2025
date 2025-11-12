import type { XenoCantoRecording } from "../components/XenoCantoBirdSong";

export interface BirdSpecies {
    id: string;
    commonName: string;
    scientificName: string;
    family: string;
    conservationStatus?: "LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX";
    images: BirdImage[];
    recordings?: XenoCantoRecording[];
}

export interface BirdImage {
    url: string;
    author?: string;
    license?: string;
    description?: string;
    /**
     * How the image should be fitted or cropped in square/round views.
     */
    fit?: {
        /** Zoom level (1 = default, >1 = zoom in) */
        scale?: number;
        /** Horizontal offset, in normalized coordinates (-1 = left, 1 = right) */
        offsetX?: number;
        /** Vertical offset, in normalized coordinates (-1 = up, 1 = down) */
        offsetY?: number;
    };
    width?: number;
    height?: number;
}

export interface BirdObservation {
    id: string;
    speciesId: string;
    date: string; // ISO date string
    location: {
        latitude: number;
        longitude: number;
    };
    observer: string;
    notes?: string;
    title: string;
    image?: BirdImage;
    recording?: XenoCantoRecording;
    mystery: boolean; // whether the observation is marked as "mystery"
    includeAudioInMarker: boolean; // whether to include audio playback in map marker
}
