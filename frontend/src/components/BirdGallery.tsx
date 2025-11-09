import { useEffect, useState } from "react";
import { useBirdData } from "../contexts/BirdDataContext";
import type { BirdSpecies } from "../data/types";
import { BirdSpeciesCard } from "./BirdSpeciesCard";

interface BirdGalleryProps {
    species: BirdSpecies[];
    imagesPerRow: number;
    onUpdate?: () => void;
}

export function BirdGallery({ species, imagesPerRow, onUpdate }: BirdGalleryProps) {
    const { dataSource } = useBirdData();
    const [observationsMap, setObservationsMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        (async () => {
            const results: Record<string, boolean> = {};
            for (const bird of species) {
                results[bird.id] = await dataSource.speciesHasObservations(bird.id);
            }
            setObservationsMap(results);
        })();
    }, [species, dataSource]);

    return (
        <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${imagesPerRow}, minmax(0, 1fr))` }}>
            {species.map((bird) => (
                <BirdSpeciesCard
                    key={bird.id}
                    species={bird}
                    hasObservations={observationsMap[bird.id] ?? false}
                    onUpdate={() => {
                        onUpdate?.();
                    }}
                />
            ))}
        </div>
    );
}
