import React, { useEffect, useRef, useState } from "react";
import type { BirdObservation, BirdSpecies } from "../../data/types";
import { Modal } from "../Modal";
import { useBirdData } from "../../contexts/BirdDataContext";
import { Button } from "../Button";
import { Input } from "../Input";
import { Textarea } from "../Textarea";
import { ImageUploader } from "../ImageUploader"; // ✅ Reuse our new component
import { Select } from "../Select";

interface ObservationEditModalProps {
    open: boolean;
    onClose: () => void;
    initialData?: Partial<BirdObservation>;
    onSave: (obs: BirdObservation) => void;
    editMode?: "add" | "edit";
}

export function ObservationEditModal({
    open,
    onClose,
    initialData,
    onSave,
    editMode = "add",
}: ObservationEditModalProps) {
    const { dataSource } = useBirdData();
    const [speciesList, setSpeciesList] = useState<BirdSpecies[]>([]);
    const confirmRef = useRef<HTMLButtonElement>(null);

    const [form, setForm] = useState<BirdObservation>({
        id: "",
        speciesId: "",
        date: new Date().toISOString().split("T")[0],
        location: { latitude: 0, longitude: 0 },
        observer: "",
        title: "",
        notes: "",
    });

    // ✅ Fetch bird species
    useEffect(() => {
        (async () => {
            const species = await dataSource.getBirdSpecies();
            setSpeciesList(species);
        })();
    }, [dataSource]);

    // ✅ Initialize form data
    useEffect(() => {
        if (initialData) {
            setForm({
                id: editMode === "add" ? crypto.randomUUID() : initialData.id || "",
                speciesId: initialData.speciesId || "",
                date: initialData.date || new Date().toISOString().split("T")[0],
                location: initialData.location || { latitude: 0, longitude: 0 },
                observer: initialData.observer || "",
                title: initialData.title || "",
                notes: initialData.notes || "",
                image: initialData.image,
            });
        } else {
            setForm({
                id: crypto.randomUUID(),
                speciesId: "",
                date: new Date().toISOString().split("T")[0],
                location: { latitude: 0, longitude: 0 },
                observer: "",
                title: "",
                notes: "",
            });
        }
    }, [initialData, open, editMode]);

    // ✅ Field change handlers
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleLocationChange(field: "latitude" | "longitude", value: number) {
        setForm((prev) => ({
            ...prev,
            location: { ...prev.location, [field]: value },
        }));
    }

    function handleSave() {
        onSave(form);
        onClose();
    }

    return (
        <Modal
            open={open}
            stickyFooter={true}
            stickyHeader={true}
            onClose={onClose}
            title={editMode === "edit" ? "Beobachtung Bearbeiten" : "Neue Beobachtung Hinzufügen"}
            size="lg"
            initialFocusRef={confirmRef}
            footer={
                <>
                    <Button onClick={onClose} variant="subdue">
                        Abbrechen
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={
                            !form.speciesId ||
                            !form.title ||
                            !form.location.latitude ||
                            !form.location.longitude
                        }
                    >
                        Speichern
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                {/* Species selection */}
                <Select
                    required
                    label="Bird Species"
                    name="speciesId"
                    value={form.speciesId}
                    onChange={handleChange}
                    options={[
                        {
                            value: "",
                            label: "Art auswählen...",
                        },
                        ...speciesList.map((s) => ({
                            value: s.id,
                            label: `${s.commonName} (${s.scientificName})`,
                        })),
                    ]}
                />

                {/* Basic info */}
                <Input label="Titel" required name="title" value={form.title} onChange={handleChange} />

                <Input label="Beobachter" name="observer" value={form.observer} onChange={handleChange} />

                <Input label="Datum (ungefähr)" name="date" type="date" value={form.date} onChange={handleChange} />

                {/* Location */}
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        required
                        label="Breitengrad (dezimal)"
                        name="latitude"
                        type="number"
                        step="0.000001"
                        value={form.location.latitude}
                        onChange={(e) => handleLocationChange("latitude", parseFloat(e.target.value))}
                    />
                    <Input
                        required
                        label="Längengrad (dezimal)"
                        name="longitude"
                        type="number"
                        step="0.000001"
                        value={form.location.longitude}
                        onChange={(e) => handleLocationChange("longitude", parseFloat(e.target.value))}
                    />
                </div>

                {/* Notes */}
                <Textarea label="Notizen" name="notes" rows={4} value={form.notes || ""} onChange={handleChange} />

                {/* ✅ Single image uploader */}
                <ImageUploader
                    label="Beobachtungs Bild(er)"
                    images={form.image ? [form.image] : []}
                    onImagesChange={(imgs) => setForm((prev) => ({ ...prev, image: imgs[0] }))}
                    maxImages={1}
                />
            </div>
        </Modal>
    );
}
