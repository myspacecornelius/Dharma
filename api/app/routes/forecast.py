from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.tf_client import tf_predict

router = APIRouter()

class FeaturePayload(BaseModel):
    features: List[Dict[str, Any]]

@router.post("/forecast/price")
async def forecast_price(payload: FeaturePayload):
    try:
        resp = await tf_predict("price_forecaster", payload.features)
        preds = resp.get("predictions") or resp.get("outputs") or resp
        return {"predictions": preds}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
