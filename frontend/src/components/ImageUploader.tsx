import { useState, type DragEvent } from "react";
import type { BirdImage } from "../data/types";
import { BirdImage as BirdImageComp } from "./BirdImage";
import TrashIcon from "../assets/icons/trash.svg?react";
import PlusIcon from "../assets/icons/plus.svg?react";
import { useBirdData } from "../contexts/BirdDataContext";
import { ImageEditor } from "./ImageEditor";

interface ImageUploaderProps {
    images: BirdImage[];
    onImagesChange: (images: BirdImage[]) => void;
    maxImages?: number;
    uploadUrl?: string;
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
    const [isDragging, setIsDragging] = useState(false);
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

    // ---- Drag & Drop Handlers ----
    function handleDragOver(e: DragEvent<HTMLLabelElement>) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(e: DragEvent<HTMLLabelElement>) {
        e.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(e: DragEvent<HTMLLabelElement>) {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
        files.forEach((file) => handleAddImage(file));
    }

    return (
        <div className="pt-2 mt-4">
            <label className="block text-md font-semibold text-gray-700 mb-2">{label}</label>

            <div className="flex flex-wrap gap-3">
                {images.map((img, i) => (
                    <div key={i} className="relative w-28 h-28 rounded-lg overflow-hidden group">
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
                            Bearbeiten
                        </div>
                    </div>
                ))}

                {images.length < maxImages && (
                    <label
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`flex w-28 h-28 items-center justify-center border-2 border-dashed rounded-lg cursor-pointer text-gray-400 hover:text-gray-600 transition
                            ${isDragging ? "border-blue-400 bg-blue-50 text-blue-600" : "border-gray-300"}`}
                    >
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

            {expandedIndex !== null && images[expandedIndex] && (
                <ImageEditor
                    image={images[expandedIndex]}
                    index={expandedIndex}
                    onClose={() => setExpandedIndex(null)}
                    onImagesChange={onImagesChange}
                    images={images}
                />
            )}
        </div>
    );
}
