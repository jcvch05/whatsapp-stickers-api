
from fastapi import FastAPI
from typing import List, Dict

app = FastAPI()

# Datos de prueba: stickers
stickers = [
    {"id": 1, "name": "Sticker divertido", "popularity": 5, "file_url": "https://example.com/sticker1.webp"},
    {"id": 2, "name": "Sticker cool", "popularity": 8, "file_url": "https://example.com/sticker2.webp"},
    {"id": 3, "name": "Sticker raro", "popularity": 3, "file_url": "https://example.com/sticker3.webp"}
]

@app.get("/stickers")
def get_stickers(sort: str = "popularity", page_size: int = 10):
    sorted_stickers = sorted(stickers, key=lambda x: x.get(sort, 0), reverse=True)
    return {"items": sorted_stickers[:page_size]}
