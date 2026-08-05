import io
import os
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional

import numpy as np
from PIL import Image
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# CheXpert classes (14 standard pathology categories)
CHEXPERT_CLASSES = [
    'Atelectasis', 'Cardiomegaly', 'Consolidation', 'Edema',
    'Effusion', 'Emphysema', 'Fibrosis', 'Hernia',
    'Infiltration', 'Nodule', 'Pleural_Thickening', 'Pneumonia',
    'Pneumothorax', 'No Finding'
]

# Pydantic Schemas for OpenAPI Documentation
class PathologyScore(BaseModel):
    cls_name: str
    confidence: float

    class Config:
        fields = {'cls_name': 'class'}

class DetectionItem(BaseModel):
    cls_name: str
    confidence: float

    class Config:
        fields = {'cls_name': 'class'}

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    device: str
    num_classes: int
    classes: List[str]

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    top_class: str
    all_predictions: List[Dict[str, Any]]
    full_breakdown: List[Dict[str, Any]]

class DenseNet121(nn.Module):
    """DenseNet121 for CheXpert multi-label classification"""
    def __init__(self, num_classes=14):
        super(DenseNet121, self).__init__()
        self.densenet = torch.hub.load('pytorch/vision:v0.10.0', 'densenet121', pretrained=False)
        num_ftrs = self.densenet.classifier.in_features
        self.densenet.classifier = nn.Linear(num_ftrs, num_classes)
        self.num_classes = num_classes
    
    def forward(self, x):
        return self.densenet(x)

# Model container
model_container: Dict[str, Any] = {"model": None}

def load_model(model_path: str):
    """Load the CheXpert finetuned model"""
    try:
        model = DenseNet121(num_classes=14)
        checkpoint = torch.load(model_path, map_location=device, weights_only=False)
        
        if isinstance(checkpoint, dict) and 'state_dict' in checkpoint:
            model.load_state_dict(checkpoint['state_dict'], strict=False)
        elif isinstance(checkpoint, dict):
            model.load_state_dict(checkpoint, strict=False)
        else:
            model = checkpoint
        
        model = model.to(device)
        model.eval()
        print(f"[FastAPI] Model successfully loaded from {model_path}")
        return model
    except Exception as e:
        print(f"[FastAPI] Error loading model from {model_path}: {e}")
        return None

# Lifespan context manager for FastAPI
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODEL_PATH = os.path.join(BASE_DIR, 'model', 'chexpert_finetuned_2nd.pth')
    if not os.path.exists(MODEL_PATH):
        MODEL_PATH = os.path.join(BASE_DIR, 'model', 'chexpert_finetuned.pth')

    if os.path.exists(MODEL_PATH):
        model_container["model"] = load_model(MODEL_PATH)
    else:
        print(f"[FastAPI] Warning: Model file not found in model/ directory")
    yield
    # Shutdown
    model_container["model"] = None

app = FastAPI(
    title="CheXpert Chest X-ray Classification API",
    description="Multi-label chest X-ray pathology detection powered by DenseNet121 and PyTorch",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Preprocessing transforms
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406], 
        std=[0.229, 0.224, 0.225]
    )
])

# Mount static files directory if present
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")
if os.path.exists(PUBLIC_DIR):
    app.mount("/static", StaticFiles(directory=PUBLIC_DIR), name="static")

@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def serve_root():
    """Serve the primary Web UI interface"""
    html_file = os.path.join(PUBLIC_DIR, "ChestXray.html")
    if os.path.exists(html_file):
        return FileResponse(html_file)
    return HTMLResponse("<h1>CheXpert FastAPI Server</h1><p>Visit <a href='/docs'>/docs</a> for API documentation.</p>")

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint returning model & system status"""
    return HealthResponse(
        status="healthy",
        model_loaded=model_container["model"] is not None,
        device=str(device),
        num_classes=len(CHEXPERT_CLASSES),
        classes=CHEXPERT_CLASSES
    )

@app.get("/api/v1/health", response_model=HealthResponse)
async def health_check_v1():
    """Health check endpoint (API v1)"""
    return await health_check()

async def process_prediction(file: UploadFile):
    model = model_container["model"]
    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded on server")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image = image.convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    try:
        image_tensor = transform(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(image_tensor)
            probs = torch.sigmoid(outputs).cpu().numpy()[0]
        
        top_idx = int(probs.argmax())
        top_prob = float(probs[top_idx])
        top_class = CHEXPERT_CLASSES[top_idx]
        
        threshold = 0.5
        detections = []
        all_class_scores = []

        for idx, prob in enumerate(probs):
            cls_name = CHEXPERT_CLASSES[idx]
            conf = float(prob)
            all_class_scores.append({
                "class": cls_name,
                "confidence": round(conf, 4)
            })
            if conf >= threshold:
                detections.append({
                    "class": cls_name,
                    "confidence": round(conf, 4)
                })

        detections.sort(key=lambda x: x["confidence"], reverse=True)
        all_class_scores.sort(key=lambda x: x["confidence"], reverse=True)

        if detections:
            prediction_text = f"Detected: {', '.join([d['class'] for d in detections[:3]])}"
        else:
            prediction_text = "No abnormalities detected (All conditions below 50% threshold)"

        return {
            "prediction": prediction_text,
            "confidence": round(top_prob, 4),
            "top_class": top_class,
            "all_predictions": detections,
            "full_breakdown": all_class_scores
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post("/predict-chexpert-finetuned", response_model=PredictionResponse)
async def predict_chexpert(file: UploadFile = File(...)):
    """Analyze chest X-ray image for 14 CheXpert pathology classes"""
    return await process_prediction(file)

@app.post("/api/v1/predict", response_model=PredictionResponse)
async def predict_chexpert_v1(file: UploadFile = File(...)):
    """Analyze chest X-ray image for 14 CheXpert pathology classes (API v1)"""
    return await process_prediction(file)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

