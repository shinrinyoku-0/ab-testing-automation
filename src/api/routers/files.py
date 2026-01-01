from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import shutil
from pathlib import Path
import json
from ..database import get_db
from ..auth import get_current_user
from ..models import User
from ..crud import create_file_upload
from ..schemas import FileUploadResponse
from main_pipeline_v1 import load_files, validate_csv_structure, run_experiment_analysis

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def save_uploaded_file(file: UploadFile, directory: Path) -> Path:
    """
    Helper function: Save an uploaded file and return its path
    """
    file_path = directory / str(file.filename)
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return file_path
    
@router.post("/upload", response_model=FileUploadResponse)
async def upload_files(
    exp_name: str = Form(...),
    experiment_id: str = Form(...),
    json_file: UploadFile = File(...),
    exposures_file: UploadFile = File(...),
    events_file: UploadFile = File(...),
    users_file: UploadFile = File(None),
    selected_option: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    # Validate file extensions

    if not json_file.filename or not json_file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="Metrics config must be JSON")
    if not exposures_file.filename or not exposures_file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Exposures file must be CSV")
    if not events_file.filename or not events_file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Events file must be CSV")
    if users_file is None and hasattr(users_file, 'filename') and not users_file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Users file must be CSV")

    # Create user-specific directory
    user_dir = UPLOAD_DIR / str(current_user.id)
    user_dir.mkdir(exist_ok=True)
    
    # Save all files
    try:
        json_path = save_uploaded_file(json_file, user_dir)
        exposures_path = save_uploaded_file(exposures_file, user_dir)
        events_path = save_uploaded_file(events_file, user_dir)
        
        users_filename = None
        users_path = None
        if users_file and users_file.filename:
            users_path = save_uploaded_file(users_file, user_dir)
            users_filename = users_file.filename
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save files: {str(e)}")
    
    try:
        metrics_config, exposures_df, events_df, users_df = load_files(json_path, exposures_path, events_path, users_path)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file format")
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=f"File not found: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error loading files: {str(e)}")
    
    exposures_missing_cols = validate_csv_structure(
        exposures_df,
        ['user_id', 'experiment_id', 'variant', 'exposure_time'],
    )
    if exposures_missing_cols:
        raise HTTPException(status_code=400, detail=f"Exposures file missing required columns: {', '.join(exposures_missing_cols)}")
    
    events_missing_cols = validate_csv_structure(
        events_df,
        ['user_id', 'event_name', 'event_time'],
    )
    if events_missing_cols:
        raise HTTPException(status_code=400, detail=f"Events file missing required columns: {', '.join(events_missing_cols)}")

    # future: validate users info df

    # validate event_value if using 'sum' aggregation:
    has_sum_metric = any(
        m.get('aggregation') == 'sum'
        for m in metrics_config.values()
    )

    if has_sum_metric and 'event_value' not in events_df.columns:
        raise HTTPException(
            status_code=400,
            detail="Events file must have 'event_value' column for revenue metrics"
        )
    
    if experiment_id not in exposures_df['experiment_id'].astype(str).values:
        raise HTTPException(
            status_code=400,
            detail=f"Experiment ID '{experiment_id}' not found in exposures data. Available IDs: {exposures_df['experiment_id'].unique().tolist()}"
        )

    # Store in database
    db_upload = create_file_upload(
        db=db,
        exp_name=exp_name,
        user_id=current_user.id,
        experiment_id=experiment_id,
        json_filename=json_file.filename,
        exposures_filename=exposures_file.filename,
        events_filename=events_file.filename,
        users_filename=users_filename,
        selected_option=selected_option
    )

    try:
        analysis_results = run_experiment_analysis(
            experiment_id=experiment_id,
            exposures_df=exposures_df,
            events_df=events_df,
            metrics_config=metrics_config
        )

        return FileUploadResponse(
            **db_upload.__dict__,
            analysis=analysis_results,
            processing_error=None
        )
    except ValueError as e:
        return FileUploadResponse(
            **db_upload.__dict__,
            analysis=None,
            processing_error=f"Analysis failed: {str(e)}"
        ) 

    except Exception as e:
        return FileUploadResponse(
            **db_upload.__dict__,
            analysis=None,
            processing_error=f"Unexpected error during analysis: {str(e)}"
        )

@router.get("/options")
async def get_upload_options():
    """Return dropdown options for file upload"""
    return {
        "options": [
            {"value": "event_based", "label": "Event-based tracking"},
            {"value": "clinical", "label": "Clinical trial data"},
            {"value": "marketing", "label": "Marketing campaign data"},
            {"value": "custom", "label": "Custom format"}
        ]
    }
