import type { BirdObservation, BirdSpecies } from "./types";

export abstract class DataSource {
    private speciesCache: BirdSpecies[] | null = null;
    private observationsCache: BirdObservation[] | null = null;

    // Abstract methods — must be implemented by subclasses
    protected abstract fetchBirdSpecies(): Promise<BirdSpecies[]>;
    protected abstract fetchBirdObservations(): Promise<BirdObservation[]>;

    // Cached getter for species
    async getBirdSpecies(force?: boolean): Promise<BirdSpecies[]> {
        if (force) {
            this.speciesCache = null;
        }
        if (!this.speciesCache) {
            this.speciesCache = await this.fetchBirdSpecies();
        }
        return this.speciesCache;
    }

    // Cached getter for observations
    async getBirdObservations(force?: boolean): Promise<BirdObservation[]> {
        if (force) {
            this.observationsCache = null;
        }
        if (!this.observationsCache) {
            this.observationsCache = await this.fetchBirdObservations();
        }
        return this.observationsCache;
    }

    // Optional manual cache reset
    clearCache(): void {
        this.speciesCache = null;
        this.observationsCache = null;
    }

    async getBirdSpeciesById(id: string): Promise<BirdSpecies | null> {
        const species = await this.getBirdSpecies();
        return species.find((s) => s.id === id) || null;
    }

    async getBirdObservationsBySpeciesId(speciesId: string): Promise<BirdObservation[]> {
        const observations = await this.getBirdObservations();
        return observations.filter((obs) => obs.speciesId === speciesId);
    }

    async speciesExists(speciesId: string): Promise<boolean> {
        const species = await this.getBirdSpecies();
        return species.some((s) => s.id === speciesId);
    }

    async getSpeciesCount(): Promise<number> {
        const species = await this.getBirdSpecies();
        return species.length;
    }

    async getObservationCount(): Promise<number> {
        const observations = await this.getBirdObservations();
        return observations.length;
    }

    async speciesHasObservations(speciesId: string): Promise<boolean> {
        const observations = await this.getBirdObservations();
        return observations.some((obs) => obs.speciesId === speciesId);
    }

    async saveBirdSpecies(species: BirdSpecies): Promise<void> {
        console.warn("saveBirdSpecies() called on a read-only data source", species);
    }

    async saveBirdObservation(observation: BirdObservation): Promise<void> {
        console.warn("saveBirdObservation() called on a read-only data source", observation);
    }

    async deleteBirdSpecies(speciesId: string): Promise<void> {
        console.warn("deleteBirdSpecies() called on a read-only data source", speciesId);
    }

    async deleteBirdObservation(observationId: string): Promise<void> {
        console.warn("deleteBirdObservation() called on a read-only data source", observationId);
    }
}
