from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Field
from pydantic import BaseModel
from typing import List

router = APIRouter()

# Pydantic models
class FieldCreate(BaseModel):
    name: str
    size: float
    crop: str

class FieldResponse(BaseModel):
    id: int
    name: str
    size: float
    crop: str

@router.get("/fields", response_model=List[FieldResponse])
async def get_fields(db: Session = Depends(get_db)):
    """Haal alle velden op"""
    fields = db.query(Field).all()
    return fields

@router.get("/fields/{field_id}", response_model=FieldResponse)
async def get_field(field_id: int, db: Session = Depends(get_db)):
    """Haal informatie over een specifiek veld op"""
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Veld niet gevonden")
    return field

@router.post("/fields", response_model=FieldResponse)
async def create_field(field: FieldCreate, db: Session = Depends(get_db)):
    """Maak een nieuw veld aan"""
    db_field = Field(**field.dict())
    db.add(db_field)
    db.commit()
    db.refresh(db_field)
    return db_field