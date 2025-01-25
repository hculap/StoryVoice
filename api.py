from flask import Flask, request, jsonify, send_file, send_from_directory
import uuid
import os
import requests
from dotenv import load_dotenv
from flask import Response
import uuid
from pathlib import Path
import json
import shutil  

# Initialize Flask app
app = Flask(__name__)

# Load environment variables
load_dotenv()

# Configuration
API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_NAME = "MyClonedVoice"
UPLOAD_FOLDER = 'uploads'
STORIES_DIR = 'stories'
GENERATED_AUDIO_DIR = 'generated_audio'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(STORIES_DIR, exist_ok=True)
os.makedirs(GENERATED_AUDIO_DIR, exist_ok=True)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    # Only serve allowed file types
    allowed_extensions = ['css', 'js', 'html', 'png', 'jpg', 'jpeg', 'gif']
    if '.' in filename and filename.split('.')[-1] in allowed_extensions:
        return send_from_directory('.', filename)
    return "Not Found", 404

@app.route('/api/clone', methods=['POST'])
def clone_voice():
    """Endpoint to clone voice from uploaded audio"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "Empty filename"}), 400

        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        # Save uploaded file
        filename = f"clone_{uuid.uuid4().hex}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # Call ElevenLabs API
        url = "https://api.elevenlabs.io/v1/voices/add"
        headers = {"xi-api-key": API_KEY}
        
        with open(filepath, "rb") as f:
            files = {
                "files": (filename, f, get_mime_type(file.filename)),
                "name": (None, VOICE_NAME),
                "description": (None, "Cloned voice from user upload"),
            }
            response = requests.post(url, headers=headers, files=files)
            
        os.remove(filepath)  # Clean up file

        if response.status_code == 200:
            return jsonify({
                "voice_id": response.json()["voice_id"],
                "name": VOICE_NAME
            }), 200
        else:
            return jsonify({"error": response.json().get("detail", "Cloning failed")}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/voices/<string:voice_id>', methods=['DELETE'])
def delete_voice(voice_id):
    """Delete a cloned voice and associated audio files"""
    try:
        # First delete from ElevenLabs
        headers = {"xi-api-key": API_KEY}
        delete_url = f"https://api.elevenlabs.io/v1/voices/{voice_id}"
        response = requests.delete(delete_url, headers=headers)
        
        # Check if deletion from ElevenLabs was successful
        if response.status_code != 200:
            return jsonify({
                "error": "Failed to delete voice from ElevenLabs",
                "details": response.json().get("detail", "Unknown error")
            }), 500

        # Delete local generated audio files
        voice_dir = os.path.join(GENERATED_AUDIO_DIR, voice_id)
        if os.path.exists(voice_dir):
            # Remove all audio files for this voice
            for filename in os.listdir(voice_dir):
                file_path = os.path.join(voice_dir, filename)
                try:
                    if os.path.isfile(file_path):
                        os.unlink(file_path)
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")
            
            # Remove the directory itself
            os.rmdir(voice_dir)

        return jsonify({
            "status": "success",
            "message": "Voice and associated audio files deleted"
        }), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"API communication failed: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Story Management Endpoints
@app.route('/stories/index.json')
def list_stories():
    """Get list of available stories"""
    try:
        stories = []
        for file in os.listdir(STORIES_DIR):
            if file.endswith('.json') and file != 'index.json':
                with open(os.path.join(STORIES_DIR, file), 'r', encoding='utf-8') as f:
                    story_data = json.load(f)
                    stories.append({
                        'id': story_data.get('id'),
                        'title': story_data.get('title'),
                        'author': story_data.get('author')
                    })
        return jsonify(stories), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/stories/<int:story_id>.json')
def get_story(story_id):
    """Get specific story content"""
    try:
        story_path = os.path.join(STORIES_DIR, f'{story_id}.json')
        return send_from_directory(STORIES_DIR, f'{story_id}.json')
    except Exception as e:
        return jsonify({"error": str(e)}), 404

# Audio Management Endpoints
@app.route('/api/audio/exists/<string:voice_id>/<int:story_id>')
def check_audio_exists(voice_id, story_id):
    """Check if generated audio exists"""
    audio_path = os.path.join(GENERATED_AUDIO_DIR, voice_id, f'{story_id}.mp3')
    return jsonify({"exists": os.path.exists(audio_path)}), 200

@app.route('/api/audio/<string:voice_id>/<int:story_id>.mp3')
def get_audio(voice_id, story_id):
    try:
        audio_dir = os.path.join(GENERATED_AUDIO_DIR, voice_id)
        response = send_from_directory(audio_dir, f'{story_id}.mp3')
        response.headers.add('Cache-Control', 'no-store, max-age=0')
        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@app.route('/api/synthesize', methods=['POST'])
def synthesize_speech():
    """Generate and store speech from text"""
    try:
        data = request.json
        voice_id = data.get('voice_id')
        story_id = data.get('story_id')
        text = data.get('text')

        if not voice_id or not text or not story_id:
            return jsonify({"error": "Missing required parameters"}), 400

        # Create voice directory if not exists
        voice_dir = os.path.join(GENERATED_AUDIO_DIR, voice_id)
        os.makedirs(voice_dir, exist_ok=True)
        
        # Generate speech
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream"
        headers = {
            "xi-api-key": API_KEY,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
        }
        
        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                # "stability": 0.3,
                # "similarity_boost": 0.9,
                # "style": 0.2,
                # "use_speaker_boost": True,
                # "speed": 1.2
                "stability": 0.45,        # Increased for smoother delivery (0.35-0.5)
                "similarity_boost": 0.85, # Slightly reduced for natural variation
                "style": 0.35,            # Increased for better expressiveness
                "use_speaker_boost": True,# Keep enabled for clarity
                "speed": 1.2           # Slightly slower for natural pacing
            }
        }

        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()

        # Save generated audio
        output_path = os.path.join(voice_dir, f'{story_id}.mp3')
        with open(output_path, 'wb') as f:
            f.write(response.content)

        return jsonify({"status": "success", "path": output_path}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'wav', 'mp3'}

def get_mime_type(filename):
    extension = filename.rsplit('.', 1)[1].lower()
    return 'audio/wav' if extension == 'wav' else 'audio/mpeg'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)