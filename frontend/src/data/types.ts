export interface BirdSpecies {
    id: string;
    commonName: string;
    scientificName: string;
    family: string;
    conservationStatus?: "LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX";
    images: BirdImage[];
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
}
