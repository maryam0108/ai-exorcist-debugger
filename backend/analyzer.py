import re
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ---------------------------------------------
# BASIC STATIC ANALYSIS
# ---------------------------------------------
def basic_static_analysis(code: str):
    issues = []

    # Rule 1: Detect TODOs
    if "TODO" in code:
        issues.append({
            "type": "warning",
            "message": "Found TODO comments — unfinished magic detected!",
            "line": None
        })

    # Rule 2: Detect large functions (> 20 lines)
    function_defs = re.finditer(r"def\s+\w+\(.*?\):", code)
    lines = code.split("\n")

    for func in function_defs:
        start_line = code[:func.start()].count("\n")
        body_lines = 0

        # Count lines until next non-indented
        for l in lines[start_line+1:]:
            if l.startswith("    ") or l.strip() == "":
                body_lines += 1
            else:
                break

        if body_lines > 20:
            issues.append({
                "type": "warning",
                "message": "A monstrous function (>20 lines) detected. Consider splitting it.",
                "line": start_line + 1
            })

    # Rule 3: Missing try/except
    if "try:" not in code and "except" not in code:
        issues.append({
            "type": "info",
            "message": "No try/except found — errors may haunt your runtime.",
            "line": None
        })

    return issues


# ---------------------------------------------
# AI ANALYSIS (OPENAI GPT MODEL)
# ---------------------------------------------
def ai_analysis(code: str):
    system_prompt = """
    You are the AI Exorcist Debugger.
    You MUST return ONLY valid JSON.
    
    The output format must be:
    [
      {
        "type": "danger" | "warning" | "info",
        "line": number or null,
        "description": "spooky explanation of the problem",
        "fix": "suggested fix"
      }
    ]
    """

    user_prompt = f"Analyze this code:\n\n{code}"

    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )

        ai_output = response.output_text.strip()

        # Validate that the AI returned valid JSON
        try:
            return json.loads(ai_output)
        except json.JSONDecodeError:
            return {
                "error": "AI returned invalid JSON",
                "raw": ai_output
            }

    except Exception as e:
        return {"error": str(e)}
