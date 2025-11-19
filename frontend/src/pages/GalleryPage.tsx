import { useEffect, useState } from "react";
import { BirdGallery } from "../components/BirdGallery";
import { useBirdData } from "../contexts/BirdDataContext";
import MapIcon from "../assets/icons/map.svg?react";
import type { BirdSpecies } from "../data/types";
import { useLocation, useNavigate } from "react-router";
import { BirdEditModal } from "../components/modals/BirdEditModal";
import { Button } from "../components/Button";
import { ZoomButtons } from "../components/ZoomButtons";
import PlusIcon from "../assets/icons/plus.svg?react";
import SettingsIcon from "../assets/icons/settings.svg?react";
import XMarkIcon from "../assets/icons/xmark.svg?react";
import { QRCodeButton } from "../components/QRCodeButton";
import CollapsibleButtonGroup from "../components/ButtonGroup";
import { useSettings } from "../hooks/useSettings";
import { SettingsModal } from "../components/modals/SettingsModal";

export function GalleryPage() {
    const { dataSource, isEditingAllowed, stopEditing } = useBirdData();
    const [species, setSpecies] = useState<BirdSpecies[]>([]);
    const { settings, set } = useSettings();
    const [showSettings, setShowSettings] = useState(false);
    const [isEditModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        dataSource.getBirdSpecies().then((species) => {
            setSpecies(species);
        });
    }, [dataSource]);

    return (
        <div className="relative min-h-screen bg-[#e3e2d4]">
            <BirdGallery
                species={species.sort((a, b) => a.commonName.localeCompare(b.commonName))}
                imagesPerRow={settings.galleryZoom}
                onUpdate={async () => {
                    console.log("GalleryPage: refreshing species list after update");
                    const newSpecies = await dataSource.getBirdSpecies();
                    setSpecies(newSpecies);
                }}
            />
            <CollapsibleButtonGroup>
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
                        setShowSettings(true);
                    }}
                    variant="subdue"
                    className="mb-2 rounded-xl w-10 h-10"
                >
                    <SettingsIcon className="w-6 h-6" />
                </Button>

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
                        set("galleryZoom", Math.max(1, settings.galleryZoom - 1));
                    }}
                    onZoomOut={() => {
                        set("galleryZoom", settings.galleryZoom + 1);
                    }}
                />
            </CollapsibleButtonGroup>
            <BirdEditModal
                open={isEditModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={async (updated) => {
                    setIsModalOpen(false);
                    // TODO: integrate with your data source or context save logic
                    await dataSource.saveBirdSpecies(updated);
                    const newSpecies = await dataSource.getBirdSpecies();
                    setSpecies(newSpecies);
                }}
            />
            <SettingsModal
                open={showSettings}
                onClose={() => {
                    setShowSettings(false);
                }}
            />
        </div>
    );
}
