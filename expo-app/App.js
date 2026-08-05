import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import HomeScreen from "./screens/HomeScreen";
import PredictionScreen from "./screens/PredictionScreen";
import HistoryScreen from "./screens/HistoryScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#1e40af",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 18,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "CheXpert X-Ray Analyzer" }}
        />
        <Stack.Screen
          name="Prediction"
          component={PredictionScreen}
          options={{ title: "Analysis Results" }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: "Prediction History" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
