from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from data.arancel_data import PRODUCTS_DB, COUNTRIES_DB, AGREEMENTS_DB, BCB_RATE

app = FastAPI(
    title="Calculadora de Impuestos Aduaneros - Bolivia",
    description="API para calcular impuestos de importación según el Arancel Aduanero Boliviano (NANDINA)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class CalculationRequest(BaseModel):
    product_id: str
    origin_country_code: str
    cif_value: float
    cif_currency: str = "USD"  # "USD" or "BOB"
    cif_location: str = "LA_PAZ"  # "LA_PAZ" or "ARICA"
    flete_arica_lapaz: Optional[float] = None  # freight Arica→La Paz in USD, if cif_location=ARICA


def _calculate_taxes(product: dict, country: dict, cif_usd: float) -> dict:
    ga_rate = product["ga_rate"]
    ice_rate = product.get("ice_rate", 0)
    iva_rate = 13.0

    # Check trade agreements for GA exemption/reduction
    agreement_applied = None
    effective_ga_rate = ga_rate
    for ag_code in country.get("agreements", []):
        ag = AGREEMENTS_DB.get(ag_code)
        if ag and product["partida"] not in ag.get("excluded_partidas", []):
            if ag.get("ga_reduction") == "full":
                effective_ga_rate = 0
                agreement_applied = ag_code
                break
            elif isinstance(ag.get("ga_reduction"), (int, float)):
                reduction = ag["ga_reduction"]
                effective_ga_rate = max(0, ga_rate - reduction)
                agreement_applied = ag_code
                break

    # Tax computation (base = CIF La Paz in USD)
    ga_amount = cif_usd * (effective_ga_rate / 100)
    ice_amount = (cif_usd + ga_amount) * (ice_rate / 100)
    iva_base = cif_usd + ga_amount + ice_amount
    iva_amount = iva_base * (iva_rate / 100)
    total_taxes_usd = ga_amount + ice_amount + iva_amount
    total_to_pay_usd = cif_usd + total_taxes_usd

    rate = BCB_RATE
    return {
        "cif_usd": round(cif_usd, 2),
        "cif_bob": round(cif_usd * rate, 2),
        "ga_rate": effective_ga_rate,
        "ga_original_rate": ga_rate,
        "ga_amount_usd": round(ga_amount, 2),
        "ga_amount_bob": round(ga_amount * rate, 2),
        "ice_rate": ice_rate,
        "ice_amount_usd": round(ice_amount, 2),
        "ice_amount_bob": round(ice_amount * rate, 2),
        "iva_rate": iva_rate,
        "iva_amount_usd": round(iva_amount, 2),
        "iva_amount_bob": round(iva_amount * rate, 2),
        "total_taxes_usd": round(total_taxes_usd, 2),
        "total_taxes_bob": round(total_taxes_usd * rate, 2),
        "total_to_pay_usd": round(total_to_pay_usd, 2),
        "total_to_pay_bob": round(total_to_pay_usd * rate, 2),
        "exchange_rate_bob_per_usd": rate,
        "agreement_applied": agreement_applied,
        "tax_exempt": total_taxes_usd == 0,
        "effective_tax_pct": round((total_taxes_usd / cif_usd * 100) if cif_usd > 0 else 0, 2),
    }


@app.post("/calculate")
def calculate_taxes(req: CalculationRequest):
    product = PRODUCTS_DB.get(req.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    country = COUNTRIES_DB.get(req.origin_country_code)
    if not country:
        raise HTTPException(status_code=404, detail="País de origen no encontrado")

    # Normalize CIF to USD at La Paz
    rate = BCB_RATE
    if req.cif_currency == "BOB":
        cif_usd = req.cif_value / rate
    else:
        cif_usd = req.cif_value

    if req.cif_location == "ARICA":
        flete = req.flete_arica_lapaz or 0
        cif_usd += flete  # add freight Arica → La Paz

    taxes = _calculate_taxes(product, country, cif_usd)

    return {
        "product": product,
        "country": country,
        "taxes": taxes,
        "regulations": {
            "last_updated": "2024-12-01",
            "source": "Aduana Nacional de Bolivia - Arancel NANDINA",
            "normativa": product.get("normativa", []),
        },
    }


@app.get("/products/search")
def search_products(q: str = Query(..., min_length=2)):
    q_lower = q.lower()
    results = [
        p for p in PRODUCTS_DB.values()
        if q_lower in p["name"].lower() or q_lower in p.get("description", "").lower()
        or q_lower in p["partida"].replace(".", "")
    ]
    return {"results": results[:20]}


@app.get("/products/{product_id}")
def get_product(product_id: str):
    product = PRODUCTS_DB.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product


@app.get("/countries")
def list_countries():
    return {"countries": list(COUNTRIES_DB.values())}


@app.get("/agreements")
def list_agreements():
    return {"agreements": list(AGREEMENTS_DB.values())}


@app.get("/exchange-rate")
def get_exchange_rate():
    return {"usd_to_bob": BCB_RATE, "source": "Banco Central de Bolivia (BCB)"}
