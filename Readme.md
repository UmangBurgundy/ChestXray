# CheXpert Chest X-ray Classification

A deep learning application for multi-label chest X-ray pathology classification using DenseNet121 with Flask backend and interactive web interface.

## Features

- **Multi-label Classification**: Detects 14 different pathologies in chest X-rays
- **DenseNet121 Architecture**: Fine-tuned on CheXpert dataset
- **Flask Backend**: RESTful API for predictions
- **Web UI**: Interactive interface for image upload and results visualization
- **CORS Enabled**: Ready for frontend integration

## Supported Classes

- Atelectasis, Cardiomegaly, Consolidation, Edema
- Effusion, Emphysema, Fibrosis, Hernia
- Infiltration, Nodule, Pleural Thickening, Pneumonia
- Pneumothorax, No Finding

## Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Usage

### Start the Backend Server

```bash
python backend/cheXpert.py
```

The server runs on `http://localhost:5000`

### API Endpoints

#### POST /predict-chexpert-finetuned

Predict pathologies from chest X-ray image

**Request:**

- Form-data: `file` (image file)

**Response:**

```json
{
  "prediction": "Detected: Pneumonia, Consolidation, Infiltration",
  "confidence": 0.92,
  "top_class": "Pneumonia",
  "all_predictions": [
    { "class": "Pneumonia", "confidence": 0.92 },
    { "class": "Consolidation", "confidence": 0.87 }
  ]
}
```

#### GET /health

Health check endpoint

**Response:**

```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cuda" or "cpu"
}
```

### Access Web UI

Open `public/ChestXray.html` in your browser or serve via HTTP.

## Project Structure

```
prism_prj/
├── backend/
│   └── cheXpert.py          # Flask app & model inference
├── public/
│   └── ChestXray.html       # Web interface
├── model/
│   └── chexpert_finetuned.pth   # Pre-trained model weights
├── requirements.txt         # Python dependencies
├── .gitignore              # Git exclusions
└── Readme.md               # This file
```

## Requirements

- Python 3.8+
- CUDA 11.8+ (optional, for GPU acceleration)
- 2GB+ RAM (1GB+ VRAM for GPU)

## Notes

- Model file should be placed in `model/` directory
- GPU acceleration recommended for faster inference
- Threshold for detection set to 0.5

## License

Internal use only
