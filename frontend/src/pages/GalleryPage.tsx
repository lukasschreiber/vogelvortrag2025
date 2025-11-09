import { useEffect, useState } from "react";
import { BirdGallery } from "../components/BirdGallery";
import { useBirdData } from "../contexts/BirdDataContext";
import MapIcon from "../assets/icons/map.svg?react";
import type { BirdSpecies } from "../data/types";
import useLocalStorage from "../hooks/useLocalStorage";
import { useLocation, useNavigate } from "react-router";
import { BirdEditModal } from "../components/modals/BirdEditModal";
import { Button } from "../components/Button";
import { ZoomButtons } from "../components/ZoomButtons";
import PlusIcon from "../assets/icons/plus.svg?react";
import XMarkIcon from "../assets/icons/xmark.svg?react";
import { QRCodeButton } from "../components/QRCodeButton";

export function GalleryPage() {
    const { dataSource, isEditingAllowed, stopEditing } = useBirdData();
    const [species, setSpecies] = useState<BirdSpecies[]>([]);
    const [imagesPerRow, setImagesPerRow] = useLocalStorage("vogelvortrag-layout-size", 4);
    const [isEditModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        dataSource.getBirdSpecies().then(setSpecies);
    }, [dataSource]);

    return (
        <div className="relative min-h-screen bg-[#e3e2d4]">
            <BirdGallery
                species={species}
                imagesPerRow={imagesPerRow}
                onUpdate={async () => {
                    console.log("GalleryPage: refreshing species list after update");
                    const newSpecies = await dataSource.getBirdSpecies(true);
                    setSpecies(newSpecies);
                }}
            />
            <div className="fixed bottom-2 right-2 bg-white flex flex-col items-center p-2 rounded-xl">
                {isEditingAllowed && (
                    <Button onClick={() => setIsModalOpen(true)} className="mb-2 rounded-xl w-10 h-10">
                        <PlusIcon className="w-6 h-6" />
                    </Button>
                )}
                {isEditingAllowed && (
                    <Button
                        onClick={() => {
                            stopEditing();
                        }}
                        variant="danger"
                        className="mb-2 rounded-xl w-10 h-10"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </Button>
                )}

                <QRCodeButton />

                <Button
                    onClick={() => {
                        navigate(`/map${location.search}`);
                    }}
                    variant="subdue"
                    className="mb-2 rounded-xl w-10 h-10"
                >
                    <MapIcon className="w-6 h-6" />
                </Button>

                <ZoomButtons
                    onZoomIn={() => {
                        setImagesPerRow((prev) => Math.max(2, prev - 1));
                    }}
                    onZoomOut={() => {
                        setImagesPerRow((prev) => Math.min(10, prev + 1));
                    }}
                />
            </div>
            <BirdEditModal
                open={isEditModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={async (updated) => {
                    setIsModalOpen(false);
                    // TODO: integrate with your data source or context save logic
                    await dataSource.saveBirdSpecies(updated);
                    const newSpecies = await dataSource.getBirdSpecies(true);
                    setSpecies(newSpecies);
                }}
            />
        </div>
    );
}
