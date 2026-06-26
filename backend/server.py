# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import threading
import speech_recognition as sr
import os, webbrowser, datetime, platform, re, tempfile

# Import your existing functions
from main import say, get_ai_response, takeCommand, windows_directories

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])  # Vite dev server
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173")

is_listening = False
listener_thread = None

def listen_loop():
    global is_listening
    while is_listening:
        socketio.emit('status', {'message': 'Listening...'})
        query = takeCommand()

        if query == "Some Error Occurred. Sorry from Jarvis":
            socketio.emit('error', {'message': 'Could not recognize speech'})
            continue

        socketio.emit('user_query', {'text': query})
        query_lower = query.lower().strip()

        if "jarvis quit" in query_lower:
            is_listening = False
            socketio.emit('status', {'message': 'Jarvis stopped'})
            break

        response = process_command(query, query_lower)
        socketio.emit('jarvis_response', {'text': response})
        say(response)

def process_command(query, query_lower):
    sites = [
        ["youtube", "https://www.youtube.com"],
        ["wikipedia site", "https://www.wikipedia.com"],
        ["google", "https://www.google.com"],
        ["spotify", "https://www.spotify.com"]
    ]
    for site in sites:
        if f"open {site[0]}" in query_lower:
            webbrowser.open(site[1])
            return f"Opening {site[0]}..."

    if "the time" in query_lower or "what time" in query_lower:
        now = datetime.datetime.now()
        return f"The time is {now.strftime('%H:%M')}"

    if "wikipedia" in query_lower:
        try:
            import wikipedia
            topic = query_lower.replace("wikipedia", "").replace("search", "").replace("about", "").strip()
            summary = wikipedia.summary(topic, sentences=2)
            return f"According to Wikipedia, {summary}"
        except Exception as e:
            return f"Wikipedia error: {e}"

    # Fallback to AI
    socketio.emit('status', {'message': 'Thinking...'})
    return get_ai_response(query)

# REST endpoints (for manual text input from UI)
@app.route('/api/query', methods=['POST'])
def handle_query():
    data = request.json
    query = data.get('query', '')
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    query_lower = query.lower().strip()
    response = process_command(query, query_lower)
    return jsonify({'response': response})

@app.route('/api/query-audio', methods=['POST'])
def handle_query_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
        
    audio_file = request.files['audio']
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        audio_file.save(tmp.name)
        tmp_path = tmp.name

    r = sr.Recognizer()
    query = ""
    try:
        with sr.AudioFile(tmp_path) as source:
            audio_data = r.record(source)
            query = r.recognize_google(audio_data, language="en-in")
            print(f"Recognized: {query}")
    except Exception as e:
        print(f"Error recognizing audio: {e}")
    finally:
        try:
            os.remove(tmp_path)
        except:
            pass

    if not query:
        return jsonify({'error': 'Could not understand audio'})

    query_lower = query.lower().strip()
    response = process_command(query, query_lower)
    return jsonify({'response': response, 'transcription': query})

@app.route('/api/start', methods=['POST'])
def start_listening():
    global is_listening, listener_thread
    if not is_listening:
        is_listening = True
        listener_thread = threading.Thread(target=listen_loop, daemon=True)
        listener_thread.start()
    return jsonify({'status': 'listening'})

@app.route('/api/stop', methods=['POST'])
def stop_listening():
    global is_listening
    is_listening = False
    return jsonify({'status': 'stopped'})

if __name__ == '__main__':
    socketio.run(app, port=5000, debug=True)