import React, { useState, useFocusEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
    }, []),
  );

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem("predictionHistory");
      if (data) {
        setHistory(JSON.parse(data));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all prediction history?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Clear",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("predictionHistory");
              setHistory([]);
              Alert.alert("Success", "History cleared");
            } catch (error) {
              Alert.alert("Error", "Failed to clear history");
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const deleteItem = async (index) => {
    try {
      const newHistory = history.filter((_, i) => i !== index);
      setHistory(newHistory);
      await AsyncStorage.setItem(
        "predictionHistory",
        JSON.stringify(newHistory),
      );
    } catch (error) {
      Alert.alert("Error", "Failed to delete item");
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "#10b981";
    if (confidence >= 0.6) return "#f59e0b";
    return "#ef4444";
  };

  const renderHistoryItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => navigation.navigate("Prediction", { prediction: item })}
    >
      {item.imageUri && (
        <Image
          source={{ uri: item.imageUri }}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.historyContent}>
        <Text style={styles.historyTitle}>{item.top_class}</Text>
        <Text style={styles.historyPrediction} numberOfLines={2}>
          {item.prediction}
        </Text>
        <View style={styles.historyFooter}>
          <Text
            style={[
              styles.historyConfidence,
              { color: getConfidenceColor(item.confidence) },
            ]}
          >
            {(item.confidence * 100).toFixed(1)}%
          </Text>
          <Text style={styles.historyDate}>{formatDate(item.timestamp)}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteItem(index)}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>📭</Text>
        <Text style={styles.emptyTitle}>No Predictions Yet</Text>
        <Text style={styles.emptySubtitle}>
          Your prediction history will appear here
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {history.length} Prediction{history.length !== 1 ? "s" : ""}
        </Text>
        {history.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#991b1b",
  },
  listContent: {
    padding: 12,
  },
  historyCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    backgroundColor: "#f0f0f0",
  },
  historyContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  historyPrediction: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  historyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyConfidence: {
    fontSize: 13,
    fontWeight: "700",
  },
  historyDate: {
    fontSize: 11,
    color: "#9ca3af",
  },
  deleteButton: {
    width: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderLeftWidth: 1,
    borderLeftColor: "#fee2e2",
  },
  deleteButtonText: {
    fontSize: 18,
    color: "#dc2626",
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1e40af",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
