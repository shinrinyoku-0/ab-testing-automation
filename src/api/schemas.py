from pydantic import BaseModel, EmailStr, Field, field_validator
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
    refresh_token: str
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
    analysis: Any
    processing_error: str | None
    
    class Config:
        from_attributes = True

# Sample Size Calculator Schemas
class SampleSizeRequest(BaseModel):
    baseline_rate: float = Field(
        ..., 
        gt=0, 
        lt=1,
        description="Current conversion rate (0-1, e.g., 0.10 for 10%)"
    )
    mde: float = Field(
        ..., 
        gt=0, 
        lt=1,
        description="Minimum detectable effect (0-1, e.g., 0.05 for 5% relative change)"
    )
    alpha: float = Field(
        default=0.05,
        gt=0,
        lt=1,
        description="Significance level (default: 0.05)"
    )
    power: float = Field(
        default=0.80,
        gt=0,
        lt=1,
        description="Statistical power (default: 0.80)"
    )
    
    @field_validator('alpha')
    @classmethod
    def validate_alpha(cls, v):
        if v > 0.2:
            raise ValueError('Alpha should typically be ≤ 0.2 (20%)')
        return v
    
    @field_validator('power')
    @classmethod
    def validate_power(cls, v):
        if v < 0.5:
            raise ValueError('Power should typically be ≥ 0.5 (50%)')
        return v

class SampleSizeResponse(BaseModel):
    sample_size_per_variant: int
    total_sample_size: int
    parameters: Dict[str, float]
    interpretation: str
