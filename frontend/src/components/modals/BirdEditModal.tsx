import React, { useEffect, useRef, useState } from "react";
import type { BirdSpecies } from "../../data/types";
import { Modal } from "../Modal";
import { Select } from "../Select";
import { Input } from "../Input";
import { Button } from "../Button";
import { ImageUploader } from "../ImageUploader";

interface BirdModalProps {
    open: boolean;
    onClose: () => void;
    initialData?: Partial<BirdSpecies>;
    onSave: (bird: BirdSpecies) => void;
    editMode?: "add" | "edit";
}

export function BirdEditModal({ open, onClose, initialData, onSave, editMode = "add" }: BirdModalProps) {
    const [form, setForm] = useState<BirdSpecies>({
        id: "",
        commonName: "",
        scientificName: "",
        family: "",
        conservationStatus: "LC",
        images: [],
    });

    const confirmRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (initialData) {
            setForm({
                id:
                    editMode === "add"
                        ? initialData.scientificName?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || ""
                        : initialData.id || "",
                commonName: initialData.commonName || "",
                scientificName: initialData.scientificName || "",
                family: initialData.family || "",
                conservationStatus: initialData.conservationStatus || "LC",
                images: initialData.images || [],
            });
        } else {
            setForm({
                id: "",
                commonName: "",
                scientificName: "",
                family: "",
                conservationStatus: "LC",
                images: [],
            });
        }
    }, [initialData, open, editMode]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (name === "scientificName" && editMode === "add") {
            setForm((prev) => ({
                ...prev,
                id: value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            }));
        }
    }

    function handleSave() {
        onSave(form);
        onClose();
    }

    return (
        <Modal
            open={open}
            stickyFooter
            stickyHeader
            onClose={onClose}
            title={editMode === "edit" ? "Edit Bird" : "Add New Bird"}
            initialFocusRef={confirmRef}
            size="lg"
            footer={
                <>
                    <Button onClick={onClose} variant="subdue">
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Save
                    </Button>
                </>
            }
        >
            <div className="space-y-3">
                {/* --- Basic Fields --- */}
                <Input
                    name="id"
                    label="ID (auto from scientific name)"
                    readOnly
                    value={form.id}
                    onChange={handleChange}
                />
                <Input name="commonName" label="Common Name" value={form.commonName} onChange={handleChange} />
                <Input
                    name="scientificName"
                    label="Scientific Name"
                    value={form.scientificName}
                    onChange={handleChange}
                />
                <Input name="family" label="Family" value={form.family} onChange={handleChange} />

                <Select
                    name="conservationStatus"
                    label="Conservation Status"
                    value={form.conservationStatus}
                    onChange={handleChange}
                    options={[
                        { value: "LC", label: "Least Concern" },
                        { value: "NT", label: "Near Threatened" },
                        { value: "VU", label: "Vulnerable" },
                        { value: "EN", label: "Endangered" },
                        { value: "CR", label: "Critically Endangered" },
                        { value: "EW", label: "Extinct in the Wild" },
                        { value: "EX", label: "Extinct" },
                    ]}
                />

                {/* --- Images --- */}
                <ImageUploader
                    label="Bird Images"
                    images={form.images}
                    onImagesChange={(imgs) => setForm((prev) => ({ ...prev, images: imgs }))}
                    maxImages={10} // configurable
                />
            </div>
        </Modal>
    );
}
