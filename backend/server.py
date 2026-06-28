from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime

# Import AI functions
from main import get_ai_response, wikipedia_available, wikipedia

app = Flask(__name__)
# Allow CORS for the Vite dev server and Vercel frontend
CORS(app, origins=["http://localhost:5173", "https://jarvis-frontend.vercel.app", "*"])

def process_command(query, query_lower):
    # Time query
    if "the time" in query_lower or "what time" in query_lower:
        now = datetime.datetime.now()
        return f"The time is {now.strftime('%H:%M')}"

    # Wikipedia query
    if "wikipedia" in query_lower:
        if not wikipedia_available:
            return "Wikipedia support is not installed on the server."
        try:
            topic = query_lower.replace("wikipedia", "").replace("search", "").replace("about", "").strip()
            if not topic:
                return "What should I search on Wikipedia?"
            summary = wikipedia.summary(topic, sentences=2, auto_suggest=False)
            return f"According to Wikipedia, {summary}"
        except Exception as e:
            return "I couldn't fetch that information from Wikipedia right now."
    #Who's your creator query
    if any(x in query_lower for x in [
        "creator",
        "who created you",
        "who made you",
        "who built you",
        "who is your creator"
    ]):
        return "My creator is Rupak, the greatest gambler of the 21st century."
    

    # Fallback to AI
    return get_ai_response(query)

@app.route('/api/query', methods=['POST'])
def handle_query():
    data = request.json
   
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    query = data.get('query', '')
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    query_lower = query.lower().strip()
    response = process_command(query, query_lower)
    return jsonify({'response': response})

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'Jarvis Backend is running!'})

if __name__ == '__main__':
    # In production (Render/Railway), the host should be 0.0.0.0
    app.run(host='0.0.0.0', port=5000, debug=True)