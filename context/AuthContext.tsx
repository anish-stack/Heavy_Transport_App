import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from 'expo-secure-store'
import { getMyProfile } from "../utils/Api_Fetchings";

interface AuthContextType {
  token: string | null;
  user: null;
  loading: boolean;
  setToken: (token: string) => void;
  deleteToken: () => void;
  updateToken: (newToken: string) => void;
  isAuthenticated: boolean;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<null>(null);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    const loadToken = async () => {
      try {
        
        const storedToken = await SecureStore.getItemAsync("authToken");
        if (storedToken) {
          setToken(storedToken);
          getProfile(storedToken)
        }
      } catch (error) {
        console.error("Failed to load token:", error);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);



  const setToken = async (newToken: string) => {
    try {
      await SecureStore.setItemAsync("authToken", newToken);
      setTokenState(newToken);
    } catch (error) {
      console.error("Failed to save token:", error);
    }
  };

  const deleteToken = async () => {
    await SecureStore.deleteItemAsync("authToken");
    setUser(null);
    setTokenState(null);
  };

  const updateToken = async (newToken: string) => {
    await SecureStore.setItemAsync("authToken", newToken);
    setTokenState(newToken);
  };

  const getToken = async () => {
    const storedToken = await SecureStore.getItem("authToken");
    getProfile(storedToken)
    return storedToken;
  };


  const getProfile = async (tokenData) => {
    try {
      const data = await getMyProfile({ token: tokenData })
      setUser(data.data)
    } catch (error) {
      console.log("Failed to get profile:", error);
    } finally {
      setLoading(false);
    }
  }


  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, setToken, deleteToken, updateToken, getToken, isAuthenticated, loading, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
