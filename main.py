
from fastapi import FastAPI
from typing import List, Dict

app = FastAPI(
    title="WhatsApp Stickers API",
    description="API para gestionar y obtener stickers de WhatsApp",
    version="1.0.0"
)

# Datos de prueba: stickers
stickers = [
    {"id": 1, "name": "Sticker divertido", "popularity": 5, "file_url": "https://example.com/sticker1.webp"},
    {"id": 2, "name": "Sticker cool", "popularity": 8, "file_url": "https://example.com/sticker2.webp"},
    {"id": 3, "name": "Sticker raro", "popularity": 3, "file_url": "https://example.com/sticker3.webp"}
]

@app.get("/")
def root():
    """
    Endpoint raíz que responde '¿Qué puedes hacer por mí?'
    Proporciona información sobre las capacidades de la API.
    """
    return {
        "mensaje": "¡Bienvenido a la API de Stickers de WhatsApp!",
        "que_puedo_hacer": [
            "Obtener una lista de stickers disponibles",
            "Ordenar stickers por popularidad o nombre",
            "Paginar resultados para mejor rendimiento"
        ],
        "endpoints": {
            "/stickers": {
                "método": "GET",
                "descripción": "Obtiene la lista de stickers",
                "parámetros": {
                    "sort": {
                        "tipo": "string",
                        "valores": ["popularity", "name", "id"],
                        "por_defecto": "popularity",
                        "descripción": "Campo por el cual ordenar los stickers"
                    },
                    "page_size": {
                        "tipo": "integer",
                        "por_defecto": 10,
                        "descripción": "Número de stickers a retornar"
                    }
                },
                "ejemplo": "/stickers?sort=name&page_size=5"
            },
            "/docs": {
                "método": "GET",
                "descripción": "Documentación interactiva de la API (Swagger UI)"
            },
            "/redoc": {
                "método": "GET",
                "descripción": "Documentación alternativa de la API (ReDoc)"
            }
        },
        "versión": "1.0.0"
    }

@app.get("/stickers")
def get_stickers(sort: str = "popularity", page_size: int = 10):
    """
    Obtiene la lista de stickers ordenados.
    
    - **sort**: Campo por el cual ordenar (popularity, name, id)
    - **page_size**: Número de stickers a retornar
    """
    sorted_stickers = sorted(stickers, key=lambda x: x.get(sort, 0), reverse=True)
    return {"items": sorted_stickers[:page_size]}
