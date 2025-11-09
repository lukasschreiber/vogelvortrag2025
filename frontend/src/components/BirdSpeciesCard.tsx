import { useState } from "react";
import type { BirdSpecies } from "../data/types";
import { BirdImage } from "./BirdImage";
import BinocularIcon from "../assets/icons/binoculars.svg?react";
import PencilButton from "../assets/icons/pencil.svg?react";
import { BirdEditModal } from "./modals/BirdEditModal";
import { useBirdData } from "../contexts/BirdDataContext";
import { Button } from "./Button";
import { BirdModal } from "./modals/BirdModal";
import TrashIcon from "../assets/icons/trash.svg?react";

interface BirdSpeciesCardProps {
    species: BirdSpecies;
    hasObservations?: boolean;
    onUpdate?: () => void;
}

export function BirdSpeciesCard({ species, hasObservations = false, onUpdate }: BirdSpeciesCardProps) {
    const { dataSource, isEditingAllowed } = useBirdData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);

    return (
        <div
            className={`group relative rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${
                hasObservations ? "outline-4 outline-offset-2 outline-blue-500" : "outline-none"
            }`}
        >
            {hasObservations && (
                <div className="absolute text-white bg-blue-500 text-xs px-2 py-1 rounded-xl top-2 right-2 z-10 flex items-center gap-1">
                    <BinocularIcon className="w-5 h-5" />
                    <span>Beobachtet</span>
                </div>
            )}

            {species.images[0] ? (
                <div onClick={() => setPopupOpen(true)}>
                    <div className="absolute z-10 left-3 top-2 text-2xl font-semibold text-white/80 drop-shadow-md">
                        {species.commonName}
                    </div>
                    <BirdImage
                        image={species.images[0]}
                        imageSize={800}
                        className="w-full object-cover aspect-square group-hover:scale-110 transition-transform duration-300"
                    />
                </div>
            ) : (
                <div className="w-full h-full bg-[#b0afa4] flex items-center justify-center aspect-square">
                    <span className="text-white/70 text-2xl font-semibold">{species.commonName}</span>
                </div>
            )}

            {/* Editing overlay */}
            {isEditingAllowed && (
                <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                        onClick={() => confirm("Are you sure you want to delete this species? This action cannot be undone.") && dataSource.deleteBirdSpecies(species.id).then(() => onUpdate?.())}
                        icon={<TrashIcon className="w-4 h-4" />}
                        variant="danger"
                    >
                        Delete
                    </Button>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        icon={<PencilButton className="w-4 h-4" />}
                        variant="primary"
                    >
                        Edit Info
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} variant="subdue">
                        Images ({species.images.length})
                    </Button>
                </div>
            )}

            {/* Bird editing modal */}
            <BirdEditModal
                open={isModalOpen}
                editMode="edit"
                onClose={() => setIsModalOpen(false)}
                initialData={species}
                onSave={async (updated) => {
                    console.log("Saved bird:", updated);
                    setIsModalOpen(false);
                    // TODO: integrate with your data source or context save logic
                    await dataSource.saveBirdSpecies(updated);
                    onUpdate?.();
                }}
            />

            <BirdModal
                species={species}
                open={popupOpen}
                onClose={() => {
                    setPopupOpen(false);
                }}
            />
        </div>
    );
}
