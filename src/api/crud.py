from sqlalchemy.orm import Session
from .  import models, schemas
from . auth import get_password_hash

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

def create_file_upload(db: Session, user_id: int, json_filename: str, csv_filenames:  str, selected_option: str):
    db_upload = models.FileUpload(
        user_id=user_id,
        json_filename=json_filename,
        csv_filenames=csv_filenames,
        selected_option=selected_option
    )
    db.add(db_upload)
    db.commit()
    db.refresh(db_upload)
    return db_upload
