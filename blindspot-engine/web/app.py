"""FastAPI web application for the Blind Spot Engine."""

import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Optional

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn

from src.engine import BlindSpotEngine, OllamaClient, TavilyClient

app = FastAPI(title="Blind Spot Engine")

# Templates
templates = Jinja2Templates(directory=str(Path(__file__).parent / "templates"))

# Static files
static_dir = Path(__file__).parent / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Engine instance
engine = None

def get_engine():
    global engine
    if engine is None:
        llm = OllamaClient()
        search = TavilyClient()
        engine = BlindSpotEngine(llm_client=llm, search_client=search)
    return engine

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/analyze", response_class=HTMLResponse)
async def analyze_page(request: Request):
    return templates.TemplateResponse("analyze.html", {"request": request})

@app.post("/api/analyze")
async def api_analyze(request: Request):
    """Run full blind spot analysis."""
    data = await request.json()
    domain = data.get("domain", "")
    
    if not domain or len(domain) < 10:
        raise HTTPException(status_code=400, detail="Domain description must be at least 10 characters")
    
    eng = get_engine()
    report = await eng.analyze(domain)
    
    return JSONResponse(report.to_dict())

@app.get("/api/health")
async def health():
    return {"status": "ok", "engine": "Blind Spot Engine v1.0"}

@app.post("/api/quick")
async def api_quick(request: Request):
    """Quick analysis - just the top insights."""
    content_type = request.headers.get("content-type", "")
    
    if "application/json" in content_type:
        data = await request.json()
        domain = data.get("domain", "")
    else:
        form = await request.form()
        domain = form.get("domain", "")
    
    if not domain:
        raise HTTPException(status_code=400, detail="Domain description required")
    
    eng = get_engine()
    report = await eng.analyze(domain)
    
    return JSONResponse({
        "domain": report.domain,
        "top_insights": report.top_insights,
        "summary": report.summary,
        "n_queries": len(report.anti_queries),
        "n_assumptions": len(report.assumptions),
        "n_patterns": len(report.cross_domain_matches)
    })

def start():
    """Start the server."""
    uvicorn.run(app, host="0.0.0.0", port=8766)

if __name__ == "__main__":
    start()
