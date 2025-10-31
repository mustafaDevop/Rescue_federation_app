import { useAuth } from '@/hooks/useAuth';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

const Index = () => {

  const { isLoading, isAuthenticated, userTypeSaved, returnUser } = useAuth();


  return (
    <Stack
      initialRouteName={
        !returnUser
          ? 'index'
          : 'login'
      }
    >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        {/* <Stack.Screen name="+not-found" /> */}
    </Stack>
  )
}

export default Index

const styles = StyleSheet.create({})