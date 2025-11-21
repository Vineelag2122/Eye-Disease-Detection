import os
import numpy as np
from flask import Flask, request, jsonify, render_template
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "eye_disease_model.h5") 
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Load Model
try:
    model = load_model(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Classes
CLASSES = ['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal']

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        try:
            # Save file temporarily
            filename = secure_filename(file.filename)
            filepath = os.path.join('static', filename)
            file.save(filepath)
            
            # Preprocess and Predict
            processed_img = preprocess_image(filepath)
            predictions = model.predict(processed_img)
            
            # Get result
            class_idx = np.argmax(predictions[0])
            class_label = CLASSES[class_idx]
            confidence = float(predictions[0][class_idx])
            
            # Clean up (optional, keeping it for display might be good but for now let's keep it simple)
            # os.remove(filepath) 
            
            return jsonify({
                'class': class_label,
                'confidence': confidence,
                'image_url': filepath
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(debug=True)
