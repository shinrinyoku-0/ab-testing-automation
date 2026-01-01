from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
from . database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    username = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now(UTC))

    uploads = relationship("FileUpload", back_populates="owner")

class FileUpload(Base):
    __tablename__ = "file_uploads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    json_filename = Column(String)
    csv_filenames = Column(String)
    selected_option = Column(String)
    upload_date = Column(DateTime, default=datetime.now(UTC))

    owner = relationship("User", back_populates="uploads")

    