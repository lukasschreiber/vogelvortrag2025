# Start with uvicorn main:app --reload --port 8000

from __future__ import annotations

from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Request, Response, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
import uuid
import io
from PIL import Image
import hashlib

from models import (
    BirdObservation,
    BirdSpecies,
    ObservationList,
    SpeciesList,
    Count,
)
from dotenv import load_dotenv
from storage import JsonRepository
import os

if os.getenv("ENV", "development") == "development":
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ Loaded .env from: {env_path}")
    else:
        print(f"⚠️ No .env file found at: {env_path}")

# --- App & CORS ---------------------------------------------------------------

app = FastAPI(title="Vogelvortrag API", version="1.0.0")

UPLOAD_DIR = Path("uploads")
CACHE_DIR = UPLOAD_DIR / "_cache"
EDIT_LINK_KEY = os.getenv("EDIT_LINK_KEY") or "default_edit_key"
print(f"🔑 Using EDIT_LINK_KEY: {EDIT_LINK_KEY}")
CACHE_DIR.mkdir(exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "x-edit-key"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

repo = JsonRepository(Path("./birds.data.json"))

@app.middleware("http")
async def verify_edit_key(request: Request, call_next):
    # Only check for modifying methods
    if request.method not in ("GET", "HEAD", "OPTIONS"):
        provided_key = (
            request.headers.get("x-edit-key")
            or request.query_params.get("edit_key")
        )
        if not EDIT_LINK_KEY:
            # No key set in env — warn but don't block (or raise if you prefer)
            return Response(
                content="Server misconfiguration: missing EDIT_LINK_KEY",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        if provided_key != EDIT_LINK_KEY:
            print(f"❌ Unauthorized edit attempt with key: {provided_key}")
            return Response(
                content="Unauthorized: invalid or missing edit key",
                status_code=status.HTTP_403_FORBIDDEN,
            )

    response = await call_next(request)
    return response


# --- Health -------------------------------------------------------------------


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# --- Species endpoints --------------------------------------------------------


@app.get("/species", response_model=SpeciesList)
def list_species() -> SpeciesList:
    return SpeciesList(repo.list_species())


@app.get("/species/count", response_model=Count)
def species_count() -> Count:
    return Count(count=repo.species_count())


@app.get("/species/{species_id}", response_model=BirdSpecies)
def get_species(species_id: str) -> BirdSpecies:
    s = repo.get_species(species_id)
    if not s:
        raise HTTPException(status_code=404, detail="Species not found")
    return s


@app.put("/species/{species_id}", response_model=BirdSpecies)
def put_species(species_id: str, payload: BirdSpecies) -> BirdSpecies:
    if payload.id != species_id:
        raise HTTPException(status_code=400, detail="Path id and body id differ")
    return repo.upsert_species(payload)


@app.post("/species", response_model=BirdSpecies, status_code=201)
def create_species(payload: BirdSpecies) -> BirdSpecies:
    return repo.upsert_species(payload)


@app.delete("/species/{species_id}", status_code=204)
def delete_species(species_id: str) -> None:
    if not repo.delete_species(species_id):
        raise HTTPException(status_code=404, detail="Species not found")


@app.get("/species/{species_id}/has-observations", response_model=bool)
def species_has_observations(species_id: str) -> bool:
    return repo.species_has_observations(species_id)


# --- Observation endpoints ----------------------------------------------------


@app.get("/observations", response_model=ObservationList)
def list_observations(
    speciesId: Optional[str] = Query(default=None),
    dateFrom: Optional[str] = Query(default=None, description="ISO 8601 inclusive"),
    dateTo: Optional[str] = Query(default=None, description="ISO 8601 exclusive"),
    limit: Optional[int] = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
) -> ObservationList:
    obs = repo.list_observations(
        species_id=speciesId,
        date_from=dateFrom,
        date_to=dateTo,
        limit=limit,
        offset=offset,
    )
    return ObservationList(obs)


@app.get("/observations/count", response_model=Count)
def observation_count() -> Count:
    return Count(count=repo.observation_count())


@app.get("/observations/{observation_id}", response_model=BirdObservation)
def get_observation(observation_id: str) -> BirdObservation:
    o = repo.get_observation(observation_id)
    if not o:
        raise HTTPException(status_code=404, detail="Observation not found")
    return o


@app.put("/observations/{observation_id}", response_model=BirdObservation)
def put_observation(observation_id: str, payload: BirdObservation) -> BirdObservation:
    if payload.id != observation_id:
        raise HTTPException(status_code=400, detail="Path id and body id differ")
    # Optional: ensure species exists (comment out to allow 'free' data)
    if not repo.get_species(payload.speciesId):
        raise HTTPException(status_code=400, detail="Referenced species does not exist")
    return repo.upsert_observation(payload)


@app.post("/observations", response_model=BirdObservation, status_code=201)
def create_observation(payload: BirdObservation) -> BirdObservation:
    if not repo.get_species(payload.speciesId):
        raise HTTPException(status_code=400, detail="Referenced species does not exist")
    return repo.upsert_observation(payload)


@app.delete("/observations/{observation_id}", status_code=204)
def delete_observation(observation_id: str) -> None:
    if not repo.delete_observation(observation_id):
        raise HTTPException(status_code=404, detail="Observation not found")


@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are allowed")

    # Generate unique filename (preserving extension)
    ext = Path(file.filename).suffix
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = UPLOAD_DIR / unique_name

    # Save file to disk
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Return a BirdImage-compatible object
    return {
        "url": f"/uploads/{unique_name}",
        "description": f"Uploaded {file.filename}",
    }
    
@app.get("/image/{filename}")
async def serve_image(
    filename: str,
    w: Optional[int] = Query(default=None, ge=1, le=4096),
    h: Optional[int] = Query(default=None, ge=1, le=4096),
    q: int = Query(default=85, ge=10, le=100, description="JPEG/WEBP quality"),
    fmt: Optional[str] = Query(default=None, description="Force output format: jpg, webp, png"),
):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    # If no resize params → redirect to static version
    if not w and not h and not fmt:
        return RedirectResponse(url=f"/uploads/{filename}")

    try:
        # --- Build cache key ---------------------------------------------------
        # Create a unique hash from filename + parameters
        key_data = f"{filename}|w={w}|h={h}|q={q}|fmt={fmt}"
        cache_hash = hashlib.sha1(key_data.encode()).hexdigest()[:16]
        ext = (fmt or Path(filename).suffix.lstrip(".") or "jpg").lower()
        cache_file = CACHE_DIR / f"{cache_hash}.{ext}"

        # --- Serve cached file if exists --------------------------------------
        if cache_file.exists():
            return Response(
                content=cache_file.read_bytes(),
                media_type=f"image/{ext if ext != 'jpg' else 'jpeg'}",
            )

        # --- Resize + save to cache -------------------------------------------
        with Image.open(file_path) as img:
            orig_w, orig_h = img.size

            # Preserve aspect ratio if only one dimension provided
            if w and not h:
                h = int(orig_h * (w / orig_w))
            elif h and not w:
                w = int(orig_w * (h / orig_h))
            elif not w and not h:
                w, h = orig_w, orig_h

            img = img.resize((w, h), Image.Resampling.LANCZOS)

            fmt_final = (fmt or img.format or "JPEG").upper()
            if fmt_final == "JPG":
                fmt_final = "JPEG"

            buf = io.BytesIO()
            if fmt_final in ("JPEG", "WEBP"):
                img.save(buf, format=fmt_final, quality=q, optimize=True)
            else:
                img.save(buf, format=fmt_final)
            buf.seek(0)

            # Save to cache
            with cache_file.open("wb") as f:
                f.write(buf.getvalue())

            return Response(
                content=buf.getvalue(),
                media_type=f"image/{fmt_final.lower()}"
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {e}")