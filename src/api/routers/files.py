from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from pathlib import Path

from ..database import get_db
from ..auth import get_current_user
from ..models import User
from ..crud import create_file_upload
from ..schemas import FileUploadResponse

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/upload", response_model=FileUploadResponse)
async def upload_files(
    json_file: UploadFile = File(...),
    csv_files: List[UploadFile] = File(...),
    selected_option: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file count (1 JSON + max 3 CSV = 4 total)
    if len(csv_files) > 3:
        raise HTTPException(status_code=400, detail="Maximum 3 CSV files allowed")
    
    # Validate JSON file

    if not json_file.filename or not json_file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="First file must be JSON")


    # Validate CSV files
    for csv_file in csv_files: 
        if not csv_file.filename or not csv_file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="All additional files must be CSV")
    
    # Create user-specific directory
    user_dir = UPLOAD_DIR / str(current_user.id)
    user_dir.mkdir(exist_ok=True)
    
    # Save JSON file
    json_path = user_dir / json_file.filename
    with json_path.open("wb") as buffer:
        shutil.copyfileobj(json_file.file, buffer)
    
    # Save CSV files
    csv_filenames = []
    for csv_file in csv_files:
        if csv_file.filename is None:
            raise HTTPException(status_code=400, detail="CSV filename is required")
        csv_path = user_dir / csv_file.filename
        with csv_path.open("wb") as buffer:
            shutil.copyfileobj(csv_file.file, buffer)
        csv_filenames.append(csv_file.filename)
    
    # Store in database
    db_upload = create_file_upload(
        db=db,
        user_id=current_user.id,
        json_filename=json_file.filename,
        csv_filenames=",".join(csv_filenames),
        selected_option=selected_option
    )
    
    return db_upload

@router.get("/options")
async def get_upload_options():
    """Return dropdown options for file upload"""
    return {
        "options": [
            {"value": "option1", "label": "Data Processing Type A"},
            {"value": "option2", "label": "Data Processing Type B"},
            {"value":  "option3", "label": "Data Processing Type C"},
            {"value": "option4", "label": "Custom Analysis"}
        ]
    }
