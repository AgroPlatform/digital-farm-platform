#!/usr/bin/env python3
"""Create a user in the database for testing.

Run inside the api container so it uses the same DB settings from the environment, for example:
docker exec -it digital-farm-api-dev python /app/app/scripts/create_user.py --email user@example.com --password Passw0rd --full-name "Test User"
"""
import argparse
import sys

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password


def parse_args():
    p = argparse.ArgumentParser(description="Create a test user")
    p.add_argument("--email", required=True, help="Email address")
    p.add_argument("--password", required=True, help="Plaintext password")
    p.add_argument("--full-name", default="", help="Full name")
    return p.parse_args()


def main():
    args = parse_args()
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == args.email).first()
        if existing:
            print(f"User with email {args.email} already exists (id={existing.id}).")
            return 0

        u = User(
            email=args.email,
            hashed_password=hash_password(args.password),
            full_name=args.full_name or None,
            is_active=True,
        )
        db.add(u)
        db.commit()
        print(f"Created user {args.email} (id={u.id})")
        return 0
    except Exception as e:
        print("Error creating user:", e, file=sys.stderr)
        return 2
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
