import os
from dotenv import load_dotenv
from mistralai.client import Mistral

# Load environment variables from .env file
load_dotenv()

# ── Mistral client ──────────────────────────────────────────────────────────
mistral_client = None
try:
    api_key = os.environ.get("MISTRAL_API_KEY")
    if api_key:
        mistral_client = Mistral(api_key=api_key)
        print("Mistral AI initialized successfully")
    else:
        print("Warning: MISTRAL_API_KEY not found in .env file")
except Exception as e:
    print(f"Warning: Could not initialize Mistral: {e}")

# ── Wikipedia ───────────────────────────────────────────────────────────────
try:
    import wikipedia
    wikipedia.set_lang("en")
    wikipedia_available = True
except ImportError:
    wikipedia = None
    wikipedia_available = False

def get_ai_response(query):
    """Get AI response using Mistral API"""
    if mistral_client is None:
        return "Mistral AI is not available. Please check your API key in the .env file."

    try:
        response = mistral_client.chat.complete(
            model="mistral-small-latest",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Jarvis, a helpful and concise AI assistant. "
                        "Keep your answers short and clear — ideally 1 to 3 sentences. "
                        "Do not use bullet points or markdown formatting since your "
                        "response will be spoken aloud."
                    ),
                },
                {"role": "user", "content": query},
            ],
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Mistral error: {e}")
        return "Sorry, I couldn't process that right now. Please try again."

if __name__ == "__main__":
    print("This module is now used as a library for server.py. Please run server.py instead.")