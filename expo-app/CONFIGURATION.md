# CheXpert Mobile App Configuration Guide

## Getting Your Machine's IP Address

The mobile app needs to communicate with the Flask backend. You must update the API URL with your machine's IP address.

### Windows

**Method 1: Command Prompt**

```cmd
ipconfig
```

Look for "IPv4 Address" under your network adapter (usually something like `192.168.x.x`)

**Method 2: Settings**

1. Settings → Network & Internet → Wi-Fi
2. Click your network
3. Look for IPv4 address

### macOS/Linux

```bash
ifconfig
```

Look for `inet` address (usually something like `192.168.x.x`)

Or:

```bash
hostname -I
```

---

## Updating the API URL

**File**: `screens/HomeScreen.js`

**Find this line** (around line 15):

```javascript
const API_URL = "http://192.168.1.100:5000"; // Update with your backend IP
```

**Replace with your machine's IP**:

```javascript
const API_URL = "http://192.168.0.15:5000"; // Example: use your actual IP
```

---

## Running the Backend

Before starting the mobile app, ensure the Flask backend is running:

```bash
# From the project root directory
python backend/cheXpert.py
```

You should see output like:

```
CheXpert API Server
Model loaded: True
Device: cuda
Available classes: 14
 * Running on http://127.0.0.1:5000
```

---

## Starting the Mobile App

### Option 1: Development Server (Recommended)

```bash
cd expo-app
npm start
```

Then:

- Press `a` for Android simulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app (available on App Store/Play Store)

### Option 2: Direct to Device

1. Install Expo Go app on your mobile device
2. Scan the QR code shown after running `npm start`
3. The app will load on your device

### Option 3: Android Emulator

```bash
npm run android
```

### Option 4: iOS Simulator (macOS only)

```bash
npm run ios
```

---

## Common Connection Issues

### "Failed to predict: Network Error"

1. **Check Backend**: Is `python backend/cheXpert.py` running?
2. **Check IP**: Is the IP address in `HomeScreen.js` correct?
3. **Check Firewall**:
   - Windows Firewall might block Python
   - Add Python.exe to firewall exceptions
4. **Check Network**:
   - Phone and computer must be on same Wi-Fi network
   - Can you ping the computer from phone? (Use an app like "Ping" on Play Store)

### "Model not loaded"

1. Ensure `chexpert_finetuned_2nd.pth` exists in the `model/` directory
2. Check that CUDA/PyTorch is properly installed
3. Check backend logs for specific errors

### "Invalid image file"

1. Ensure the image is a valid JPEG or PNG
2. Try with a different image
3. Check that image size is reasonable

---

## Testing the Connection

### From Your Computer

```bash
curl -X POST http://localhost:5000/health
```

Should return:

```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cuda"
}
```

### From Mobile App

Use the app and check if the prediction works. You can use the browser dev tools to see network requests.

---

## Environment Variables (Optional)

Create a `.env` file in `expo-app/` if you want to manage the API URL:

```
REACT_APP_API_URL=http://192.168.0.15:5000
```

Then update `HomeScreen.js`:

```javascript
const API_URL = process.env.REACT_APP_API_URL || "http://192.168.1.100:5000";
```

---

## Performance Tips

1. **Resize Images**: The app automatically compresses images to 80% quality
2. **Faster Processing**: Use GPU (CUDA) on backend if available
3. **Network**: Use 5GHz Wi-Fi for faster uploads
4. **Device**: Close other apps to free up memory

---

## Debugging

### Enable Verbose Logging

In `screens/HomeScreen.js`, add after the API call:

```javascript
console.log("API Response:", result.data);
```

### Check Network Requests

In Expo Go:

1. Press `m` for menu
2. Look for Developer menu options

### View Console Output

When running `npm start`, console.log() outputs appear in the terminal.

---

## Next Steps

1. ✅ Update API_URL in `screens/HomeScreen.js`
2. ✅ Start the Python backend
3. ✅ Run `npm start` in expo-app folder
4. ✅ Scan QR code with Expo Go or simulator
5. ✅ Test with a chest X-ray image

---

## Customization

### Change App Colors

Edit the color codes in each screen file:

```javascript
backgroundColor: '#1e40af',  // Blue
backgroundColor: '#10b981',  // Green
backgroundColor: '#ef4444',  // Red
```

### Change App Name

Edit `app.json`:

```json
{
  "expo": {
    "name": "My CheXpert App"
  }
}
```

### Add Custom Splash Screen

Replace `assets/splash.png` (1284×2778px recommended)

---

For more help, see:

- Expo Docs: https://docs.expo.dev/
- React Native Docs: https://reactnative.dev/
- Backend Readme: [../Readme.md](../Readme.md)
