#  🩺 Eye Disease Detection (Flask + TensorFlow + MobileNetV2)

A deep-learning powered web application that analyzes Fundus (retina) images and predicts one of four eye conditions:

Cataract
Diabetic Retinopathy
Glaucoma
Normal

This project uses MobileNetV2 (fine-tuned) and is deployed using Railway with TensorFlow CPU.

#🚀 Live Demo (Production URL)

🔗 App URL: https://web-production-ec56.up.railway.app/

#📂 Dataset

🔗 Dataset Link: https://www.kaggle.com/datasets/gunavenkatdoddi/eye-diseases-classification

Your dataset must follow this structure:
dataset/
 ├── cataract/
 ├── diabetic_retinopathy/
 ├── glaucoma/
 └── normal/

 🧠 Model Architecture

The model is based on MobileNetV2 pretrained on ImageNet and fine-tuned on your custom dataset.

✔ Architecture Summary

Input: 224 × 224 × 3
Base model: MobileNetV2 (include_top=False)
Fine-tuned last 50 layers
Added layers:
    GlobalAveragePooling2D
    Dropout(0.3)
    Dense(4, softmax)

✔ Model File

Your final trained model:
eye_disease_model_full.h5

#🛠️ Tech Stack
Frontend
  HTML / CSS / JS
Backend
  Flask
  Gunicorn (production server)
Machine Learning
  TensorFlow 2.19.0
  MobileNetV2
  ImageDataGenerator (augmentation)
Deployment
  Railway.app (recommended for TensorFlow CPU apps)

