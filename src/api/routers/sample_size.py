from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from services.sample_size import calculate_sample_size
from ..schemas import SampleSizeRequest, SampleSizeResponse
from auth import get_current_user
from ..models import User

router = APIRouter()

@router.post("/api/sample-size", response_model=SampleSizeResponse)
async def calculate_sample_size_endpoint(
    request: SampleSizeRequest,
    current_user: User = Depends(get_current_user)):
    """
    Calculate required sample size for A/B test.
    Returns sample size per variant and total sample size needed.
    """
    try:
        n_per_variant = calculate_sample_size(
            baseline_rate=request.baseline_rate,
            mde=request.mde,
            alpha=request.alpha,
            power=request.power
        )
        
        total_sample = n_per_variant * 2
        expected_control_rate = request.baseline_rate
        expected_treatment_rate = request.baseline_rate * (1 + request.mde)
        
        interpretation = (
            f"You need at least {n_per_variant:,} users in each variant "
            f"(control and treatment) to detect a {request.mde*100:.1f}% relative change "
            f"in your conversion rate (from {request.baseline_rate*100:.1f}% to "
            f"{expected_treatment_rate*100:.1f}%) with {request.power*100:.0f}% power "
            f"and {request.alpha*100:.0f}% significance level."
        )
        
        return SampleSizeResponse(
            sample_size_per_variant=n_per_variant,
            total_sample_size=total_sample,
            parameters={
                "baseline_rate": request.baseline_rate,
                "mde": request.mde,
                "alpha": request.alpha,
                "power": request.power,
                "expected_control_rate": expected_control_rate,
                "expected_treatment_rate": expected_treatment_rate
            },
            interpretation=interpretation
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation failed: {str(e)}")

@router.get("/api/sample-size/defaults")
async def get_sample_size_defaults(
    current_user: User = Depends(get_current_user)
):
    """
    Return default/recommended values for sample size calculator.
    """
    return {
        "alpha_options": [
            {"value": 0.01, "label": "1% (Very conservative)"},
            {"value": 0.05, "label": "5% (Standard)", "recommended": True},
            {"value": 0.10, "label": "10% (Exploratory)"}
        ],
        "power_options": [
            {"value": 0.70, "label": "70% (Minimum)"},
            {"value": 0.80, "label": "80% (Standard)", "recommended": True},
            {"value": 0.90, "label": "90% (High confidence)"},
            {"value": 0.95, "label": "95% (Very high confidence)"}
        ],
        "mde_examples": {
            "aggressive": "2-5% (requires large samples)",
            "moderate": "10-20% (recommended for most tests)",
            "conservative": "25%+ (easier to detect)"
        }
    }
