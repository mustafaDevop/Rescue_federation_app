import { useAuth } from '../../hooks/useAuth';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

const Index = () => {
  const { isLoading, userTypeSaved } = useAuth();

  if (isLoading) return null;

  return (
    <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName={
        userTypeSaved === "admin"
          ? "(admin)"
          : userTypeSaved === "user"
          ? "(user)"
          : "(user)" 
      }
    >
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="(user)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Index;

const styles = StyleSheet.create({});
