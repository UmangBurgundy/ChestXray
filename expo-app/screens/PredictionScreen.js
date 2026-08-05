import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
} from "react-native";

export default function PredictionScreen({ route, navigation }) {
  const { prediction } = route.params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `CheXpert Analysis Result:\n\nPrediction: ${prediction.prediction}\nConfidence: ${(prediction.confidence * 100).toFixed(2)}%\nTop Class: ${prediction.top_class}`,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "#10b981";
    if (confidence >= 0.6) return "#f59e0b";
    return "#ef4444";
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {prediction.imageUri && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: prediction.imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}

        <View style={styles.resultCard}>
          <Text style={styles.timestamp}>
            {formatDate(prediction.timestamp)}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Primary Prediction</Text>
            <View style={styles.predictionBox}>
              <Text style={styles.predictionText}>{prediction.prediction}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Finding</Text>
            <View
              style={[
                styles.topClassBox,
                {
                  borderLeftColor: getConfidenceColor(prediction.confidence),
                },
              ]}
            >
              <Text style={styles.topClassName}>{prediction.top_class}</Text>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${prediction.confidence * 100}%`,
                      backgroundColor: getConfidenceColor(
                        prediction.confidence,
                      ),
                    },
                  ]}
                />
              </View>
              <Text style={styles.confidenceText}>
                {(prediction.confidence * 100).toFixed(2)}% confidence
              </Text>
            </View>
          </View>

          {prediction.all_predictions &&
            prediction.all_predictions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>All Detections</Text>
                {prediction.all_predictions.map((item, index) => (
                  <View key={index} style={styles.predictionItem}>
                    <View style={styles.predictionItemHeader}>
                      <Text style={styles.predictionItemName}>
                        {item.class}
                      </Text>
                      <Text
                        style={[
                          styles.predictionItemConfidence,
                          {
                            color: getConfidenceColor(item.confidence),
                          },
                        ]}
                      >
                        {(item.confidence * 100).toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.miniBar}>
                      <View
                        style={[
                          styles.miniFill,
                          {
                            width: `${item.confidence * 100}%`,
                            backgroundColor: getConfidenceColor(
                              item.confidence,
                            ),
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.shareButton]}
              onPress={handleShare}
            >
              <Text style={styles.buttonText}>📤 Share Results</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>← Back</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>⚠️ Important Notice</Text>
          <Text style={styles.infoText}>
            This application is for educational and research purposes only. It
            is not intended for clinical use or to replace professional medical
            diagnosis. Always consult with qualified healthcare professionals
            for medical interpretation of chest X-rays.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  imageContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 300,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  timestamp: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  predictionBox: {
    backgroundColor: "#f0fdf4",
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
    padding: 12,
    borderRadius: 6,
  },
  predictionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
  },
  topClassBox: {
    backgroundColor: "#f8fafc",
    borderLeftWidth: 4,
    padding: 16,
    borderRadius: 8,
    borderTopRightRadius: 8,
  },
  topClassName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  confidenceBar: {
    height: 24,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  predictionItem: {
    backgroundColor: "#f8fafc",
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#cbd5e1",
  },
  predictionItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  predictionItemName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  predictionItemConfidence: {
    fontSize: 13,
    fontWeight: "700",
    minWidth: 50,
    textAlign: "right",
  },
  miniBar: {
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    overflow: "hidden",
  },
  miniFill: {
    height: "100%",
    borderRadius: 2,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  shareButton: {
    backgroundColor: "#1e40af",
  },
  backButton: {
    backgroundColor: "#6b7280",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#fef2f2",
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
    padding: 16,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7f1d1d",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#991b1b",
    lineHeight: 18,
  },
});
