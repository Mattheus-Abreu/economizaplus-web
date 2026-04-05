import { createContext, PropsWithChildren, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/services/api";

type AuthState = {
  isLoggedIn: boolean;
  isReady: boolean;
  token: string | null;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AUTH_STORAGE_KEY = "@myapp:auth-state";

export const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  async function signIn(newToken: string) {
  api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

  await AsyncStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ isLoggedIn: true, token: newToken })
  );

  setToken(newToken);
  setIsLoggedIn(true);
}

  async function signOut() {
    setIsLoggedIn(false);
    setToken(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }

  useEffect(() => {
    async function loadStorageState() {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        const state = stored ? JSON.parse(stored) : null;

        setIsLoggedIn(state?.isLoggedIn ?? false);
        setToken(state?.token ?? null);
      } catch (error) {
        console.log("ERROR_GET_STORAGE", error);
        setIsLoggedIn(false);
      } finally {
        setIsReady(true);
      }
    }

    loadStorageState();
  }, []);

useEffect(() => {
  const interceptor = api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return () => {
    api.interceptors.request.eject(interceptor);
  };
}, [token]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isReady, token, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}