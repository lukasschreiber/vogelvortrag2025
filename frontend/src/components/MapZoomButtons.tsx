import { useMap } from "react-leaflet";
import { ZoomButtons } from "./ZoomButtons";
import { useEffect } from "react";

export function MapZoomButtons({ setZoom }: { zoom: number; setZoom: (zoom: number) => void }) {
    const map = useMap();

    const handleZoomIn = () => {
        map.zoomIn();
        setZoom(map.getZoom() + 1);
    };

    const handleZoomOut = () => {
        map.zoomOut();
        setZoom(map.getZoom() - 1);
    };

    useEffect(() => {
        // Sync zoom state when user scrolls or uses keyboard
        map.on("zoomend", () => {
            setZoom(map.getZoom());
        });
        return () => {
            map.off("zoomend");
        };
    }, [map, setZoom]);

    return <ZoomButtons onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />;
}
