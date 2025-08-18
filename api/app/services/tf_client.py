from typing import List, Dict, Any
import httpx

async def tf_predict(model_name: str, instances: List[Dict[str, Any]]) -> Dict[str, Any]:
    url = f"http://tfserving:8501/v1/models/{model_name}:predict"
    async with httpx.AsyncClient(timeout=5.0) as client:
        r = await client.post(url, json={"instances": instances})
        r.raise_for_status()
        return r.json()
