from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Dict, Any

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None

class FileUploadResponse(BaseModel):
    id: int
    user_id: int
    exp_name: str
    experiment_id: str
    json_filename: str
    exposures_filename: str
    events_filename: str
    users_filename: str | None
    selected_option: str
    upload_date: datetime
    analysis: Dict[str, Any] | None
    processing_error: str | None
    
    class Config:
        from_attributes = True
