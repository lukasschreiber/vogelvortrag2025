import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { BirdMarkerIcon } from "./BirdMapIcon";
import { useBirdData } from "../contexts/BirdDataContext";
import { useEffect, useState } from "react";
import { BirdModal } from "./modals/BirdModal";
import { ObservationEditModal } from "./modals/ObservationEditModal";
import { MapZoomButtons } from "./MapZoomButtons";
import { Button } from "./Button";
import GridIcon from "../assets/icons/grid.svg?react";
import XMarkIcon from "../assets/icons/xmark.svg?react";
import useLocalStorage from "../hooks/useLocalStorage";
import { useLocation, useNavigate } from "react-router";
import type { BirdImage, BirdObservation, BirdSpecies } from "../data/types";
import { QRCodeButton } from "./QRCodeButton";
import RefreshIcon from "../assets/icons/refresh.svg?react";
import CollapsibleButtonGroup from "./ButtonGroup";
import SettingsIcon from "../assets/icons/settings.svg?react";
import { SettingsModal } from "./modals/SettingsModal";
import { Lightbox } from "./Lightbox";
import { useSettings } from "../hooks/useSettings";

export function Map() {
    const { dataSource, isEditingAllowed, stopEditing } = useBirdData();
    const [visitedMarkers, setVisitedMarkers] = useLocalStorage<Array<string>>("vogelvortrag-visited-markers", []);
    const [observations, setObservations] = useState<BirdObservation[]>([]);
    const [lightBoxOpenObservation, setLightboxOpenObservation] = useState<BirdObservation | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [zoom, setZoom] = useLocalStorage("vogelvortrag-map-zoom", 13);
    const [markers, setMarkers] = useState<
        Array<{ lat: number; lng: number; image?: BirdImage; observation: BirdObservation }>
    >([]);
    const [newObsLocation, setNewObsLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [showObsModal, setShowObsModal] = useState(false);
    const [popupOpenSpeciesId, setPopupOpenSpeciesId] = useState<string | null>(null);
    const [popupSpecies, setPopupSpecies] = useState<BirdSpecies | null>(null);
    const [lightboxSpecies, setLightboxSpecies] = useState<BirdSpecies | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const { settings } = useSettings();

    function handleAddObservation(lat: number, lng: number) {
        if (!isEditingAllowed) return;
        setNewObsLocation({ lat, lng });
        setShowObsModal(true);
    }

    useEffect(() => {
        if (lightBoxOpenObservation) {
            dataSource.getBirdSpeciesById(lightBoxOpenObservation.speciesId).then((species) => {
                setLightboxSpecies(species);
            });
        }
    }, [lightboxSpecies, lightBoxOpenObservation, dataSource]);

    useEffect(() => {
        if (popupOpenSpeciesId) {
            dataSource.getBirdSpeciesById(popupOpenSpeciesId).then((species) => {
                setPopupSpecies(species);
            });
        }
    }, [popupOpenSpeciesId, dataSource]);

    useEffect(() => {
        dataSource.getBirdObservations().then(async (observations) => {
            setObservations(observations);
        });
    }, [dataSource]);

    useEffect(() => {
        (async () => {
            const newMarkers: Array<{
                lat: number;
                lng: number;
                image?: BirdImage;
                observation: BirdObservation;
                blurred?: boolean;
            }> = [];
            for (const observation of observations) {
                let image = observation.image;
                if (!image) {
                    const species = await dataSource.getBirdSpeciesById(observation.speciesId);
                    image = species?.images[0];
                }
                newMarkers.push({
                    lat: observation.location.latitude,
                    lng: observation.location.longitude,
                    observation,
                    image,
                    blurred: true,
                });
            }
            setMarkers(newMarkers);
        })();
    }, [observations, dataSource]);

    return (
        <MapContainer
            center={{ lat: 49.87196, lng: 8.65276 }}
            zoom={zoom}
            zoomControl={false}
            doubleClickZoom={false}
            scrollWheelZoom={true}
            className="w-full h-full"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* handle zoom updates */}
            <MapZoomWatcher setZoom={setZoom} />

            {markers.map((marker, index) => {
                const MIN_ZOOM = 3;
                const MAX_ZOOM = 18;
                const MIN_SIZE = 4;
                const MAX_SIZE = 128;

                // Normalize zoom to a 0–1 range
                const normalized = Math.max(0, Math.min(1, (zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)));

                // Smooth linear interpolation
                const size = MIN_SIZE + normalized * (MAX_SIZE - MIN_SIZE);

                return (
                    <BirdMarkerIcon
                        key={index}
                        size={size}
                        position={[marker.lat, marker.lng]}
                        image={marker.image}
                        blurredImage={marker.observation.mystery}
                        audio={marker.observation.recording}
                        visited={visitedMarkers.includes(marker.observation.id)}
                        onClick={() => {
                            if (settings.fullscreenGalleryMapBehavior === "directly") {
                                setLightboxOpenObservation(marker.observation);
                            } else {
                                setPopupOpenSpeciesId(marker.observation.speciesId);
                            }
                            setVisitedMarkers((prev) =>
                                prev.includes(marker.observation.id) ? prev : [...prev, marker.observation.id]
                            );
                        }}
                    />
                );
            })}

            <CollapsibleButtonGroup>
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

                <Button
                    onClick={async () => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                        confirm(`Möchtest du wirklich alle "Bereits Besucht" Marker zurücksetzen?`) &&
                            setVisitedMarkers([]);
                    }}
                    variant="subdue"
                    className="mb-2 rounded-xl w-10 h-10"
                >
                    <RefreshIcon className="w-6 h-6" />
                </Button>

                <Button onClick={() => setSettingsOpen(true)} variant="subdue" className="mb-2 rounded-xl w-10 h-10">
                    <SettingsIcon className="w-6 h-6" />
                </Button>

                <QRCodeButton />

                <Button
                    onClick={() => navigate(`/${location.search}`)}
                    variant="subdue"
                    className="mb-2 rounded-xl w-10 h-10"
                >
                    <GridIcon className="w-6 h-6" />
                </Button>

                <MapZoomButtons setZoom={setZoom} zoom={zoom} />
            </CollapsibleButtonGroup>

            <MapEventHandler onDoubleClick={handleAddObservation} />

            {showObsModal && newObsLocation && (
                <ObservationEditModal
                    open={showObsModal}
                    onClose={() => setShowObsModal(false)}
                    editMode="add"
                    initialData={{
                        location: {
                            latitude: newObsLocation.lat,
                            longitude: newObsLocation.lng,
                        },
                        date: new Date().toISOString().split("T")[0],
                    }}
                    onSave={async (obs) => {
                        await dataSource.saveBirdObservation(obs);
                        dataSource.getBirdObservations().then(async (observations) => {
                            setObservations(observations);
                        });
                        setShowObsModal(false);
                    }}
                />
            )}

            {popupSpecies && (
                <BirdModal
                    species={popupSpecies}
                    open={!!popupOpenSpeciesId}
                    onClose={() => {
                        setPopupOpenSpeciesId(null);
                        setPopupSpecies(null);
                    }}
                    onUpdate={async () => {
                        dataSource.getBirdObservations().then(async (observations) => {
                            setObservations(observations);
                        });
                    }}
                />
            )}

            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

            <Lightbox
                images={
                    lightBoxOpenObservation
                        ? lightBoxOpenObservation.image && settings.includeObservationImagesInGallery
                            ? [lightBoxOpenObservation.image, ...(lightboxSpecies?.images ?? [])]
                            : (lightboxSpecies?.images ?? [])
                        : []
                }
                open={!!lightBoxOpenObservation}
                initialIndex={0}
                onClose={() => {
                    setLightboxSpecies(null);
                    setLightboxOpenObservation(null);
                }}
            />
        </MapContainer>
    );
}

function MapEventHandler({ onDoubleClick }: { onDoubleClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        dblclick(e) {
            onDoubleClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function MapZoomWatcher({ setZoom }: { setZoom: (zoom: number) => void }) {
    const map = useMapEvents({
        zoomend: () => {
            setZoom(map.getZoom());
        },
    });
    return null;
}
