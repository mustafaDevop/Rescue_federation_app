import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { HapticTab } from '../../../components/HapticTab';
import TabBarBackground from '../../../components/ui/TabBarBackground';
import { useColorScheme } from '../../../hooks/useColorScheme';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarActiveTintColor: '#667eea',
            tabBarInactiveTintColor: '#ccc',
            tabBarBackground: TabBarBackground,
            tabBarStyle: [
              styles.tabBarStyle,
              Platform.OS === 'ios' ? styles.shadowIOS : styles.shadowAndroid,
            ],
          }}
        >
          <Tabs.Screen
            name="appointment/index"
            options={{
              title: 'Book a doctor appointment',
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="stethoscope" size={28} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings/index"
            options={{
              title: 'Logout',
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="cog-outline" size={28} color={color} />
              ),
            }}
          />
        </Tabs>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    height: 70,
  },
  shadowAndroid: {
    elevation: 10,
  },
  shadowIOS: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
