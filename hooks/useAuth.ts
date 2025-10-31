// hooks/useAuth.ts
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userTypeSaved, setUserTypeSaved] = useState("");
  const [returnUser, setReturnUser] = useState(false);
  const [user, setUser] = useState<any>(null); 

  
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('last_login');
      await SecureStore.deleteItemAsync('user_type');
      await SecureStore.deleteItemAsync('user');
      setIsAuthenticated(false);
      setUser(null);
      setUserTypeSaved("");
      setReturnUser(false);
    } catch (err) {
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('auth_token');
      const lastLogin = await SecureStore.getItemAsync('last_login');
      const currUserType = await SecureStore.getItemAsync('user_type');
      const storedUser = await SecureStore.getItemAsync('user'); 
  
      if (storedUser) {
        setUser(JSON.parse(storedUser)); 
      }
  
      if (token && lastLogin) {
        const loginTime = new Date(lastLogin);
        const now = new Date();
        const daysSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60 * 24);
        setReturnUser(true);
  
        if (daysSinceLogin < 7) {
          setIsAuthenticated(true);
          setUserTypeSaved(currUserType || "");
        } else {
          await SecureStore.deleteItemAsync('auth_token');
          await SecureStore.deleteItemAsync('last_login');
          setIsAuthenticated(false);
          setUserTypeSaved(""); 
        }
      } else {
        setIsAuthenticated(false);
        setUserTypeSaved(""); 
      }
  
      setIsLoading(false);
    };
  
    checkAuth();
  }, []);
  

  return { 
    isLoading, 
    isAuthenticated, 
    userTypeSaved, 
    returnUser, 
    user, 
    logout 
  };
};
