import { type BirdObservation, type BirdSpecies } from "../../data/types";
import { BirdImage } from "../BirdImage";
// @ts-ignore
import "swiper/css";
import { Modal } from "../Modal";
import { useEffect, useState } from "react";
import { useBirdData } from "../../contexts/BirdDataContext";
import { Button } from "../Button";
import PencilIcon from "../../assets/icons/pencil.svg?react";
import { ObservationEditModal } from "./ObservationEditModal";
import { Lightbox } from "../Lightbox";
import TrashIcon from "../../assets/icons/trash.svg?react";

interface BirdPopupProps {
    species: BirdSpecies;
    open: boolean;
    onClose: () => void;
    onUpdate?: () => void;
}

export function BirdModal({ species, open, onClose, onUpdate }: BirdPopupProps) {
    const [observations, setObservations] = useState<BirdObservation[]>([]);
    const { dataSource, isEditingAllowed } = useBirdData();
    const [editingObservation, setEditingObservation] = useState<BirdObservation | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        dataSource.getBirdObservationsBySpeciesId(species.id).then((obs) => {
            setObservations(obs);
        });
    }, [species, dataSource]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={
                <div>
                    <h2 className="text-6xl font-bold mb-2 text-[#b0afa4]">{species.commonName}</h2>
                    <p className="mb-2 italic text-gray-700 text-xl">{species.scientificName}</p>
                </div>
            }
            size="xl"
        >
            {observations.length > 0 && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-green-800">Beobachtungen</h3>
                    <div className="flex flex-col gap-2">
                        {observations.map((obs, index) => (
                            <div key={index} className="p-2 bg-white border border-green-100 rounded-md mb-2 relative">
                                <div className="flex flex-row gap-2">
                                    {obs.image ? (
                                        <div>
                                            <BirdImage
                                                image={obs.image}
                                                imageSize={200}
                                                className="w-20! h-20! object-cover rounded-md mr-4 shrink-0"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-20! h-20! bg-gray-200/40 rounded-md mr-4 shrink-0 flex items-center justify-center">
                                            <span className="text-gray-500 text-sm">Kein Bild</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col grow w-full">
                                        <p className="font-medium text-gray-900">{obs.title}</p>
                                        {obs.date && (
                                            <p className="text-gray-600 text-sm mb-1">
                                                am {new Date(obs.date).toLocaleDateString("de-DE")}
                                            </p>
                                        )}
                                        <p className="text-gray-700 text-sm">{obs.notes}</p>
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2 flex flex-row gap-2">
                                    <Button
                                        onClick={() => {
                                            const lat = obs.location.latitude.toFixed(5);
                                            const lng = obs.location.longitude.toFixed(5);
                                            const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
                                            window.open(url, "_blank");
                                        }}
                                        variant="subdue"
                                        className="text-xs px-2 py-1"
                                    >
                                        Standort in OSM öffnen
                                    </Button>
                                    {isEditingAllowed && (
                                        <>
                                        <Button
                                            onClick={() => {
                                                setEditingObservation(obs);
                                            }}
                                            variant="primary"
                                            className="text-xs px-2 py-1"
                                            icon={<PencilIcon className="w-4 h-4" />}
                                        >
                                            Beobachtung bearbeiten
                                        </Button>
                                        <Button 
                                            onClick={() => {
                                                if (confirm("Sind Sie sicher, dass Sie diese Beobachtung löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.")) {
                                                    dataSource.deleteBirdObservation(obs.id).then(() => {   
                                                        setObservations((prev) => prev.filter((o) => o.id !== obs.id));
                                                        onUpdate?.();
                                                    });
                                                }
                                            }}
                                            variant="danger"
                                            className="text-xs px-2 py-1"
                                            icon={<TrashIcon className="w-4 h-4" />}
                                        >
                                            Beobachtung löschen
                                        </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {observations.length === 0 && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">Für diese Art wurden noch keine Beobachtungen erfasst.</p>
                </div>
            )}
            <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {species.images.map((image, index) => (
                    <div key={image.url} className="rounded-md overflow-hidden">
                        <BirdImage
                            image={image}
                            imageSize={1200}
                            className="w-full h-32 object-cover rounded-md"
                            onClick={() => {
                                console.log("Opening lightbox at index", index);
                                setCurrentIndex(index);
                                setLightboxOpen(true);
                            }}
                        />
                    </div>
                ))}
            </div>
            <ObservationEditModal
                open={editingObservation !== null}
                onClose={() => setEditingObservation(null)}
                editMode="edit"
                initialData={editingObservation || undefined}
                onSave={async (obs) => {
                    await dataSource.saveBirdObservation(obs);
                    setEditingObservation(null);
                    onUpdate?.();
                    dataSource.getBirdObservationsBySpeciesId(species.id).then((obs) => {
                        setObservations(obs);
                    });
                }}
            />
            <Lightbox
                images={species.images}
                open={lightboxOpen}
                initialIndex={currentIndex}
                onClose={() => setLightboxOpen(false)}
            />
        </Modal>
    );
}
