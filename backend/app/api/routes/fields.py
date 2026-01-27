from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Field, FieldHistory
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# Pydantic models
class FieldCreate(BaseModel):
    name: str
    size: float
    crop: str
    status: Optional[str] = "Actief"
    soil_type: Optional[str] = None
    soil_description: Optional[str] = None
    last_crop: Optional[str] = None
    next_action: Optional[str] = None
    current_status: Optional[str] = "In productie"
    current_crops: Optional[str] = None

class FieldResponse(BaseModel):
    id: int
    name: str
    size: float
    crop: str
    status: Optional[str]
    soil_type: Optional[str]
    soil_description: Optional[str]
    last_crop: Optional[str]
    next_action: Optional[str]
    current_status: Optional[str]
    current_crops: Optional[str]

class FieldUpdate(BaseModel):
    name: Optional[str] = None
    size: Optional[float] = None
    crop: Optional[str] = None
    status: Optional[str] = None
    soil_type: Optional[str] = None
    soil_description: Optional[str] = None
    last_crop: Optional[str] = None
    next_action: Optional[str] = None
    current_status: Optional[str] = None
    current_crops: Optional[str] = None

class FieldHistoryCreate(BaseModel):
    action: str
    details: Optional[str] = None

class FieldHistoryResponse(BaseModel):
    id: int
    field_id: int
    date: datetime
    action: str
    details: Optional[str]

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

@router.put("/fields/{field_id}", response_model=FieldResponse)
async def update_field(field_id: int, field_update: FieldUpdate, db: Session = Depends(get_db)):
    """Update een veld"""
    db_field = db.query(Field).filter(Field.id == field_id).first()
    if not db_field:
        raise HTTPException(status_code=404, detail="Veld niet gevonden")
    for key, value in field_update.dict(exclude_unset=True).items():
        setattr(db_field, key, value)
    db.commit()
    db.refresh(db_field)
    return db_field

@router.delete("/fields/{field_id}")
async def delete_field(field_id: int, db: Session = Depends(get_db)):
    """Verwijder een veld"""
    db_field = db.query(Field).filter(Field.id == field_id).first()
    if not db_field:
        raise HTTPException(status_code=404, detail="Veld niet gevonden")
    db.delete(db_field)
    db.commit()
    return {"message": "Veld verwijderd"}

@router.get("/fields/{field_id}/history", response_model=List[FieldHistoryResponse])
async def get_field_history(field_id: int, db: Session = Depends(get_db)):
    """Haal geschiedenis van een veld op"""
    history = db.query(FieldHistory).filter(FieldHistory.field_id == field_id).order_by(FieldHistory.date.desc()).all()
    return history

@router.post("/fields/{field_id}/history", response_model=FieldHistoryResponse)
async def add_field_history(field_id: int, history: FieldHistoryCreate, db: Session = Depends(get_db)):
    """Voeg een geschiedenis entry toe aan een veld"""
    db_field = db.query(Field).filter(Field.id == field_id).first()
    if not db_field:
        raise HTTPException(status_code=404, detail="Veld niet gevonden")
    history_entry = FieldHistory(field_id=field_id, date=datetime.utcnow(), action=history.action, details=history.details)
    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)
    return history_entry