from pydantic import BaseModel
from typing import List, Tuple, Literal

class FeatureExtractionResponse(BaseModel):
    status: Literal["success", "error"]
    features: List[float]
    feature_shape: Tuple[int, ...]
    feature_mean: float
    feature_std: float
    error_message: str | None = None 