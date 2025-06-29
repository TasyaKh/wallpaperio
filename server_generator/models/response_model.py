from pydantic import BaseModel
from typing import Optional, List, Tuple, Literal, Any

class BaseResponse(BaseModel):
    status: str
    error: Optional[str] = None
    task_id: Optional[str] = None
    url_path_thumb: Optional[str] = None
    url_path_medium: Optional[str] = None
    url_path: Optional[str] = None

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

class ApiSuccessResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
    data: Optional[Any] = None

class ApiErrorResponse(BaseModel):
    success: bool = False
    error: str 