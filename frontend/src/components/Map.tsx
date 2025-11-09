import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createBirdIcon } from "./BirdMapIcon";
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
import type { BirdObservation } from "../data/types";
import { QRCodeButton } from "./QRCodeButton";

export function Map() {
    const { dataSource, isEditingAllowed, stopEditing } = useBirdData();
    const [observations, setObservations] = useState<BirdObservation[]>([]);
    const navigate = useNavigate();
    const location = useLocation();
    const [zoom, setZoom] = useLocalStorage("vogelvortrag-map-zoom", 13);
    const [markers, setMarkers] = useState<Array<{ lat: number; lng: number; image: any; observation: any }>>([]);
    const [newObsLocation, setNewObsLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [showObsModal, setShowObsModal] = useState(false);
    const [popupOpenSpeciesId, setPopupOpenSpeciesId] = useState<string | null>(null);
    const [popupSpecies, setPopupSpecies] = useState<any>(null);

    function handleAddObservation(lat: number, lng: number) {
        if (!isEditingAllowed) return;
        setNewObsLocation({ lat, lng });
        setShowObsModal(true);
    }

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
            const newMarkers: Array<{ lat: number; lng: number; image: any; observation: any }> = [];
            for (const observation of observations) {
                let image = observation.image;
                if (!image) {
                    const species = await dataSource.getBirdSpeciesById(observation.speciesId);
                    image = species?.images[0];
                }
                if (!image) continue;
                newMarkers.push({
                    lat: observation.location.latitude,
                    lng: observation.location.longitude,
                    observation,
                    image,
                });
            }
            setMarkers(newMarkers);
        })();
    }, [observations]);

    useEffect(() => {
        const minZoom = 5;
        const maxZoom = 15;

        // Normalize zoom into 0–1 range
        const t = Math.min(1, Math.max(0, (zoom - minZoom) / (maxZoom - minZoom)));

        // The less the zoom, the smaller the scale, scale from 1.0x to 0.1x
        const scale = t * 0.9;

        // Apply CSS transform to all bird icons
        document.querySelectorAll<HTMLImageElement>(".bird-icon").forEach((el) => {
            el.style.transform = `scale(${scale})`;
            el.style.transformOrigin = "bottom center";
        });
    }, [zoom]);

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
                const customIcon = createBirdIcon({
                    size: 128, // always fixed
                    image: marker.image,
                    className: "bird-icon", // <-- ensure this class gets applied
                });
                return (
                    <Marker
                        key={index}
                        position={{ lat: marker.lat, lng: marker.lng }}
                        icon={customIcon}
                        eventHandlers={{
                            click: () => {
                                setPopupOpenSpeciesId(marker.observation.speciesId);
                            },
                        }}
                    />
                );
            })}

            <div className="fixed bottom-6 right-2 bg-white flex flex-col items-center p-2 rounded-xl z-1000">
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

                <Button onClick={() => navigate(`/${location.search}`)} variant="subdue" className="mb-2 rounded-xl w-10 h-10">
                    <GridIcon className="w-6 h-6" />
                </Button>

                <MapZoomButtons setZoom={setZoom} zoom={zoom} />
            </div>

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
                        dataSource.getBirdObservations(true).then(async (observations) => {
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
                        dataSource.getBirdObservations(true).then(async (observations) => {
                            setObservations(observations);
                        });
                    }}
                />
            )}
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
