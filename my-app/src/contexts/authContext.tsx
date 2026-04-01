import { router } from "expo-router";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";


type AuthState = {
    isLoggedIn: boolean,
    isReady: boolean,
    token: string | null,
    signIn: (token: string) => void,
    signOut: () => void
}

const AUTH_STORAGE_KEY = "@myapp:auth-state";

export const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  async function storageState(newState: { isLoggedIn: boolean }){
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.log("ERROR_SET_STORAGE", error);
    }
  }

  async function signIn (newToken: string) {
    setIsLoggedIn(true);
    setToken(newToken);

    await AsyncStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ isLoggedIn: true, token: newToken })
    );
  }

  async function signOut () {
    setIsLoggedIn(false);
    storageState({ isLoggedIn: false });

    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }

  useEffect(() => {
    async function loadStorageState(){
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        const state = stored ? JSON.parse(stored) : null;

        setIsLoggedIn(state?.isLoggedIn ?? false);
        setToken(state?.token ?? null);
        setIsReady(true);
        
      } catch (error) {
        console.log("ERROR_GET_STORAGE", error);
        setIsLoggedIn(false);
      } finally{
        setIsReady(true);
      }
    }

    loadStorageState();
  }, []);

  return (
    <AuthContext.Provider value={{isLoggedIn, isReady, token, signIn, signOut}}>
        {children}
    </AuthContext.Provider>
  )
}