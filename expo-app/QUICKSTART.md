# 🚀 CheXpert Mobile App - Quick Start

A React Native mobile app for analyzing chest X-rays using your fine-tuned CheXpert model.

## 📋 What You Get

✨ **Features:**

- 📱 Mobile app for iOS and Android
- 📸 Capture images with phone camera or select from gallery
- 🔍 Real-time analysis using your trained model
- 📊 Prediction history with confidence scores
- 💾 Local storage for offline access
- 📤 Share results with others
- 🎨 Beautiful, modern UI

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies

**Windows:**

```bash
cd expo-app
setup.bat
```

**Mac/Linux:**

```bash
cd expo-app
bash setup.sh
```

Or manually:

```bash
cd expo-app
npm install
```

### Step 2: Find Your Machine's IP

**Windows (Command Prompt):**

```bash
ipconfig
```

Look for IPv4 address like `192.168.x.x`

**Mac/Linux:**

```bash
ifconfig | grep inet
```

### Step 3: Update API URL

Open `expo-app/screens/HomeScreen.js` (line 15) and update:

```javascript
const API_URL = "http://192.168.1.100:5000"; // Replace with YOUR IP
```

### Step 4: Start Backend

From project root:

```bash
python backend/cheXpert.py
```

Should show:

```
CheXpert API Server
Model loaded: True
Device: cuda (or cpu)
 * Running on http://127.0.0.1:5000
```

### Step 5: Start Mobile App

From `expo-app/` directory:

```bash
npm start
```

#### Run on Your Device 📱

**Option A: Expo Go App**

1. Install "Expo Go" app from App Store or Play Store
2. Scan the QR code shown in terminal
3. App loads on your phone!

**Option B: Android Emulator**

```bash
npm run android
```

**Option C: iOS Simulator (Mac only)**

```bash
npm run ios
```

---

## 📖 Project Structure

```
expo-app/
├── App.js                      # Main navigation
├── screens/
│   ├── HomeScreen.js          # Upload/capture image
│   ├── PredictionScreen.js    # Show results
│   └── HistoryScreen.js       # View past predictions
├── package.json
├── app.json
├── README.md                   # Full documentation
└── CONFIGURATION.md            # Detailed setup guide
```

---

## 🎯 Usage

### Analyze an X-Ray

1. **Upload Image**: Tap "Choose from Gallery" or "Take Photo"
2. **Preview**: Image displays in app
3. **Analyze**: Tap "Analyze X-Ray"
4. **View Results**: See predictions with confidence scores
5. **Share**: Optional - share results with others

### View History

- Tap "View Prediction History"
- See all past predictions with timestamps
- Delete individual items or clear all
- Tap any item to view detailed results again

---

## 🔧 Backend Integration

The app sends images to: `http://YOUR_IP:5000/predict-chexpert-finetuned`

**Expected Response:**

```json
{
  "prediction": "Detected: Pneumonia, Infiltration",
  "confidence": 0.87,
  "top_class": "Pneumonia",
  "all_predictions": [
    { "class": "Pneumonia", "confidence": 0.87 },
    { "class": "Infiltration", "confidence": 0.72 }
  ]
}
```

---

## ⚠️ Troubleshooting

### App shows "Network Error"

**Solution:**

1. ✅ Backend running? `python backend/cheXpert.py`
2. ✅ IP address correct? Check `HomeScreen.js` line 15
3. ✅ Same Wi-Fi network? Phone and computer must be on same network
4. ✅ Firewall? Add Python to firewall exceptions

### "Model not loaded" error

**Solution:**

- Check `model/chexpert_finetuned_2nd.pth` exists
- Check backend logs for specific errors
- Ensure PyTorch/CUDA installed correctly

### Image won't upload

**Solution:**

- Use smaller images
- Check image format is JPEG or PNG
- Clear app cache and try again

### Can't run on phone?

**Solution:**

```bash
# Use Expo Go app instead (easier):
npm start
# Scan QR code with Expo Go
```

### Still stuck?

1. Check `CONFIGURATION.md` for detailed setup
2. Check `README.md` for full documentation
3. Review `screens/HomeScreen.js` comments for code details

---

## 🛠️ Customization

### Change App Name

Edit `app.json`:

```json
"name": "My CheXpert App"
```

### Change Colors

Edit any screen file and modify hex colors:

```javascript
backgroundColor: "#1e40af"; // Change to your color
```

### Change Backend URL

Edit `screens/HomeScreen.js`:

```javascript
const API_URL = "http://your.server.com:5000";
```

---

## 📝 Supported Pathologies

The app detects these 14 conditions:

- Atelectasis
- Cardiomegaly
- Consolidation
- Edema
- Effusion
- Emphysema
- Fibrosis
- Hernia
- Infiltration
- Nodule
- Pleural Thickening
- Pneumonia
- Pneumothorax
- No Finding

---

## 📱 Device Requirements

**Android:**

- Android 8.0+
- 50MB free space
- Camera permission
- Internet connection

**iOS:**

- iOS 13+
- 50MB free space
- Camera permission
- Internet connection

---

## 🚀 Next Steps

1. ✅ Complete 5-Minute Setup above
2. ✅ Test with sample X-ray images
3. ✅ Check results in History screen
4. ✅ Read `README.md` for advanced features
5. ✅ Read `CONFIGURATION.md` for detailed setup

---

## 📞 Support

**For issues:**

- Backend not running? Start it: `python backend/cheXpert.py`
- Wrong IP? Check `CONFIGURATION.md` → Getting Your Machine's IP
- Network error? Firewall might block Python
- App crash? Check console: terminal shows error logs

**For features:**

- Add new UI elements → Edit screen files in `screens/`
- Change backend URL → Edit `HomeScreen.js`
- Add new screens → Create file in `screens/` and add to `App.js`

---

## ⚖️ Disclaimer

⚠️ **EDUCATIONAL USE ONLY** - This app is for research/learning purposes. NOT for clinical use. Always consult healthcare professionals for medical diagnosis.

---

## 🎉 You're Ready!

```bash
cd expo-app
npm start
```

Scan the QR code and analyze X-rays on your phone! 📱🔍

Enjoy! 🚀
