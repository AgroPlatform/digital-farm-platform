from sqlalchemy import Column, Integer, String, Float
from app.db.session import Base


class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    size = Column(Float, nullable=False)
    crop = Column(String, nullable=False)