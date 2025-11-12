from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, RootModel, field_validator


# --- Enums --------------------------------------------------------------------


class ConservationStatus(str, Enum):
    LC = "LC"  # Least Concern
    NT = "NT"  # Near Threatened
    VU = "VU"  # Vulnerable
    EN = "EN"  # Endangered
    CR = "CR"  # Critically Endangered
    EW = "EW"  # Extinct in the Wild
    EX = "EX"  # Extinct


# --- Core Types ---------------------------------------------------------------



class FitSettings(BaseModel):
    """How the image should be cropped or positioned for display."""

    scale: float = Field(
        default=1.0,
        ge=0.5,
        le=5.0,
        description="Zoom level (1=default, >1=zoom in)."
    )
    offsetX: float = Field(
        default=0.0,
        ge=-1.0,
        le=1.0,
        description="Horizontal offset (-1=left, 1=right), normalized."
    )
    offsetY: float = Field(
        default=0.0,
        ge=-1.0,
        le=1.0,
        description="Vertical offset (-1=up, 1=down), normalized."
    )

class BirdImage(BaseModel):
    url: str
    author: Optional[str] = None
    license: Optional[str] = None
    description: Optional[str] = None
    fit: Optional[FitSettings] = None
    width: Optional[int] = None
    height: Optional[int] = None
    
    @field_validator("url")
    @classmethod
    def allow_relative_or_http(cls, v: str):
        if v.startswith("/") or v.startswith("http"):
            return v
        raise ValueError("url must be relative (/uploads/...) or absolute (http...)")

class LatLng(BaseModel):
    latitude: float = Field(ge=-90.0, le=90.0)
    longitude: float = Field(ge=-180.0, le=180.0)


class BirdSpecies(BaseModel):
    id: str
    commonName: str
    scientificName: str
    family: str
    conservationStatus: Optional[ConservationStatus] = None
    images: List[BirdImage] = Field(default_factory=list)
    recordings: List[XenoCantoRecording] = Field(default_factory=list)


class BirdObservation(BaseModel):
    id: str
    speciesId: str
    date: str  # ISO date string (kept as string to mirror TS)
    location: LatLng
    observer: str
    title: str
    notes: Optional[str] = None
    image: Optional[BirdImage] = None
    recording: Optional[XenoCantoRecording] = None
    mystery: bool = False
    includeAudioInMarker: bool = True

    @field_validator("date")
    @classmethod
    def validate_iso_date(cls, v: str) -> str:
        # Accept both dates and datetimes in ISO 8601; keep original string
        try:
            # Try datetime first
            datetime.fromisoformat(v.replace("Z", "+00:00"))
        except ValueError as e:
            raise ValueError("date must be an ISO 8601 string") from e
        return v


# --- Response wrappers (optional but nice for consistency) --------------------


class Count(BaseModel):
    count: int

class SpeciesList(RootModel[List[BirdSpecies]]):
    root: List[BirdSpecies]


class ObservationList(RootModel[List[BirdObservation]]):
    root: List[BirdObservation]

class XenoCantoSono(BaseModel):
    small: Optional[str] = None
    med: Optional[str] = None
    large: Optional[str] = None
    full: Optional[str] = None


class XenoCantoOsci(BaseModel):
    small: Optional[str] = None
    med: Optional[str] = None
    large: Optional[str] = None


class XenoCantoRecording(BaseModel):
    id: str
    gen: Optional[str] = None
    sp: Optional[str] = None
    ssp: Optional[str] = None
    grp: Optional[str] = None
    en: Optional[str] = None
    rec: Optional[str] = None
    cnt: Optional[str] = None
    loc: Optional[str] = None
    lat: Optional[str] = None
    lon: Optional[str] = None
    alt: Optional[str] = None
    type: Optional[str] = None
    sex: Optional[str] = None
    stage: Optional[str] = None
    method: Optional[str] = None
    url: Optional[str] = None
    file: Optional[str] = None
    file_name: Optional[str] = Field(None, alias="file-name")
    sono: Optional[XenoCantoSono] = None
    osci: Optional[XenoCantoOsci] = None
    lic: Optional[str] = None
    q: Optional[str] = None
    length: Optional[str] = None
    time: Optional[str] = None
    date: Optional[str] = None
    uploaded: Optional[str] = None
    also: List[str] = Field(default_factory=list)
    rmk: Optional[str] = None
    animal_seen: Optional[str] = Field(None, alias="animal-seen")
    playback_used: Optional[str] = Field(None, alias="playback-used")
    temp: Optional[str] = None
    regnr: Optional[str] = None
    auto: Optional[str] = None
    dvc: Optional[str] = None
    mic: Optional[str] = None
    smp: Optional[str] = None
