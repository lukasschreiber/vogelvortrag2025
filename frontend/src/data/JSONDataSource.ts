import type { BirdObservation, BirdSpecies } from "./types";
import observations from "../assets/observations.json" assert { type: "json" };
import species from "../assets/species.json" assert { type: "json" };
import { DataSource } from "./DataSource";

export class JSONDataSource extends DataSource {
    protected fetchBirdSpecies(): Promise<BirdSpecies[]> {
        return Promise.resolve((species as { species: BirdSpecies[] }).species);
    }

    protected fetchBirdObservations(): Promise<BirdObservation[]> {
        return Promise.resolve((observations as { observations: BirdObservation[] }).observations);
    }
}
