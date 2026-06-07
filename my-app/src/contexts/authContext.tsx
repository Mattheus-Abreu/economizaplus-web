import { api } from "@/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  isLoggedIn: boolean;
  isReady: boolean;
  isFirstLogin: boolean;
  token: string | null;
  user: User | null;

  signIn: (token: string, user: User) => Promise<void>;
  signUp: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  clearFirstLogin: () => Promise<void>;
};

type SessionState = {
  isLoggedIn: boolean;
  isFirstLogin: boolean;
  token: string | null;
  user: User | null;
};

const AUTH_STORAGE_KEY = "@myapp:auth-state";
const ONBOARDING_KEY = "@myapp:onboarding-done";

export const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<SessionState>({
    isLoggedIn: false,
    isFirstLogin: false,
    token: null,
    user: null,
  });
  const [isReady, setIsReady] = useState(false);

  async function signIn(newToken: string, user: User) {
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

    const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY);
    const firstLogin = onboardingDone !== "true";

    await AsyncStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ isLoggedIn: true, token: newToken, user, })
    );

    setSession({ isLoggedIn: true, isFirstLogin: firstLogin, token: newToken, user });
  }

  async function signUp(newToken: string, user: User) {
    // Cadastro sempre é primeiro login — garante que onboarding será exibido
    // mesmo que o dispositivo tenha resquício de sessão anterior
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    await signIn(newToken, user);
  }

  async function signOut() {
    delete api.defaults.headers.common["Authorization"];
    setSession({ isLoggedIn: false, isFirstLogin: false, token: null, user: null });
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    // ONBOARDING_KEY é preservado intencionalmente:
    // usuário que fez login novamente não vê o onboarding de novo
  }

  async function clearFirstLogin() {
    setSession((prev) => ({ ...prev, isFirstLogin: false }));
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  }

  useEffect(() => {
    async function loadStorageState() {
      try {
        const [stored, onboardingDone] = await Promise.all([
          AsyncStorage.getItem(AUTH_STORAGE_KEY),
          AsyncStorage.getItem(ONBOARDING_KEY),
        ]);

        const state = stored ? JSON.parse(stored) : null;

        if (state?.token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
        }

        const alreadyLoggedIn = state?.isLoggedIn ?? false;

        setSession({
          isLoggedIn: alreadyLoggedIn,
          token: state?.token ?? null,
          user: state?.user ?? null,
          isFirstLogin: alreadyLoggedIn && onboardingDone !== "true",
        });
      } catch (error) {
        console.log("ERROR_GET_STORAGE", error);
        setSession({ isLoggedIn: false, isFirstLogin: false, token: null, user: null });
      } finally {
        setIsReady(true);
      }
    }

    loadStorageState();
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      if (session.token) config.headers.Authorization = `Bearer ${session.token}`;
      return config;
    });
    return () => api.interceptors.request.eject(interceptor);
  }, [session.token]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: session.isLoggedIn,
        isFirstLogin: session.isFirstLogin,
        token: session.token,
        user: session.user,
        isReady,
        signIn,
        signUp,
        signOut,
        clearFirstLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}