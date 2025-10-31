import { useAuth } from '../hooks/useAuth';
import { Redirect } from 'expo-router';
import React, { useState } from 'react';

export default function Index() {
  const { isLoading, isAuthenticated, userTypeSaved } = useAuth(); 

 

  if (isLoading) return null;

  if (!isAuthenticated || !userTypeSaved) {
    return <Redirect href="/(auth)" />;

  }

  if (userTypeSaved === 'customer') {
    return <Redirect href="/(dashboard)/(user)/appointment" />;
  }

  if (userTypeSaved === 'admin') {
    return <Redirect href="/(dashboard)/(admin)/dashboard" />;
  }

  


  return <Redirect href="/(auth)" />;

}

