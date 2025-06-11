from flask import Blueprint, render_template, request, jsonify
import requests
from dotenv import load_dotenv
import os

load_dotenv()
API_KEY = os.getenv("API_KEY")
HOST = os.getenv("HOST")

bp = Blueprint("routes", __name__)

url = f"https://{HOST}/api/v1/run"

@bp.route("/", methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@bp.route("/run", methods=['POST'])
def run():
    try:
        errors = {}

        data = request.get_json()
        lang = data['lang']
        file = data['file']
        code = data['code']
        input = data['input']

        # Validate the inputs
        if not lang:
            errors['lang'] = 'Language is required.'
        if not file:
            errors['file'] = 'Filename is required.'
        if not code:
            errors['code'] = 'Code is required.'

        if errors:
            return jsonify({'success': False, 'errors': errors}), 400

        payload = {
            "language": lang,
            "stdin": input,
            "files": [
                {
                    "name": file,
                    "content": code
                }
            ]
        }

        headers = {
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": HOST,
            "Content-Type": "application/json"
        }

        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        output = response.json()

        return jsonify(output), 200
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500