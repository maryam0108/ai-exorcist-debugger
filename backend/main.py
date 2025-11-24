from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from typing import Any, Dict

# Import your analyzer helpers
from analyzer import basic_static_analysis, ai_analysis

# Load environment variables
load_dotenv()

app = FastAPI()

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "AI Exorcist Debugger Backend Running 👻"}


@app.post("/analyze")
async def analyze_code(
    uploaded_file: UploadFile = File(None),
    pasted_code: str = Form(None)
) -> Dict[str, Any]:
    # -------------------------------
    # 1. Get the input code content
    # -------------------------------
    if uploaded_file:
        try:
            content = (await uploaded_file.read()).decode("utf-8")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not read uploaded file: {e}")
        filename = uploaded_file.filename or "uploaded_file"
    elif pasted_code:
        content = pasted_code
        filename = "pasted_code.txt"
    else:
        raise HTTPException(status_code=400, detail="No code provided. Upload a file or paste code.")

    # -----------------------------------------
    # 2. BASIC STATIC ANALYSIS (local rules)
    # -----------------------------------------
    static_results = basic_static_analysis(content)

    # -----------------------------------------
    # 3. AI ANALYSIS (OpenAI) via analyzer.ai_analysis
    # -----------------------------------------
    ai_results = ai_analysis(content)

    # -----------------------------------------
    # 4. Combine and return results
    # -----------------------------------------
    return {
        "filename": filename,
        "static_analysis": static_results,
        "ai_analysis": ai_results
    }
