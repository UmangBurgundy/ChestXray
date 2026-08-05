# CheXpert Mobile App

A React Native Expo application for chest X-ray analysis using the fine-tuned CheXpert DenseNet121 model.

## Features

✅ **Image Upload** - Choose images from device gallery
✅ **Camera Capture** - Capture photos directly in the app
✅ **Real-time Analysis** - Get instant predictions with confidence scores
✅ **Multi-label Detection** - Detect 14 different pathologies
✅ **Prediction History** - Track all your predictions
✅ **Share Results** - Share findings with others
✅ **Beautiful UI** - Modern and intuitive interface

## Supported Pathologies

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

## Prerequisites

- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`
- Python backend running (see [backend instructions](../Readme.md))

## Installation

```bash
# Install dependencies
npm install

# or
yarn install
```

## Configuration

Update the API URL in `screens/HomeScreen.js`:

```javascript
const API_URL = "http://192.168.1.100:5000"; // Update with your backend IP
```

Replace `192.168.1.100` with your machine's IP address on the local network.

## Running the App

### Development Server

```bash
npm start
```

This will show a QR code. You can:

- Press `a` to run on Android simulator
- Press `i` to run on iOS simulator
- Scan the QR code with Expo Go app on your phone

### Android

```bash
npm run android
```

### iOS

```bash
npm run ios
```

### Web

```bash
npm run web
```

## Project Structure

```
expo-app/
├── App.js                    # Main app entry point
├── screens/
│   ├── HomeScreen.js        # Image upload/capture screen
│   ├── PredictionScreen.js  # Results display screen
│   └── HistoryScreen.js     # Prediction history screen
├── package.json
├── app.json                 # Expo configuration
└── assets/                  # App icons and splash screens
```

## Backend Integration

This app communicates with the Flask backend API at:

- **Endpoint**: `POST /predict-chexpert-finetuned`
- **Content-Type**: `multipart/form-data`
- **Response**: JSON with predictions and confidence scores

### Example Request

```bash
curl -X POST http://localhost:5000/predict-chexpert-finetuned \
  -F "file=@chest_xray.jpg"
```

### Example Response

```json
{
  "prediction": "Detected: Pneumonia, Infiltration",
  "confidence": 0.87,
  "top_class": "Pneumonia",
  "all_predictions": [
    {
      "class": "Pneumonia",
      "confidence": 0.87
    },
    {
      "class": "Infiltration",
      "confidence": 0.72
    }
  ]
}
```

## Troubleshooting

### Connection Error: "Failed to predict: Network Error"

1. **Check Backend is Running**: Ensure Flask server is running at the specified URL

   ```bash
   python backend/cheXpert.py
   ```

2. **Update API URL**: Make sure the IP address in `HomeScreen.js` matches your machine's IP
   - Find your IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Look for your local network IP (e.g., 192.168.x.x)

3. **Firewall**: Allow Python/Flask through your firewall

### Camera Permission Denied

Grant camera and photo library permissions in app settings

### Image Not Loading

Ensure the image file is in a supported format (JPEG, PNG)

## Storage

- Predictions are stored locally using AsyncStorage
- Clear history anytime in the History screen

## Security & Disclaimer

⚠️ **IMPORTANT**: This application is for **educational and research purposes only**. It is not intended for clinical use or to replace professional medical diagnosis. Always consult with qualified healthcare professionals for medical interpretation of chest X-rays.

## Dependencies

- `expo` - Development framework
- `react-native` - Mobile framework
- `react-navigation` - Navigation library
- `expo-camera` - Camera access
- `expo-image-picker` - Image picking
- `axios` - HTTP client
- `@react-native-async-storage/async-storage` - Local storage

## Development

### Adding New Screens

1. Create a new file in `screens/` folder
2. Import and add to `App.js` navigator
3. Add route to Stack.Navigator

### Customization

- **Colors**: Edit the color values in StyleSheet objects
- **Text**: Update strings in each screen component
- **Layout**: Modify flexbox properties

## Building for Production

### Android APK

```bash
eas build --platform android
```

### iOS

```bash
eas build --platform ios
```

For more info: https://docs.expo.dev/build/

## API Endpoints

The app communicates with these endpoints:

| Endpoint                      | Method | Description         |
| ----------------------------- | ------ | ------------------- |
| `/predict-chexpert-finetuned` | POST   | Analyze chest X-ray |
| `/health`                     | GET    | Health check        |

## Performance Notes

- Images are compressed to 80% quality before upload
- Predictions typically take 2-5 seconds depending on device
- History is cached locally for offline access

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is part of the CheXpert classification system.

## Support

For issues or questions:

1. Check the backend is running
2. Verify network connectivity
3. Review the console logs for detailed error messages
4. Check the Troubleshooting section above

---

**Happy analyzing! 🔬📱**
