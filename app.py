from flask import Flask, send_from_directory
import os

app = Flask(__name__)

# Serve the main page
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')
# Serve static files (CSS, JS)
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)