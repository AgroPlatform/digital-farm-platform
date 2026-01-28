import os
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.automap import automap_base
from jose import jwt
from sqlalchemy import text


DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/digital_farm")
SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-in-production")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = automap_base()
# reflect existing database tables (users, revoked_tokens)
Base.prepare(engine, reflect=True)

# Map classes
Users = getattr(Base.classes, "users")
try:
    RevokedTokens = getattr(Base.classes, "revoked_tokens")
except AttributeError:
    # If the revoked_tokens table doesn't exist yet, create it and re-reflect.
    with engine.begin() as conn:
        conn.execute(text(
            """
            CREATE TABLE IF NOT EXISTS revoked_tokens (
                id SERIAL PRIMARY KEY,
                jti VARCHAR(255) UNIQUE NOT NULL,
                revoked_at TIMESTAMP NOT NULL
            )
            """
        ))
    # Re-reflect to pick up the new table mapping
    Base.prepare(engine, reflect=True)
    RevokedTokens = getattr(Base.classes, "revoked_tokens")


class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None

    # pydantic v2 style config: allow model to be created from ORM objects
    model_config = {"from_attributes": True}


app = FastAPI(title="Admin Panel (Separate)")

app.add_middleware(
    CORSMiddleware,
    # Limit to known dev origins instead of wildcard when credentials are used
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/users", response_model=List[UserOut])
def list_users(db=Depends(get_db)):
    return db.query(Users).all()


@app.get("/api/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db=Depends(get_db)):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user


class UserUpdate(BaseModel):
    full_name: Optional[str]
    phone: Optional[str]
    job_title: Optional[str]
    is_active: Optional[bool]


@app.put("/api/users/{user_id}")
def update_user(user_id: int, payload: UserUpdate, db=Depends(get_db)):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(user, k, v)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"ok": True, "user": UserOut.from_orm(user)}


@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, db=Depends(get_db)):
    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    db.delete(user)
    db.commit()
    return {"ok": True}


class RevokeRequest(BaseModel):
    token: Optional[str] = None
    jti: Optional[str] = None


@app.post("/api/revoke")
def revoke_token(payload: RevokeRequest, db=Depends(get_db)):
    jti = payload.jti
    if not jti and payload.token:
        try:
            decoded = jwt.decode(payload.token, SECRET_KEY, algorithms=["HS256"])
            jti = decoded.get("jti")
        except Exception as e:
            raise HTTPException(400, f"Invalid token: {e}")
    if not jti:
        raise HTTPException(400, "Provide either a token or a jti to revoke")

    # Insert into revoked_tokens table if not exists
    existing = db.query(RevokedTokens).filter(RevokedTokens.jti == jti).first()
    if existing:
        return {"ok": True, "revoked": False, "reason": "already_revoked"}

    revoked = RevokedTokens(jti=jti, revoked_at=datetime.utcnow())
    db.add(revoked)
    db.commit()
    return {"ok": True, "revoked": True}


# Serve a minimal admin UI at the root path ('/') so the SPA is available at '/'
# `html=True` makes StaticFiles return index.html for '/'
app.mount("/", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "../frontend"), html=True), name="static")
