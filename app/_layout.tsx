import React from 'react';
import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import { useAuth } from "../hooks/useAuth";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";



import { useColorScheme } from "../hooks/useColorScheme";
// import Mapbox from '@rnmapbox/maps';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastProvider } from "react-native-toast-notifications";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // const reduceMotion = useReducedMotion();

  

  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Mapbox.setAccessToken('pk.eyJ1IjoibWFqZWFwcGxpY2F0aW9uIiwiYSI6ImNtZGVuczVuNjAzc3kyanM3b2xyNTJwc3gifQ.9WulotkC9LhvJF2LOABFVg');

  const { isLoading, isAuthenticated, userTypeSaved } = useAuth();

  // useEffect(() => {
  //   if (reduceMotion) {
  //     Alert.alert(
  //       "Reduce Motion is On",
  //       'Please disable "Reduce Motion" in your device settings for the best experience using this app.',
  //       [{ text: "OK" }]
  //     );
  //   }
  // }, [reduceMotion]);

  // Persist Expo push token for API usage
 

  // Android system navigation bar: white background with dark icons
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#FFFFFF");
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    // <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <ThemeProvider value={colorScheme === "dark" ? DefaultTheme : DefaultTheme}>
      <ToastProvider
        placement="top"
        duration={4000}
        animationType="slide-in"
        offset={60}
        successColor="#22c55e"
        dangerColor="#ef4444"
        warningColor="#f59e0b"
        normalColor="#3b82f6"
      >
        <SafeAreaProvider>
          <SafeAreaView style={styles.container}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <StatusBar style="dark" backgroundColor="#FFFFFF" />
                {/* <NotifierWrapper> */}

              
                  <Stack
                    initialRouteName={
                      !isAuthenticated ? "(auth)" : "(dashboard)"
                    }
                  >
                    <Stack.Screen
                      name="index"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(auth)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(dashboard)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                {/* </NotifierWrapper> */}
            </GestureHandlerRootView>
          </SafeAreaView>
        </SafeAreaProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


