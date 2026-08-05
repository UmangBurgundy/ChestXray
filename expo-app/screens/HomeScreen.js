import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function HomeScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState("http://10.0.2.2:8000"); // 10.0.2.2 for Android Emulator, 127.0.0.1 / IP for iOS/devices

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera roll access is needed to upload X-ray images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image: " + error.message);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera access is needed to capture X-ray images.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo: " + error.message);
    }
  };

  const analyzeImage = async () => {
    if (!imageUri) {
      Alert.alert("No Image", "Please select or take an X-ray image first.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop() || "xray.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append("file", {
        uri: imageUri,
        name: filename,
        type: type,
      });

      // Format endpoint URL
      let endpoint = apiUrl.trim();
      if (endpoint.endsWith("/")) {
        endpoint = endpoint.slice(0, -1);
      }
      if (!endpoint.endsWith("/api/v1/predict") && !endpoint.endsWith("/predict-chexpert-finetuned")) {
        endpoint += "/api/v1/predict";
      }

      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      const resultData = response.data;
      const predictionRecord = {
        ...resultData,
        imageUri: imageUri,
        timestamp: Date.now(),
      };

      // Save to local AsyncStorage history
      try {
        const existingHistory = await AsyncStorage.getItem("predictionHistory");
        const historyList = existingHistory ? JSON.parse(existingHistory) : [];
        historyList.unshift(predictionRecord);
        await AsyncStorage.setItem("predictionHistory", JSON.stringify(historyList));
      } catch (storageError) {
        console.warn("Could not save to history:", storageError);
      }

      // Navigate to Prediction Screen
      navigation.navigate("Prediction", { prediction: predictionRecord });
    } catch (error) {
      let errMsg = "Failed to connect to backend server.";
      if (error.response && error.response.data && error.response.data.detail) {
        errMsg = error.response.data.detail;
      } else if (error.message) {
        errMsg = error.message;
      }
      Alert.alert("Analysis Error", errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>CheXpert AI Diagnostic Engine</Text>
        <Text style={styles.subtitle}>
          Upload or capture a chest X-ray image for instant multi-label pathology detection (DenseNet121).
        </Text>
      </View>

      <View style={styles.configCard}>
        <Text style={styles.configLabel}>Backend API Host URL:</Text>
        <TextInput
          style={styles.apiInput}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://192.168.1.x:8000"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.configHint}>
          Use 10.0.2.2 for Android Emulator, localhost for iOS simulator, or your local machine IP for physical devices.
        </Text>
      </View>

      <View style={styles.previewContainer}>
        {imageUri ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
            <TouchableOpacity style={styles.removeButton} onPress={() => setImageUri(null)}>
              <Text style={styles.removeButtonText}>✕ Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderIcon}>🩻</Text>
            <Text style={styles.placeholderText}>No X-ray image selected</Text>
          </View>
        )}
      </View>

      <View style={styles.actionSection}>
        <View style={styles.pickerButtonGroup}>
          <TouchableOpacity style={[styles.button, styles.pickerButton]} onPress={pickImage} disabled={loading}>
            <Text style={styles.buttonText}>🖼️ Choose Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.pickerButton]} onPress={takePhoto} disabled={loading}>
            <Text style={styles.buttonText}>📷 Take Photo</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1e40af" />
            <Text style={styles.loadingText}>Analyzing X-ray image with DenseNet121...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.analyzeButton, !imageUri && styles.disabledButton]}
            onPress={analyzeImage}
            disabled={!imageUri || loading}
          >
            <Text style={styles.analyzeButtonText}>⚡ Run AI Analysis</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.historyButton]}
          onPress={() => navigation.navigate("History")}
          disabled={loading}
        >
          <Text style={styles.historyButtonText}>📋 View Past History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 18,
  },
  configCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  configLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  apiInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
    fontFamily: "monospace",
  },
  configHint: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
  },
  previewContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 240,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  placeholderBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "500",
  },
  imageWrapper: {
    width: "100%",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 250,
    borderRadius: 8,
  },
  removeButton: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 6,
  },
  removeButtonText: {
    color: "#991b1b",
    fontSize: 12,
    fontWeight: "600",
  },
  actionSection: {
    gap: 12,
  },
  pickerButtonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  analyzeButton: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
  },
  analyzeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
    opacity: 0.6,
  },
  historyButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  historyButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingBox: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: "#1e40af",
    fontWeight: "500",
  },
});
