import React, { useEffect, useRef, useState } from "react";
import type { BirdSpecies } from "../../data/types";
import { Modal } from "../Modal";
import { Select } from "../Select";
import { Input } from "../Input";
import { Button } from "../Button";
import { ImageUploader } from "../ImageUploader";
import { useBirdData } from "../../contexts/BirdDataContext";
import { BirdSongSelector } from "../BirdSongSelector";

interface BirdModalProps {
    open: boolean;
    onClose: () => void;
    initialData?: Partial<BirdSpecies>;
    onSave: (bird: BirdSpecies) => void;
    editMode?: "add" | "edit";
}

export function BirdEditModal({ open, onClose, initialData, onSave, editMode = "add" }: BirdModalProps) {
    const { dataSource } = useBirdData();
    const [form, setForm] = useState<BirdSpecies>({
        id: "",
        commonName: "",
        scientificName: "",
        family: "",
        conservationStatus: "LC",
        images: [],
    });

    const confirmRef = useRef<HTMLButtonElement>(null);
    const [allSpecies, setAllSpecies] = useState<BirdSpecies[]>([]);

    useEffect(() => {
        dataSource.getBirdSpecies().then((species) => setAllSpecies(species));
    }, [dataSource]);

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
            title={editMode === "edit" ? "Art Bearbeiten" : "Neue Art Hinzufügen"}
            initialFocusRef={confirmRef}
            size="lg"
            footer={
                <>
                    <Button onClick={onClose} variant="subdue">
                        Abbrechen
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={!form.commonName || !form.scientificName}>
                        Speichern
                    </Button>
                </>
            }
        >
            <div className="space-y-3">
                {/* --- Basic Fields --- */}
                <Input
                    required
                    name="id"
                    label="ID (automatisch aus dem wissenschaftlichen Namen generiert)"
                    readOnly
                    value={form.id}
                    onChange={handleChange}
                />

                <Input
                    name="commonName"
                    required
                    label="Deutscher Name"
                    value={form.commonName}
                    onChange={handleChange}
                />

                {editMode === "add" &&
                    allSpecies.some((s) => s.commonName.toLowerCase() === form.commonName.toLowerCase()) && (
                        <p className="text-sm text-red-500">Eine Art mit dem gleichen Namen existiert bereits.</p>
                    )}

                <Input
                    required
                    name="scientificName"
                    label="Wissenschaftlicher Name"
                    value={form.scientificName}
                    onChange={handleChange}
                />

                {editMode === "add" &&
                    allSpecies.some((s) => s.scientificName.toLowerCase() === form.scientificName.toLowerCase()) && (
                        <p className="text-sm text-red-500">
                            Eine Art mit dem gleichen wissenschaftlichen Namen existiert bereits.
                        </p>
                    )}

                <Input name="family" label="Familie" value={form.family} onChange={handleChange} />

                <Select
                    name="conservationStatus"
                    label="Rote Liste Status"
                    value={form.conservationStatus}
                    onChange={handleChange}
                    options={[
                        { value: "LC", label: "Least Concern (LC)" },
                        { value: "NT", label: "Near Threatened (NT)" },
                        { value: "VU", label: "Vulnerable (VU)" },
                        { value: "EN", label: "Endangered (EN)" },
                        { value: "CR", label: "Critically Endangered (CR)" },
                        { value: "EW", label: "Extinct in the Wild (EW)" },
                        { value: "EX", label: "Extinct (EX)" },
                    ]}
                />

                {/* --- Images --- */}
                <ImageUploader
                    label="Vogel Bild(er)"
                    images={form.images}
                    onImagesChange={(imgs) => setForm((prev) => ({ ...prev, images: imgs }))}
                    maxImages={10}
                />

                <BirdSongSelector
                    species={form}
                    onBirdSongsChange={() => {} /** setForm((prev) => ({ ...prev, birdSongs: songs }) ) */}
                />
            </div>
        </Modal>
    );
}
