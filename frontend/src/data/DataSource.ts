import type { BirdObservation, BirdSpecies } from "./types";

export abstract class DataSource {
    private speciesCache: BirdSpecies[] | null = null;
    private observationsCache: BirdObservation[] | null = null;

    // NEW: track in-flight fetches
    private speciesPromise: Promise<BirdSpecies[]> | null = null;
    private observationsPromise: Promise<BirdObservation[]> | null = null;

    protected abstract fetchBirdSpecies(): Promise<BirdSpecies[]>;
    protected abstract fetchBirdObservations(): Promise<BirdObservation[]>;

    async invalidateSpeciesCache(): Promise<void> {
        console.log("Invalidating species cache");
        this.speciesCache = null;
        this.speciesPromise = null; // reset in-flight
    }

    async invalidateObservationsCache(): Promise<void> {
        console.log("Invalidating observations cache");
        this.observationsCache = null;
        this.observationsPromise = null; // reset in-flight
    }

    async getBirdSpecies(): Promise<BirdSpecies[]> {
        if (this.speciesCache) {
            return this.speciesCache;
        }

        if (!this.speciesPromise) {
            this.speciesPromise = this.fetchBirdSpecies()
                .then((data) => {
                    this.speciesCache = data;
                    this.speciesPromise = null; // clear after resolution
                    return data;
                })
                .catch((err) => {
                    this.speciesPromise = null;
                    throw err;
                });
        }

        return this.speciesPromise;
    }

    async getBirdObservations(): Promise<BirdObservation[]> {
        if (this.observationsCache) {
            return this.observationsCache;
        }

        if (!this.observationsPromise) {
            this.observationsPromise = this.fetchBirdObservations()
                .then((data) => {
                    this.observationsCache = data;
                    this.observationsPromise = null;
                    return data;
                })
                .catch((err) => {
                    this.observationsPromise = null;
                    throw err;
                });
        }

        return this.observationsPromise;
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
