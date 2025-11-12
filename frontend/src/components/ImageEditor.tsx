import { useRef, useLayoutEffect, useState, useCallback } from "react";
import type { BirdImage } from "../data/types";
import { BirdImage as BirdImageComp } from "./BirdImage";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Button } from "./Button";

interface ImageEditorProps {
    image: BirdImage;
    index: number;
    images: BirdImage[];
    onImagesChange: (images: BirdImage[]) => void;
    onClose: () => void;
}

export function ImageEditor({ image, index, images, onImagesChange, onClose }: ImageEditorProps) {
    const viewRef = useRef<HTMLDivElement>(null);

    // derive aspect ratio from known width / height
    const imgAspect = image.width && image.height ? image.width / image.height : 1;

    const [fit, setFit] = useState(() => ({
        scale: image.fit?.scale ?? 1,
        offsetX: image.fit?.offsetX ?? 0,
        offsetY: image.fit?.offsetY ?? 0,
    }));

    // --- helpers ---------------------------------------------------------------
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

    // Correct “cover” bounds for both portrait & landscape
    const getBounds = (scale: number) => {
        let imgW, imgH;

        if (imgAspect >= 1) {
            // Landscape → width is limiting dimension
            imgW = imgAspect * scale;
            imgH = scale;
        } else {
            // Portrait → height is limiting dimension
            imgW = scale;
            imgH = (1 / imgAspect) * scale;
        }

        const gutter = 0.002; // slight freedom so it doesn't feel "stuck"
        const maxOffsetX = Math.max(0, (imgW - 1) / imgW + gutter);
        const maxOffsetY = Math.max(0, (imgH - 1) / imgH + gutter);

        return { maxOffsetX, maxOffsetY };
    };

    const clampOffsets = (offsetX: number, offsetY: number, scale: number) => {
        const { maxOffsetX, maxOffsetY } = getBounds(scale);
        return {
            offsetX: clamp(offsetX, -maxOffsetX, maxOffsetX),
            offsetY: clamp(offsetY, -maxOffsetY, maxOffsetY),
        };
    };

    const applyFit = (next: typeof fit) => {
        const updated = [...images];
        updated[index] = { ...updated[index], fit: next };
        onImagesChange(updated);
        setFit(next);
    };

    // --- Drag to pan -----------------------------------------------------------
    const dragState = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        dragState.current = { sx: e.clientX, sy: e.clientY, ox: fit.offsetX, oy: fit.offsetY };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current) return;
        const dx = (e.clientX - dragState.current.sx) / 300; // pan sensitivity
        const dy = (e.clientY - dragState.current.sy) / 300;
        const next = clampOffsets(dragState.current.ox + dx, dragState.current.oy + dy, fit.scale);
        applyFit({ ...fit, ...next });
    };

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        dragState.current = null;
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    };

    // --- Wheel zoom (non-passive listener to allow preventDefault) -------------
    const zoomByDelta = useCallback(
        (e: WheelEvent) => {
            e.preventDefault();
            const zoomIntensity = 0.0015;
            const delta = -e.deltaY;
            const scaleFactor = Math.exp(delta * zoomIntensity);
            const newScale = clamp(fit.scale * scaleFactor, 1, 4);
            const next = { ...fit, scale: newScale };
            const clamped = clampOffsets(next.offsetX, next.offsetY, newScale);
            applyFit({ ...next, ...clamped });
        },
        [fit]
    );

    useLayoutEffect(() => {
        const el = viewRef.current;
        if (!el) return;
        el.addEventListener("wheel", zoomByDelta, { passive: false });
        el.addEventListener("dragstart", (e) => e.preventDefault());
        return () => el.removeEventListener("wheel", zoomByDelta);
    }, [zoomByDelta]);

    // --- Reset -----------------------------------------------------------------
    const reset = () => applyFit({ scale: 1, offsetX: 0, offsetY: 0 });

    // --- Render ---------------------------------------------------------------
    return (
        <div className="mt-6 bg-gray-100 shadow-md rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-800">Bearbeitungsansicht Bild {index + 1}</h3>
                <button className="text-xs text-gray-500 hover:text-gray-700" onClick={onClose}>
                    Schließen
                </button>
            </div>

            <div className="space-y-2">
                <Input label="Autor" placeholder="Author" value={image.author || ""} />
                <Input label="Lizenz" placeholder="License" value={image.license || ""} />
                <Textarea label="Beschreibung" placeholder="Description" rows={2} value={image.description || ""} />
            </div>

            <div className="mt-2 pt-4">
                <div className="flex flex-col md:flex-row gap-6">
                    <div
                        ref={viewRef}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                        className="relative shrink-0 w-full md:w-80 aspect-square border rounded-xl overflow-hidden bg-gray-900/5 shadow-inner touch-none overscroll-contain select-none"
                    >
                        {/* Disable native image dragging */}
                        <BirdImageComp
                            image={image}
                            hideAttribution
                            imageSize={800}
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                        />

                        {/* grid overlay */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="border border-white/20" />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col grow gap-3">
                        <div className="text-xs text-gray-500">
                            Zoom: {fit.scale.toFixed(2)} | Offset: ({fit.offsetX.toFixed(2)}, {fit.offsetY.toFixed(2)})
                        </div>

                        <Button onClick={reset} variant="subdue" className="self-start mt-2">
                            Bearbeitungen Zurücksetzen
                        </Button>

                        <p className="text-xs text-gray-400">
                            Ziehen zum Verschieben · Mausrad zum Zoomen · Keine Weißränder 🎉 {image.width} x {image.height}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
