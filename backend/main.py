import speech_recognition as sr
import os
import webbrowser
import datetime
import platform
import re
import tempfile
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

# ── TTS (gTTS) ──────────────────────────────────────────────────────────────
tts_available = False
try:
    from gtts import gTTS
    import playsound
    tts_available = True
    print("gTTS initialized successfully")
except ImportError:
    print("Warning: gTTS or playsound not available")
    print("Run: pip install gtts playsound")
except Exception as e:
    print(f"Warning: Could not initialize gTTS: {e}")


def say(text):
    """Speak text using gTTS, fallback to print"""
    print(f"Jarvis: {text}")
    if not tts_available:
        return
    try:
        from gtts import gTTS
        import playsound

        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        temp_filename = temp_file.name
        temp_file.close()

        try:
            tts = gTTS(text=text, lang="en", slow=False)
            tts.save(temp_filename)
            playsound.playsound(temp_filename, block=True)
        finally:
            try:
                if os.path.exists(temp_filename):
                    os.remove(temp_filename)
            except:
                pass
    except Exception as e:
        print(f"TTS error: {e}")


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


def takeCommand():
    """Listen to microphone and return transcribed text"""
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        r.adjust_for_ambient_noise(source, duration=0.5)
        audio = r.listen(source)
        try:
            print("Recognizing...")
            query = r.recognize_google(audio, language="en-in")
            print(f"You said: {query}")
            return query
        except sr.UnknownValueError:
            print("Could not understand audio")
            return "Some Error Occurred. Sorry from Jarvis"
        except sr.RequestError as e:
            print(f"Speech recognition error: {e}")
            return "Some Error Occurred. Sorry from Jarvis"
        except Exception as e:
            print(f"Error: {e}")
            return "Some Error Occurred. Sorry from Jarvis"


# Windows directory paths
user_profile = os.path.expanduser("~")
windows_directories = {
    "documents": os.path.join(user_profile, "Documents"),
    "downloads": os.path.join(user_profile, "Downloads"),
    "desktop": os.path.join(user_profile, "Desktop"),
    "pictures": os.path.join(user_profile, "Pictures"),
    "videos": os.path.join(user_profile, "Videos"),
    "music": os.path.join(user_profile, "Music"),
    "appdata": os.path.join(user_profile, "AppData"),
    "appdata local": os.path.join(user_profile, "AppData", "Local"),
    "appdata roaming": os.path.join(user_profile, "AppData", "Roaming"),
    "onedrive": os.path.join(user_profile, "OneDrive"),
}

# ── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Welcome to Jarvis A.I")
    say("Jarvis A.I ready")

    sites = [
        ["youtube", "https://www.youtube.com"],
        ["wikipedia site", "https://www.wikipedia.com"],
        ["google", "https://www.google.com"],
        ["stake", "https://stake.ac"],
        ["spotify", "https://www.spotify.com"],
    ]

    while True:
        try:
            query = takeCommand()

            if query == "Some Error Occurred. Sorry from Jarvis":
                continue

            query_lower = query.lower().strip()

            # ── Quit ──────────────────────────────────────────────────────────
            if "jarvis quit" in query_lower:
                say("Goodbye! Shutting down Jarvis.")
                break

            # ── Open websites ─────────────────────────────────────────────────
            site_opened = False
            for site in sites:
                if f"open {site[0]}" in query_lower:
                    say(f"Opening {site[0]}...")
                    webbrowser.open(site[1])
                    site_opened = True
                    break
            if site_opened:
                continue

            # ── Open Windows folders ──────────────────────────────────────────
            dir_opened = False
            if "open" in query_lower:
                for dir_name, dir_path in windows_directories.items():
                    if dir_name in query_lower and os.path.exists(dir_path):
                        say(f"Opening {dir_name} folder...")
                        if platform.system() == "Windows":
                            os.startfile(dir_path)
                        elif platform.system() == "Darwin":
                            os.system(f"open '{dir_path}'")
                        else:
                            os.system(f"xdg-open '{dir_path}'")
                        dir_opened = True
                        break
            if dir_opened:
                continue

            # ── Open music ────────────────────────────────────────────────────
            if "open music" in query_lower:
                music_path = os.path.join(windows_directories["downloads"], "downfall-21371.mp3")
                if os.path.exists(music_path):
                    if platform.system() == "Windows":
                        os.startfile(music_path)
                    elif platform.system() == "Darwin":
                        os.system(f"open '{music_path}'")
                    else:
                        os.system(f"xdg-open '{music_path}'")
                    say("Playing music...")
                else:
                    say("Music file not found in Downloads folder.")
                continue

            # ── Time ──────────────────────────────────────────────────────────
            if any(x in query_lower for x in ["the time", "what time", "time now"]):
                now = datetime.datetime.now()
                hour = now.strftime("%H")
                minute = now.strftime("%M")
                say(f"Sir, the time is {hour} hours and {minute} minutes.")
                continue

            # ── Network / FaceTime ────────────────────────────────────────────
            if "open facetime" in query_lower or "open network" in query_lower:
                if platform.system() == "Windows":
                    os.system("start ms-availablenetworks:")
                    say("Opening network settings...")
                else:
                    os.system("open /System/Applications/FaceTime.app")
                    say("Opening FaceTime...")
                continue

            # ── Password manager ──────────────────────────────────────────────
            if "open pass" in query_lower:
                if platform.system() == "Windows":
                    os.system("start passky")
                else:
                    os.system("open /Applications/Passky.app")
                say("Opening password manager...")
                continue

            # ── Create file ───────────────────────────────────────────────────
            if "create file" in query_lower or "make file" in query_lower:
                match = re.search(
                    r"(?:create|make)\s+file\s+(?:called|named)?\s*[\"']?([^\"']+)[\"']?",
                    query_lower,
                )
                if match:
                    filename = match.group(1).strip()
                    try:
                        with open(filename, "w") as f:
                            f.write("")
                        say(f"File {filename} created successfully.")
                    except Exception as e:
                        say(f"Error creating file: {str(e)}")
                else:
                    say("Please specify a filename. For example: create file test dot txt.")
                continue

            # ── Delete file ───────────────────────────────────────────────────
            if "delete file" in query_lower or "remove file" in query_lower:
                match = re.search(
                    r"(?:delete|remove)\s+file\s+(?:called|named)?\s*[\"']?([^\"']+)[\"']?",
                    query_lower,
                )
                if match:
                    filename = match.group(1).strip()
                    try:
                        if os.path.exists(filename):
                            os.remove(filename)
                            say(f"File {filename} deleted successfully.")
                        else:
                            say(f"File {filename} not found.")
                    except Exception as e:
                        say(f"Error deleting file: {str(e)}")
                else:
                    say("Please specify a filename. For example: delete file test dot txt.")
                continue

            # ── Wikipedia ─────────────────────────────────────────────────────
            if "wikipedia" in query_lower:
                if not wikipedia_available:
                    say("Wikipedia support is not installed. Run pip install wikipedia.")
                    continue
                topic = (
                    query_lower.replace("wikipedia", "")
                    .replace("search", "")
                    .replace("about", "")
                    .strip()
                )
                if not topic:
                    say("What should I search on Wikipedia?")
                    continue
                try:
                    summary = wikipedia.summary(topic, sentences=2, auto_suggest=False)
                    say(f"According to Wikipedia, {summary}")
                except wikipedia.DisambiguationError as e:
                    options = ", ".join(e.options[:3])
                    say(f"The topic is ambiguous. Did you mean: {options}?")
                except Exception as e:
                    say(f"Could not fetch Wikipedia information.")
                continue

            # ── Reset chat ────────────────────────────────────────────────────
            if "reset chat" in query_lower:
                say("Chat history has been reset.")
                continue

            # ── AI fallback (Mistral) ─────────────────────────────────────────
            say("Let me think about that...")
            response = get_ai_response(query)
            say(response)

        except KeyboardInterrupt:
            print("\nShutting down Jarvis...")
            say("Goodbye!")
            break
        except Exception as e:
            print(f"Unexpected error: {e}")
            continue