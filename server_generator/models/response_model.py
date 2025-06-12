from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel
from typing import List, Tuple, Literal

class BaseResponse(BaseModel):
    status: str
    error: Optional[str] = None
    task_id: Optional[str] = None
    saved_path_url: Optional[str] = None

class CompletedResponse(BaseResponse):
    status: str = "completed"
    saved_path_url: str
    error: Optional[str] = None

class FailedResponse(BaseResponse):
    status: str = "failed"
    error: str 
    
class FeatureExtractionResponse(BaseModel):
    status: Literal["success", "error"]
    features: List[float]
    feature_shape: Tuple[int, ...]
    feature_mean: float
    feature_std: float
    error_message: str | None = None 