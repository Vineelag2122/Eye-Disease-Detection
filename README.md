# Eye Disease Detection — Flask + TensorFlow + MobileNetV2

A production-ready web application that analyzes fundus (retina) images and classifies them into one of four categories:

- Cataract
- Diabetic Retinopathy
- Glaucoma
- Normal

This repository contains the code for a Flask backend that serves a TensorFlow (Keras) model based on MobileNetV2. The app is designed for CPU inference and has been deployed to Railway.

---

## Table of contents

- [Demo](#demo)
- [Features](#features)
- [Repository structure](#repository-structure)
- [Dataset](#dataset)
- [Model architecture](#model-architecture)
- [Installation and local run](#installation-and-local-run)
- [API examples](#api-examples)
- [UI example](#ui-example)
- [Deployment notes](#deployment-notes)
- [Contributing](#contributing)
- [License & contact](#license--contact)

---

## Demo

Live demo (production):
https://web-production-ec56.up.railway.app/

---

## Features

- Image classification of fundus images into 4 categories
- Simple web UI for uploading images and viewing predictions
- REST endpoint for programmatic inference
- Uses transfer learning: MobileNetV2 (ImageNet pre-trained) + lightweight head for fast inference

---

## Repository structure (high level)

```text
.
├── app.py                # Flask app (routes & app initialization)
├── wsgi.py               # WSGI entry point for Gunicorn
├── requirements.txt      # Python dependencies (TensorFlow, Flask, etc.)
├── templates/            # HTML templates (UI)
├── static/               # Static assets (CSS, JS)
├── model/                # Trained model files (e.g. eye_disease_model_full.h5)
└── dataset/              # (Not stored in repo) dataset folder structure example
```

---

## Dataset

Recommended dataset (example: Kaggle "eye-diseases-classification").

Your dataset should follow this structure:

```text
dataset/
├── cataract/
│   ├── img1.jpg
│   └── ...
├── diabetic_retinopathy/
│   ├── img2.jpg
│   └── ...
├── glaucoma/
│   ├── img3.jpg
│   └── ...
└── normal/
    ├── img4.jpg
    └── ...
```

Note: Use ImageDataGenerator or tf.data pipelines with consistent resizing and normalization (224×224, same preprocessing used by MobileNetV2).

---

## Model architecture

- Base: MobileNetV2 (include_top=False, weights='imagenet')
- Input size: 224 × 224 × 3
- Fine-tune: last 50 layers of the base model
- Head:
  - GlobalAveragePooling2D
  - Dropout(0.3)
  - Dense(4, activation='softmax')

Final model filename used in this project:

```text
model/eye_disease_model_full.h5
```

Example of loading the model in code:

```python
from tensorflow.keras.models import load_model

model = load_model('model/eye_disease_model_full.h5')
```

---

## Installation and local run

1. Create and activate a virtual environment (recommended)

```bash
python -m venv venv
source venv/bin/activate   # macOS / Linux
venv\Scripts\activate      # Windows (PowerShell)
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Set environment variables (optional)

```bash
export FLASK_APP=app.py
export FLASK_ENV=development   # for debug mode (do not use in production)
```

4. Run with Flask (development)

```bash
flask run --host=0.0.0.0 --port=5000
```

5. Run with Gunicorn (production)

```bash
gunicorn --bind 0.0.0.0:8000 wsgi:app
```

Replace the port and binding as needed for your deployment environment.

---

## API examples

Predict endpoint (example):

- Endpoint: POST /predict
- Form-data key: file (image file)

cURL example:

```bash
curl -X POST "http://localhost:5000/predict" \
  -F "file=@/path/to/fundus_image.jpg"
```

Sample JSON response (example):

```json
{
  "prediction": "Diabetic Retinopathy",
  "probabilities": {
    "cataract": 0.02,
    "diabetic_retinopathy": 0.85,
    "glaucoma": 0.07,
    "normal": 0.06
  }
}
```

Adjust keys and URL per your app implementation.

---

## UI example

A minimal HTML upload form used by the app UI (templates/index.html):

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Eye Disease Detection</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body>
  <h1>Eye Disease Detection</h1>

  <form id="upload-form" action="/predict" method="post" enctype="multipart/form-data">
    <label for="file">Upload fundus image (jpg/png):</label>
    <input type="file" id="file" name="file" accept="image/*" required />
    <button type="submit">Predict</button>
  </form>

  <div id="result"></div>

  <script>
    // Optional: intercept form and display fetch result without reload
    const form = document.getElementById('upload-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const res = await fetch('/predict', { method: 'POST', body: data });
      const json = await res.json();
      document.getElementById('result').innerText = JSON.stringify(json, null, 2);
    });
  </script>
</body>
</html>
```

---

## Training tips & preprocessing

- Resize images to (224, 224)
- Use the same MobileNetV2 preprocessing:

```python
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# Apply preprocess_input to input images / batches
```

- Use augmentation to improve robustness (rotation, zoom, horizontal/vertical flips carefully)
- Monitor validation metrics and avoid overfitting: early stopping, dropout, and learning rate scheduling are useful

---

## Deployment notes

- This app is CPU-optimized; for inference speed with many concurrent requests consider:
  - Using a GPU-enabled instance or server
  - Running multiple Gunicorn worker processes
  - Converting model to TensorFlow SavedModel or TFLite for optimized serving
- Railway works well for small CPU-based deployments — ensure the model file is included in the deployed assets or loaded from a cloud storage bucket at runtime.

---

## Contributing

Contributions are welcome. Please open issues for bugs or feature requests and submit pull requests for fixes or improvements. Include tests, updated docs, and a description of the change.

---

## License & contact

- Author: Vineelag2122
- For questions, feature requests, or help, open an issue or contact the repo owner.

---
