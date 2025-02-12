from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import matplotlib.pyplot as plt
import io
import base64

# Use the Agg backend for Matplotlib
import matplotlib
matplotlib.use('Agg')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    iq_data = np.fromfile(file, dtype=np.complex64)  # Assuming complex float32 format

    # Generate spectrogram
    plt.figure()
    plt.specgram(iq_data, Fs=1e6, cmap='viridis')  # Adjust sample rate (Fs) as needed
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    encoded_img = base64.b64encode(buf.getvalue()).decode('utf-8')

    print("Spectrogram generated and encoded")

    return jsonify({'spectrogram': encoded_img})

if __name__ == '__main__':
    app.run(debug=True)