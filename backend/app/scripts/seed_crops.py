import asyncio
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models.crop import Crop
from app.db.session import Base

# Data from the frontend with growth_days (duration in days)
initial_crops_data = [
    { "name": 'Aardappelen', "type": 'Knolgewas', "season": 'Lente', "duration": '120 dagen', "growth_days": 120, "water_needs": 'Medium', "expected_yield": '40 ton/ha', "status": 'actief', "icon": '🥔' },
    { "name": 'Tarwe', "type": 'Graan', "season": 'Herfst', "duration": '240 dagen', "growth_days": 240, "water_needs": 'Laag', "expected_yield": '8 ton/ha', "status": 'actief', "icon": '🌾' },
    { "name": 'Maïs', "type": 'Graan', "season": 'Zomer', "duration": '90 dagen', "growth_days": 90, "water_needs": 'Hoog', "expected_yield": '12 ton/ha', "status": 'actief', "icon": '🌽' },
    { "name": 'Suikerbieten', "type": 'Knolgewas', "season": 'Lente', "duration": '180 dagen', "growth_days": 180, "water_needs": 'Medium', "expected_yield": '60 ton/ha', "status": 'inactief', "icon": '🍬' },
    { "name": 'Gerst', "type": 'Graan', "season": 'Herfst', "duration": '210 dagen', "growth_days": 210, "water_needs": 'Laag', "expected_yield": '7 ton/ha', "status": 'actief', "icon": '🌾' },
    { "name": 'Uien', "type": 'Bolgewas', "season": 'Lente', "duration": '150 dagen', "growth_days": 150, "water_needs": 'Medium', "expected_yield": '50 ton/ha', "status": 'actief', "icon": '🧅' },
    { "name": 'Wortelen', "type": 'Knolgewas', "season": 'Lente', "duration": '100 dagen', "growth_days": 100, "water_needs": 'Medium', "expected_yield": '45 ton/ha', "status": 'inactief', "icon": '🥕' },
    { "name": 'Spinazie', "type": 'Bladgroente', "season": 'Voorjaar', "duration": '45 dagen', "growth_days": 45, "water_needs": 'Hoog', "expected_yield": '20 ton/ha', "status": 'actief', "icon": '🥬' },
]

def seed_crops(db: Session):
    # Clear existing crops
    print("Deleting all existing crops...")
    db.query(Crop).delete()
    
    # Seed new crops
    print("Seeding fresh crops into the database...")
    for crop_data in initial_crops_data:
        crop = Crop(**crop_data)
        db.add(crop)
    db.commit()
    print("Crops seeded successfully with growth_days.")

async def main():
    print("Starting crop seeder...")
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_crops(db)
    finally:
        db.close()
    print("Crop seeder finished.")

if __name__ == "__main__":
    asyncio.run(main())