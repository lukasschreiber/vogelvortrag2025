import { DataSource } from "./DataSource";
import type { BirdSpecies, BirdObservation } from "./types";

/**
 * A concrete DataSource that loads data from the Python FastAPI backend.
 */
export class PythonDataSource extends DataSource {
    private baseUrl: string;

    constructor(baseUrl: string) {
        super();
        this.baseUrl = baseUrl.replace(/\/+$/, ""); // remove trailing slash
        console.log(`PythonDataSource initialized with baseUrl: ${this.baseUrl}`);
    }

    /**
     * A centralized fetch helper that standardizes headers, error handling, and JSON parsing.
     */
    private async fetchJson<T>(endpoint: string, options: RequestInit = {}, expectJson: boolean = true): Promise<T> {
        const editKey = window.location.search.includes("edit=")
            ? new URLSearchParams(window.location.search).get("edit") || ""
            : "";
        const editKeyIsValid = editKey === import.meta.env.VITE_EDIT_LINK_KEY;
        console.log(
            `PythonDataSource: fetchJson called for endpoint ${endpoint} with editKeyIsValid = ${editKeyIsValid}, editKey = ${editKey}`
        );
        const res = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...(options.headers ?? {}),
                Accept: "application/json",
                "x-edit-key": editKeyIsValid ? editKey : "",
            },
        });

        if (!res.ok) {
            throw new Error(`Request failed (${res.status}): ${res.statusText}`);
        }

        return expectJson ? await res.json() : (undefined as unknown as T);
    }

    // --- Required abstract implementations ---

    protected async fetchBirdSpecies(): Promise<BirdSpecies[]> {
        const data = await this.fetchJson<any>("/species");
        return this.unwrapRoot<BirdSpecies>(data);
    }

    protected async fetchBirdObservations(): Promise<BirdObservation[]> {
        const data = await this.fetchJson<any>("/observations");
        return this.unwrapRoot<BirdObservation>(data);
    }

    async saveBirdSpecies(species: BirdSpecies): Promise<void> {
        await this.fetchJson<void>(
            "/species",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(species),
            },
            false
        );
        await this.invalidateSpeciesCache();
    }

    async saveBirdObservation(observation: BirdObservation): Promise<void> {
        await this.fetchJson<void>(
            "/observations",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(observation),
            },
            false
        );
        await this.invalidateObservationsCache();
    }

    async deleteBirdSpecies(speciesId: string): Promise<void> {
        await this.fetchJson<void>(
            `/species/${encodeURIComponent(speciesId)}`,
            {
                method: "DELETE",
            },
            false
        );
        await this.invalidateSpeciesCache();
    }

    async deleteBirdObservation(observationId: string): Promise<void> {
        await this.fetchJson<void>(
            `/observations/${encodeURIComponent(observationId)}`,
            {
                method: "DELETE",
            },
            false
        );
        await this.invalidateObservationsCache();
    }

    unwrapRoot<T>(data: any): T[] {
        return Array.isArray(data) ? data : (data?.root ?? []);
    }
}
