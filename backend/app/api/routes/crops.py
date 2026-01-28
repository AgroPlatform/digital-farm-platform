from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.db.session import get_db
from app.models.user import User
from app.models.crop import Crop as CropModel
from app.schemas.crop import Crop, CropCreate, CropUpdate

router = APIRouter()

@router.get("/", response_model=List[Crop])
def read_crops(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    season: Optional[str] = None
):
    """
    Retrieve crops with optional filtering.
    """
    query = db.query(CropModel)
    
    if type and type != 'all':
        query = query.filter(CropModel.type == type)
    if season and season != 'all':
        query = query.filter(CropModel.season == season)
        
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=Crop)
def create_crop(
    *,
    db: Session = Depends(get_db),
    crop_in: CropCreate,
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Create new crop.
    """
    crop = CropModel(**crop_in.dict())
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop

@router.put("/{crop_id}", response_model=Crop)
def update_crop(
    *,
    db: Session = Depends(get_db),
    crop_id: int,
    crop_in: CropUpdate,
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Update a crop.
    """
    crop = db.query(CropModel).filter(CropModel.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    update_data = crop_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(crop, field, value)
        
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop

@router.delete("/{crop_id}", response_model=Crop)
def delete_crop(
    *,
    db: Session = Depends(get_db),
    crop_id: int,
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Delete a crop.
    """
    crop = db.query(CropModel).filter(CropModel.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    db.delete(crop)
    db.commit()
    return crop
