from typing import Optional
from pydantic import BaseModel


class ImgBBImageVersion(BaseModel):
    filename: str
    name: str
    mime: str
    extension: str
    url: str
    size: Optional[int] = None


class ImgBBData(BaseModel):
    id_encoded: str
    filename: str
    mime: str
    url: str
    display_url: str
    width: int
    height: int
    size: int
    title: str
    url_viewer: str
    delete_url: str
    thumb: ImgBBImageVersion
    medium: Optional[ImgBBImageVersion] = None


class ImgFotoApiResponse(BaseModel):
    status_code: int
    status_txt: str
    success: dict
    image: ImgBBData