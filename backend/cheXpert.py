import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import io

app = Flask(__name__)
CORS(app)

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# CheXpert classes
CHEXPERT_CLASSES = [
    'Atelectasis', 'Cardiomegaly', 'Consolidation', 'Edema',
    'Effusion', 'Emphysema', 'Fibrosis', 'Hernia',
    'Infiltration', 'Nodule', 'Pleural_Thickening', 'Pneumonia',
    'Pneumothorax', 'No Finding'
]

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

# Load model
def load_model(model_path):
    """Load the CheXpert finetuned model"""
    try:
        model = DenseNet121(num_classes=14)
        checkpoint = torch.load(model_path, map_location=device, weights_only=False)
        
        # Handle both direct state dict and wrapped state dict
        if isinstance(checkpoint, dict) and 'state_dict' in checkpoint:
            model.load_state_dict(checkpoint['state_dict'], strict=False)
        elif isinstance(checkpoint, dict):
            model.load_state_dict(checkpoint, strict=False)
        else:
            model = checkpoint
        
        model = model.to(device)
        model.eval()
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

# Initialize model
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'model', 'chexpert_finetuned_2nd.pth')
if os.path.exists(MODEL_PATH):
    model = load_model(MODEL_PATH)
else:
    model = None
    print(f"Warning: Model not found at {MODEL_PATH}")

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                        std=[0.229, 0.224, 0.225])
])

@app.route('/predict-chexpert-finetuned', methods=['POST'])
def predict_chexpert():
    """Endpoint for CheXpert predictions"""
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read and preprocess image
        image_data = file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Ensure image is valid
        if image is None:
            return jsonify({'error': 'Invalid image file'}), 400
        
        # Preprocess image
        image_tensor = transform(image).unsqueeze(0).to(device)
        
        # Get prediction
        with torch.no_grad():
            outputs = model(image_tensor)
            probs = torch.sigmoid(outputs)  # Multi-label sigmoid
            probs = probs.cpu().numpy()[0]
        
        # Get top prediction
        top_idx = probs.argmax()
        top_prob = float(probs[top_idx])
        top_class = CHEXPERT_CLASSES[top_idx]
        
        # Get all detections above threshold
        threshold = 0.5
        detections = []
        for idx, prob in enumerate(probs):
            if prob >= threshold and idx < len(CHEXPERT_CLASSES):
                detections.append({
                    'class': CHEXPERT_CLASSES[idx],
                    'confidence': float(prob)
                })
        
        # Sort by confidence
        detections.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Prepare response
        if detections:
            prediction_text = f"Detected: {', '.join([d['class'] for d in detections[:3]])}"
        else:
            prediction_text = "No abnormalities detected"
        
        return jsonify({
            'prediction': prediction_text,
            'confidence': top_prob,
            'top_class': top_class,
            'all_predictions': detections
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'device': str(device)
    }), 200

if __name__ == '__main__':
    print(f"CheXpert API Server")
    print(f"Model loaded: {model is not None}")
    print(f"Device: {device}")
    print(f"Available classes: {len(CHEXPERT_CLASSES)}")
    app.run(debug=True, host='127.0.0.1', port=5000, use_reloader=False)
