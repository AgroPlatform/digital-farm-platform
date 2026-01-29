from fastapi import APIRouter, HTTPException
import httpx
import os

router = APIRouter()

OPENWEATHER_API_KEY = "ba3e11eb96bca1fce6c6ed12d383101d"

@router.get("/weather")
async def get_weather(city: str):
    url = (
        "https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}&units=metric&lang=nl&appid={OPENWEATHER_API_KEY}"
    )

    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="City not found")

    return response.json()


@router.get("/weather/forecast")
async def get_forecast(city: str):
    url = (
        "https://api.openweathermap.org/data/2.5/forecast"
        f"?q={city}&units=metric&lang=nl&appid={OPENWEATHER_API_KEY}"
    )

    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="City not found")

    return response.json()