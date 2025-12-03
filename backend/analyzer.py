import re
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
# Initialize client safely
try:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except:
    client = None

# ---------------------------------------------
# BASIC STATIC ANALYSIS
# ---------------------------------------------
def basic_static_analysis(code: str):
    print("⚡ Running Static Analysis...")
    issues = []

    # Rule 1: Detect TODOs
    if "TODO" in code:
        issues.append({
            "type": "warning",
            "message": "Found TODO comments — unfinished magic detected!",
            "line": None,
            "source": "static",
            "fix": "Complete the ritual or banish the comment."
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
                "message": "A monstrous function (>20 lines) detected. It is too powerful!",
                "line": start_line + 1,
                "source": "static",
                "fix": "Split this beast into smaller, weaker helper functions."
            })

    # Rule 3: Missing try/except
    if "try:" not in code and "except" not in code:
        issues.append({
            "type": "danger", 
            "message": "No try/except found — uncaught spirits may crash your runtime.",
            "line": None,
            "source": "static",
            "fix": "Cast a protection circle (try/except block) around risky code."
        })

    return issues


# ---------------------------------------------
# AI ANALYSIS (OPENAI GPT MODEL)
# ---------------------------------------------
def ai_analysis(code: str):
    print("🔮 Contacting OpenAI Spirit Realm...")
    
    if not client:
        return {"error": "The Oracle (OpenAI Client) is not initialized. Check API Key."}

    # Enhanced Spooky Persona Prompt
    system_prompt = """
    You are the 'AI Exorcist Debugger', an ancient digital entity.
    Your job is to find bugs in code, which you call 'demons', 'spirits', or 'curses'.
    
    You MUST return ONLY valid JSON.
    Do not include markdown formatting like ```json ... ```.
    
    The output format must be a list of objects:
    [
      {
        "type": "danger" | "warning" | "info",
        "line": number or null,
        "description": "Use spooky metaphors. Example: 'This variable is possessed by a null value.'",
        "fix": "Show the corrected code snippet."
      }
    ]
    """

    user_prompt = f"Analyze this cursed code:\n\n{code}"

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini", 
            messages=[           
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7
        )

        ai_output = response.choices[0].message.content.strip()
        
        # Clean up if the AI adds markdown blocks
        if ai_output.startswith("```"):
            ai_output = ai_output.strip("`").replace("json", "").strip()

        print(f"👻 AI Response received: {ai_output[:50]}...")

        parsed_results = json.loads(ai_output)

        # 🛡️ FORCE TAGGING:
        # We manually inject the source tag here so we don't rely on the AI's memory.
        if isinstance(parsed_results, list):
            for item in parsed_results:
                item["source"] = "ai"

        return parsed_results

    except Exception as e:
        print(f"❌ OpenAI Error: {e}")
        return {"error": str(e)}