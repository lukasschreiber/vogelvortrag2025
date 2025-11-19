import { useState, useRef, useLayoutEffect, useEffect, useCallback } from "react";
import type { BirdObservation, BirdSpecies } from "../data/types";
import { BirdImage } from "./BirdImage";
import BinocularIcon from "../assets/icons/binoculars.svg?react";
import PencilButton from "../assets/icons/pencil.svg?react";
import TrashIcon from "../assets/icons/trash.svg?react";
// import EyeIcon from "../assets/icons/eye.svg?react";
import { BirdEditModal } from "./modals/BirdEditModal";
import { BirdModal } from "./modals/BirdModal";
import { useBirdData } from "../contexts/BirdDataContext";
import { Button } from "./Button";
import { useSettings } from "../hooks/useSettings";
import { Lightbox } from "./Lightbox";

interface BirdSpeciesCardProps {
    species: BirdSpecies;
    hasObservations?: boolean;
    observations?: BirdObservation[];
    onUpdate?: () => void;
}

export function BirdSpeciesCard({ species, hasObservations = false, onUpdate }: BirdSpeciesCardProps) {
    const { dataSource, isEditingAllowed } = useBirdData();
    const { settings } = useSettings();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);
    const [isSmall, setIsSmall] = useState(false);
    const [showButtons, setShowButtons] = useState(false);
    const [hoverSupported, setHoverSupported] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);

    const handleOpenModal = useCallback(() => {
        if (settings.fullscreenGalleryGalleryBehavior === "directly" && species.images.length > 0) {
            setLightboxOpen(true);
        } else {
            setPopupOpen(true);
        }
    }, [settings.fullscreenGalleryGalleryBehavior, species.images.length]);

    useLayoutEffect(() => {
        const el = cardRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            setIsSmall(entry.contentRect.width < 220);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const mq = window.matchMedia("(hover: hover)");
        setHoverSupported(mq.matches);

        const listener = (e: MediaQueryListEvent) => setHoverSupported(e.matches);
        mq.addEventListener("change", listener);
        return () => mq.removeEventListener("change", listener);
    }, []);

    const handleTouchToggle = (e: React.TouchEvent) => {
        if (hoverSupported) return; // skip on devices that support hover
        e.stopPropagation();
        setShowButtons((prev) => !prev);
    };

    useEffect(() => {
        if (hoverSupported || !showButtons) return;
        const hide = () => setShowButtons(false);
        window.addEventListener("touchstart", hide, { passive: true });
        return () => window.removeEventListener("touchstart", hide);
    }, [hoverSupported, showButtons]);

    const canOpenModal = hoverSupported || !showButtons;

    return (
        <div
            ref={cardRef}
            style={{ containerType: "inline-size" }}
            className={`group relative rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${
                hasObservations && settings.showBorders ? "outline-4 outline-offset-2 outline-blue-500" : "outline-none"
            }`}
            onTouchStart={handleTouchToggle}
        >
            {/* Observation badge */}
            {hasObservations && settings.showObservedTag && (
                <div className="absolute text-white bg-blue-500 text-xs px-2 py-1 rounded-xl top-2 right-2 z-10 flex items-center gap-1">
                    <BinocularIcon className="w-5 h-5" />
                    <span>Beobachtet</span>
                </div>
            )}

            {/* Image / Fallback */}
            {species.images[0] ? (
                <div
                    onClick={() => canOpenModal && handleOpenModal()}
                    className={canOpenModal ? "cursor-pointer" : "cursor-default"}
                >
                    {settings.showBirdNames && (
                        <div
                            className={`absolute z-10 left-2 top-2 font-semibold text-white/80 drop-shadow-md
                                    text-2xl @md:text-4xl @lg:text-4xl transition-all duration-300 ${isSmall ? "text-lg" : ""}`}
                        >
                            {species.commonName}
                        </div>
                    )}
                    <BirdImage
                        image={species.images[0]}
                        imageSize={800}
                        className={`w-full object-cover aspect-square group-hover:scale-110 transition-transform duration-300 ${
                            !canOpenModal ? "opacity-90" : ""
                        }`}
                    />
                </div>
            ) : (
                <div
                    className="w-full h-full bg-[#b0afa4] flex items-center justify-center aspect-square"
                    onClick={() => canOpenModal && handleOpenModal()}
                >
                    <span
                        className={`text-white/70 font-semibold transition-all duration-300 ${
                            isSmall ? "text-base" : "text-2xl"
                        }`}
                    >
                        {species.commonName}
                    </span>
                </div>
            )}

            {isEditingAllowed && (
                <div
                    className={`
                            absolute bottom-2 right-2 flex gap-1 @md:gap-2 flex-col @md:flex-row
                            transition-opacity duration-300
                            ${
                                showButtons
                                    ? "opacity-100 pointer-events-auto"
                                    : hoverSupported
                                      ? "opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none"
                                      : "opacity-0 pointer-events-none"
                            }
                        `}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <Button
                        onClick={() =>
                            confirm("Are you sure you want to delete this species? This action cannot be undone.") &&
                            dataSource.deleteBirdSpecies(species.id).then(() => onUpdate?.())
                        }
                        icon={<TrashIcon className="w-4 h-4" />}
                        variant="danger"
                        className={isSmall ? "text-xs! px-2! py-1!" : ""}
                    >
                        Löschen
                    </Button>

                    <Button
                        onClick={() => setIsModalOpen(true)}
                        icon={<PencilButton className="w-4 h-4" />}
                        variant="primary"
                        className={isSmall ? "text-xs! px-2! py-1!" : ""}
                    >
                        Bearbeiten
                    </Button>

                    <Button
                        onClick={() => setIsModalOpen(true)}
                        variant="subdue"
                        className={isSmall ? "text-xs! px-2! py-1!" : ""}
                    >
                        Bilder ({species.images.length})
                    </Button>

                    {!hoverSupported && (
                        <Button
                            onClick={() => setPopupOpen(true)}
                            // icon={<EyeIcon className="w-4 h-4" />}
                            variant="subdue"
                            className={isSmall ? "text-xs! px-2! py-1!" : ""}
                        >
                            Ansehen
                        </Button>
                    )}
                </div>
            )}

            <BirdEditModal
                open={isModalOpen}
                editMode="edit"
                onClose={() => setIsModalOpen(false)}
                initialData={species}
                onSave={async (updated) => {
                    console.log("Saved bird:", updated);
                    setIsModalOpen(false);
                    await dataSource.saveBirdSpecies(updated);
                    onUpdate?.();
                }}
            />

            <BirdModal species={species} open={popupOpen} onClose={() => setPopupOpen(false)} />

            <Lightbox
                images={species.images}
                open={lightboxOpen}
                initialIndex={0}
                onClose={() => setLightboxOpen(false)}
            />
        </div>
    );
}
