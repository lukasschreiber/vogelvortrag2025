import { useState } from "react";
import type { BirdImage } from "./../data/types";
import { BirdImage as BirdImageComp } from "./BirdImage";
import TrashIcon from "../assets/icons/trash.svg?react";

import PlusIcon from "./../assets/icons/plus.svg?react";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Button } from "./Button";
import { useBirdData } from "../contexts/BirdDataContext";

interface ImageUploaderProps {
    images: BirdImage[];
    onImagesChange: (images: BirdImage[]) => void;
    maxImages?: number; // optional, default: Infinity
    uploadUrl?: string; // optional, default: http://localhost:8000/upload-image
    label?: string;
}

export function ImageUploader({
    images,
    onImagesChange,
    maxImages = Infinity,
    uploadUrl = `${import.meta.env.VITE_BACKEND_URL}/upload-image`,
    label = "Images",
}: ImageUploaderProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const { editKey } = useBirdData();

    async function handleAddImage(file: File) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                ...(editKey ? { "x-edit-key": editKey } : {}),
            },
            body: formData,
        });

        if (!res.ok) {
            console.error("Upload failed");
            return;
        }

        const uploaded = await res.json();
        onImagesChange([...images, uploaded]);
    }

    function handleRemoveImage(index: number) {
        const updated = images.filter((_, i) => i !== index);
        onImagesChange(updated);
        if (expandedIndex === index) setExpandedIndex(null);
    }

    function handleImageChange(index: number, field: keyof BirdImage, value: string) {
        const updated = [...images];
        updated[index] = { ...updated[index], [field]: value };
        onImagesChange(updated);
    }

    function handleFitChange(index: number, key: "scale" | "offsetX" | "offsetY" | "reset", value: number | null) {
        const updated = [...images];
        const fit = { scale: 1, offsetX: 0, offsetY: 0, ...updated[index].fit };

        if (key === "reset") {
            updated[index].fit = { scale: 1, offsetX: 0, offsetY: 0 };
        } else {
            let newFit = { ...fit, [key]: value ?? fit[key] };
            newFit.scale = Math.max(0.5, Math.min(2, newFit.scale));

            const maxOffset = (newFit.scale - 1) / newFit.scale;
            newFit.offsetX = Math.max(-maxOffset, Math.min(maxOffset, newFit.offsetX));
            newFit.offsetY = Math.max(-maxOffset, Math.min(maxOffset, newFit.offsetY));

            updated[index].fit = newFit;
        }

        onImagesChange(updated);
    }

    return (
        <div className="pt-2 border-t mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>

            <div className="flex flex-wrap gap-3">
                {images.map((img, i) => (
                    <div key={i} className="relative w-28 h-28 border rounded-lg overflow-hidden group">
                        <BirdImageComp
                            image={img}
                            hideAttribution
                            imageSize={800}
                            className="group-hover:opacity-80 transition cursor-pointer"
                            onClick={() => setExpandedIndex((prev) => (prev === i ? null : i))}
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs py-1 text-center opacity-0 group-hover:opacity-100 transition">
                            Edit
                        </div>
                    </div>
                ))}

                {images.length < maxImages && (
                    <label className="flex w-28 h-28 items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer text-gray-400 hover:text-gray-600">
                        <PlusIcon className="w-4 h-4" />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            multiple={maxImages > 1}
                            onChange={(e) => {
                                if (e.target.files) {
                                    Array.from(e.target.files).forEach((file) => handleAddImage(file));
                                }
                            }}
                        />
                    </label>
                )}
            </div>

            {/* Expanded editor */}
            {expandedIndex !== null && images[expandedIndex] && (
                <div className="mt-6 border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-gray-800">Editing Image {expandedIndex + 1}</h3>
                        <button
                            className="text-xs text-gray-500 hover:text-gray-700"
                            onClick={() => setExpandedIndex(null)}
                        >
                            Close
                        </button>
                    </div>

                    <div className="space-y-2">
                        <Input
                            placeholder="Author"
                            value={images[expandedIndex].author || ""}
                            onChange={(e) => handleImageChange(expandedIndex, "author", e.target.value)}
                        />
                        <Input
                            placeholder="License"
                            value={images[expandedIndex].license || ""}
                            onChange={(e) => handleImageChange(expandedIndex, "license", e.target.value)}
                        />
                        <Textarea
                            placeholder="Description"
                            rows={2}
                            value={images[expandedIndex].description || ""}
                            onChange={(e) => handleImageChange(expandedIndex, "description", e.target.value)}
                        />
                    </div>

                    <div className="mt-6 border-t pt-4">
                        <div className="text-base font-semibold text-gray-800 mb-3">Image Fit & Position</div>

                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="relative shrink-0 w-full md:w-80 aspect-square border rounded-xl overflow-hidden bg-gray-100 shadow-inner">
                                <BirdImageComp image={images[expandedIndex]} hideAttribution imageSize={800} />
                                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                                    {Array.from({ length: 9 }).map((_, i) => (
                                        <div key={i} className="border border-white/30" />
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col grow gap-4">
                                {(["scale", "offsetX", "offsetY"] as const).map((key) => (
                                    <div key={key}>
                                        <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                                            <span>
                                                {key === "scale" ? "Zoom" : key === "offsetX" ? "Offset X" : "Offset Y"}
                                            </span>
                                            <span className="font-mono text-gray-500">
                                                {(
                                                    images[expandedIndex].fit?.[key] ?? (key === "scale" ? 1 : 0)
                                                ).toFixed(2)}
                                            </span>
                                        </label>
                                        <input
                                            type="range"
                                            min={key === "scale" ? 0.5 : -1}
                                            max={key === "scale" ? 2 : 1}
                                            step="0.01"
                                            value={images[expandedIndex].fit?.[key] ?? (key === "scale" ? 1 : 0)}
                                            onChange={(e) =>
                                                handleFitChange(expandedIndex, key, parseFloat(e.target.value))
                                            }
                                            className={`w-full ${
                                                key === "scale"
                                                    ? "accent-green-600"
                                                    : key === "offsetX"
                                                      ? "accent-blue-600"
                                                      : "accent-purple-600"
                                            }`}
                                        />
                                    </div>
                                ))}

                                <Button
                                    onClick={() => handleFitChange(expandedIndex, "reset", null)}
                                    variant="subdue"
                                    className="self-start mt-2"
                                >
                                    Reset Fit
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
