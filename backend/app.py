from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import matplotlib.pyplot as plt
import io
import base64
from pymongo import MongoClient
from bson.objectid import ObjectId
from gridfs import GridFS
import matplotlib

# Use the Agg backend for Matplotlib
matplotlib.use('Agg')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB setup using GridFS
client = MongoClient("mongodb://localhost:27017")
db = client['files_db']
fs = GridFS(db)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    # Reset file pointer and read data as a numpy array (assuming complex64 format)
    file.seek(0)
    iq_data = np.frombuffer(file.read(), dtype=np.complex64)

    # Generate spectrogram
    plt.figure()
    plt.specgram(iq_data, Fs=1e6, cmap='viridis')
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    encoded_img = base64.b64encode(buf.getvalue()).decode('utf-8')

    print("Spectrogram generated and encoded")
    return jsonify({'spectrogram': encoded_img})

@app.route('/save', methods=['POST'])
def save_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    file_content = file.read()  # Read the binary content

    try:
        # Use GridFS to store the file (GridFS splits the file into chunks)
        file_id = fs.put(file_content, filename=file.filename)
        print(f"File '{file.filename}' saved to GridFS with id {file_id}")
        return jsonify({'message': 'File saved to MongoDB successfully', 'file_id': str(file_id)})
    except Exception as e:
        print("Error saving file:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/files', methods=['GET'])
def get_files():
    try:
        # List all files saved in GridFS
        files = list(fs.find())
        files_list = [{"_id": str(f._id), "filename": f.filename} for f in files]
        return jsonify({"files": files_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/file/<file_id>/spectrogram', methods=['GET'])
def get_file_spectrogram(file_id):
    try:
        # Retrieve the file from GridFS using its ObjectId
        grid_out = fs.get(ObjectId(file_id))
        file_content = grid_out.read()
        
        # Convert the stored binary content back into a numpy array
        iq_data = np.frombuffer(file_content, dtype=np.complex64)
        
        # Generate spectrogram
        plt.figure()
        plt.specgram(iq_data, Fs=1e6, cmap='viridis')
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        buf.seek(0)
        encoded_img = base64.b64encode(buf.getvalue()).decode('utf-8')
        return jsonify({'spectrogram': encoded_img})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
