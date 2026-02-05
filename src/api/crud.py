from sqlalchemy.orm import Session
from typing import Any
from . import models, schemas
from .auth import get_password_hash

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db:  Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_file_upload(
        db: Session, user_id: int, exp_name:str,  
        experiment_id: str, json_filename: str, 
        exposures_filename:  str, events_filename: str,
        users_filename: str | None, 
        selected_option: str,
        analysis_results: Any = None,
        processing_error: str | None = None):
    db_upload = models.FileUpload(
        user_id=user_id,
        exp_name=exp_name,
        experiment_id=experiment_id,
        json_filename=json_filename,
        exposures_filename=exposures_filename,
        events_filename=events_filename,
        users_filename=users_filename,
        selected_option=selected_option,
        analysis_results=analysis_results,
        processing_error=processing_error
    )
    db.add(db_upload)
    db.commit()
    db.refresh(db_upload)
    return db_upload
