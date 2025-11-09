from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple, TypedDict

from pydantic import TypeAdapter

from models import BirdObservation, BirdSpecies


class _Database(TypedDict):
    species: List[BirdSpecies]
    observations: List[BirdObservation]


_SPECIES_ADAPTER = TypeAdapter(List[BirdSpecies])
_OBS_ADAPTER = TypeAdapter(List[BirdObservation])


class JsonRepository:
    """
    A tiny JSON 'database' with strict typing. Safe for small projects and
    easy to hand-edit. It keeps an in-memory cache and writes atomically.
    """

    def __init__(self, path: Path) -> None:
        self._path = path
        self._species: List[BirdSpecies] = []
        self._observations: List[BirdObservation] = []
        self._loaded: bool = False

    # ---- load/save -----------------------------------------------------------

    def _ensure_loaded(self) -> None:
        if self._loaded:
            return
        if not self._path.exists():
            self._species, self._observations = [], []
            self._save()
            self._loaded = True
            return

        data = json.loads(self._path.read_text(encoding="utf-8"))
        self._species = _SPECIES_ADAPTER.validate_python(data.get("species", []))
        self._observations = _OBS_ADAPTER.validate_python(data.get("observations", []))
        self._loaded = True

    def _save(self) -> None:
        tmp = self._path.with_suffix(self._path.suffix + ".tmp")
        payload = {
            "species": [s.model_dump(mode="json") for s in self._species],
            "observations": [o.model_dump(mode="json") for o in self._observations],
        }
        tmp.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        tmp.replace(self._path)

    # ---- species API ---------------------------------------------------------

    def list_species(self) -> List[BirdSpecies]:
        self._ensure_loaded()
        return list(self._species)

    def get_species(self, species_id: str) -> Optional[BirdSpecies]:
        self._ensure_loaded()
        return next((s for s in self._species if s.id == species_id), None)

    def upsert_species(self, species: BirdSpecies) -> BirdSpecies:
        self._ensure_loaded()
        existing = self.get_species(species.id)
        if existing:
            idx = next(i for i, s in enumerate(self._species) if s.id == species.id)
            self._species[idx] = species
        else:
            self._species.append(species)
        self._save()
        return species

    def delete_species(self, species_id: str) -> bool:
        self._ensure_loaded()
        before = len(self._species)
        self._species = [s for s in self._species if s.id != species_id]
        # Also cascade delete observations for that species
        self._observations = [
            o for o in self._observations if o.speciesId != species_id
        ]
        changed = len(self._species) != before
        if changed:
            self._save()
        return changed

    def species_count(self) -> int:
        self._ensure_loaded()
        return len(self._species)

    # ---- observation API -----------------------------------------------------

    def list_observations(
        self,
        *,
        species_id: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        limit: Optional[int] = None,
        offset: int = 0,
    ) -> List[BirdObservation]:
        self._ensure_loaded()
        obs = self._observations
        if species_id:
            obs = [o for o in obs if o.speciesId == species_id]
        if date_from:
            obs = [o for o in obs if o.date >= date_from]
        if date_to:
            obs = [o for o in obs if o.date < date_to]
        obs = obs[offset : (offset + limit) if limit is not None else None]
        return list(obs)

    def get_observation(self, obs_id: str) -> Optional[BirdObservation]:
        self._ensure_loaded()
        return next((o for o in self._observations if o.id == obs_id), None)

    def upsert_observation(self, obs: BirdObservation) -> BirdObservation:
        self._ensure_loaded()
        existing = self.get_observation(obs.id)
        if existing:
            idx = next(i for i, o in enumerate(self._observations) if o.id == obs.id)
            self._observations[idx] = obs
        else:
            self._observations.append(obs)
        self._save()
        return obs

    def delete_observation(self, obs_id: str) -> bool:
        self._ensure_loaded()
        before = len(self._observations)
        self._observations = [o for o in self._observations if o.id != obs_id]
        changed = len(self._observations) != before
        if changed:
            self._save()
        return changed

    def observation_count(self) -> int:
        self._ensure_loaded()
        return len(self._observations)

    def species_has_observations(self, species_id: str) -> bool:
        self._ensure_loaded()
        return any(o.speciesId == species_id for o in self._observations)
