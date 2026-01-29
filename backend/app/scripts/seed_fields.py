#!/usr/bin/env python3
"""Seed test fields with planting dates for a user.

Run inside the api container, for example:
docker exec -it digital-farm-api-dev python /app/app/scripts/seed_fields.py --user-id 1
"""
import argparse
import sys
from datetime import date, timedelta

from app.db.session import SessionLocal
from app.models.field import Field
from app.models.crop import Crop
from app.models.activity import field_crop_association


def parse_args():
    p = argparse.ArgumentParser(description="Seed test fields with planting dates")
    p.add_argument("--user-id", required=True, type=int, help="User ID to create fields for")
    return p.parse_args()


def main():
    args = parse_args()
    db = SessionLocal()
    try:
        # Sample field data with realistic planting dates
        fields_data = [
            {
                "name": "Noord Veld A",
                "size": 5.5,
                "soil_type": "klei",
                "status": "actief",
                "planting_date": date.today() - timedelta(days=45),  # 45 days ago
                "growth_days": 120,
                "crop_name": "Aardappelen",
                "address": "Boerderij Dekker, Dijk 123, Antwerpen",
                "lat": 51.2194,
                "lng": 4.4024,
            },
            {
                "name": "Zuid Veld B",
                "size": 8.0,
                "soil_type": "zand",
                "status": "actief",
                "planting_date": date.today() - timedelta(days=30),  # 30 days ago
                "growth_days": 90,
                "crop_name": "Maïs",
                "address": "Boerderij Dekker, Dijk 123, Antwerpen",
                "lat": 51.2154,
                "lng": 4.3924,
            },
            {
                "name": "Oost Veld C",
                "size": 3.2,
                "soil_type": "veen",
                "status": "actief",
                "planting_date": date.today() - timedelta(days=20),  # 20 days ago
                "growth_days": 45,
                "crop_name": "Spinazie",
                "address": "Boerderij Dekker, Dijk 123, Antwerpen",
                "lat": 51.2214,
                "lng": 4.4124,
            },
            {
                "name": "West Veld D",
                "size": 6.0,
                "soil_type": "klei",
                "status": "actief",
                "planting_date": date.today() - timedelta(days=5),  # 5 days ago (just planted)
                "growth_days": 150,
                "crop_name": "Uien",
                "address": "Boerderij Dekker, Dijk 123, Antwerpen",
                "lat": 51.2174,
                "lng": 4.3924,
            },
        ]

        print(f"Creating fields for user {args.user_id}...")
        
        for field_data in fields_data:
            crop_name = field_data.pop("crop_name")
            
            # Create field
            field = Field(
                user_id=args.user_id,
                **field_data
            )
            db.add(field)
            db.flush()  # Get the ID
            
            # Set last_crop
            field.last_crop = crop_name
            db.commit()
            
            # Find the crop
            crop = db.query(Crop).filter(Crop.name == crop_name).first()
            if crop:
                # Add crop to field via association table
                stmt = field_crop_association.insert().values(
                    field_id=field.id,
                    crop_id=crop.id,
                    planting_date=field.planting_date,
                    area=field.size  # Use full field size for simplicity
                )
                db.execute(stmt)
            
            db.commit()
            print(f"  Created field: {field.name} (planted {field.planting_date}, {field.growth_days} days)")
        
        print(f"Successfully created {len(fields_data)} test fields with planting dates")
        return 0
    except Exception as e:
        print("Error creating fields:", e, file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 2
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
