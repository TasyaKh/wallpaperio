from typing import Optional
from pydantic import BaseModel


class ImgBBImageVersion(BaseModel):
    filename: str
    name: str
    mime: str
    extension: str
    url: str


class ImgBBData(BaseModel):
    id: str
    title: str
    url_viewer: str
    url: str
    display_url: str
    width: int
    height: int
    size: int
    time: int
    expiration: int
    image: ImgBBImageVersion
    thumb: ImgBBImageVersion
    medium: Optional[ImgBBImageVersion]
    delete_url: str


class ImgFotoApiResponse(BaseModel):
    data: Optional[ImgBBData]
    success: bool
    status: int