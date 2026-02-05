from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import json
import pandas as pd
import numpy as np
from ..database import get_db
from ..auth import get_current_user
from ..models import User
from ..crud import create_file_upload
from ..schemas import FileUploadResponse
from services.analysis import run_experiment_analysis
from services.load import load_files
from services.validate import validate_csv_structure

router = APIRouter()

def make_json_serializable(obj):
    """Convert pandas/numpy objects to JSON-serializable types"""
    if isinstance(obj, dict):
        return {key: make_json_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [make_json_serializable(item) for item in obj]
    elif isinstance(obj, (pd.Timestamp, pd.Timedelta)):
        return obj.isoformat()
    elif isinstance(obj, (np.integer, np.floating)):
        return obj.item()
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif pd.isna(obj):
        return None
    return obj
    
@router.post("/upload", response_model=FileUploadResponse)
async def upload_files(
    exp_name: str = Form(...),
    experiment_id: str = Form(...),
    json_file: UploadFile = File(...),
    exposures_file: UploadFile = File(...),
    events_file: UploadFile = File(...),
    users_file: UploadFile = File(None),
    selected_option: str = Form(...),
    apply_correction: bool = Form(True),
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
    if users_file and users_file.filename and not users_file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Users file must be CSV")
    
    try:
        users_filename = users_file.filename if users_file and users_file.filename else None
        users_file_obj = users_file.file if users_file and users_file.filename else None
        
        metrics_config, exposures_df, events_df, users_df = load_files(
            json_file.file, 
            exposures_file.file, 
            events_file.file, 
            users_file_obj
        )
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

    # Run analysis and store results in database
    analysis_results = None
    processing_error = None
    
    try:
        analysis_results = run_experiment_analysis(
            experiment_id=experiment_id,
            exposures_df=exposures_df,
            events_df=events_df,
            metrics_config=metrics_config,
            apply_correction=apply_correction
        )
        # Convert to JSON-serializable format
        if analysis_results:
            analysis_results = make_json_serializable(analysis_results)
    except ValueError as e:
        processing_error = f"Analysis failed: {str(e)}"
    except Exception as e:
        processing_error = f"Unexpected error during analysis: {str(e)}"
    
    # Store metadata and analysis results in database
    db_upload = create_file_upload(
        db=db,
        exp_name=exp_name,
        user_id=current_user.id,
        experiment_id=experiment_id,
        json_filename=json_file.filename,
        exposures_filename=exposures_file.filename,
        events_filename=events_file.filename,
        users_filename=users_filename,
        selected_option=selected_option,
        analysis_results=analysis_results,
        processing_error=processing_error
    )

    return FileUploadResponse(
        id=db_upload.id,
        user_id=db_upload.user_id,
        exp_name=db_upload.exp_name,
        experiment_id=db_upload.experiment_id,
        json_filename=db_upload.json_filename,
        exposures_filename=db_upload.exposures_filename,
        events_filename=db_upload.events_filename,
        users_filename=db_upload.users_filename,
        selected_option=db_upload.selected_option,
        upload_date=db_upload.upload_date,
        analysis=analysis_results,
        processing_error=processing_error
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
