import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, memo, useCallback, useEffect, useRef, useState } from "react";
import {
  darkTheme,
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_ANIMATION_TYPE,
  DEFAULT_EASING,
  lightTheme,
} from "./conf";
import { ThemeSwitcher } from "./theme";
import {
  ThemeMode,
  type IThemeAnimation,
  type IThemeOptions,
  type ThemeColors,
  type ThemeConfig,
  type ThemeContextType,
  type ThemeProviderProps,
  type ThemeSwitcherRef,
} from "./types";

const THEME_STORAGE_KEY = "@app_theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> =
memo<ThemeProviderProps>(
    ({
children,
defaultTheme = ThemeMode.Dark,
onThemeChange,
onAnimationStart,
onAnimationComplete,
customLightColors,
customDarkColors,
    }: ThemeProviderProps): React.ReactNode & React.JSX.Element => {
const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
const [isReady, setIsReady] = useState(false);
const switcherRef = useRef<ThemeSwitcherRef>(null);
const [currentAnimation, setCurrentAnimation] = useState<IThemeAnimation>(
        {
type: DEFAULT_ANIMATION_TYPE,
duration: DEFAULT_ANIMATION_DURATION,
easing: DEFAULT_EASING,
        },
      );

useEffect(() => {
  AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
    if (saved === ThemeMode.Dark || saved === ThemeMode.Light) {
      setThemeState(saved);
    }
    setIsReady(true);
  });
}, []);

const mergedLightColors: ThemeColors = {
...lightTheme,
...customLightColors,
      };
const mergedDarkColors: ThemeColors = {
...darkTheme,
...customDarkColors,
      };
const colors: ThemeColors =
theme === ThemeMode.Dark ? mergedDarkColors : mergedLightColors;
const config: ThemeConfig = {
mode: theme,
colors,
animationType: currentAnimation.type,
animationDuration: currentAnimation.duration,
easing: currentAnimation.easing,
      };

const setTheme = useCallback(
        (newTheme: ThemeMode) => {
setThemeState(newTheme);
AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
onThemeChange?.(newTheme);
        },
        [onThemeChange],
      );

const toggleTheme = useCallback(
async <T extends IThemeOptions>(options?: T): Promise<void> => {
if (
            options?.animationType ||
            options?.animationDuration ||
            options?.easing
          ) {
setCurrentAnimation({
              type: options.animationType ?? currentAnimation.type,
              duration: options.animationDuration ?? currentAnimation.duration,
              easing: options.easing ?? currentAnimation.easing,
            });
          }
await new Promise((resolve) => setTimeout(resolve, 0));
if (switcherRef.current) {
await switcherRef.current.animate(options?.touchX, options?.touchY);
          }
        },
        [currentAnimation],
      );

const handleThemeChange = useCallback(
        <T extends ThemeMode>(newTheme: T) => {
setThemeState(newTheme);
AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
onThemeChange?.(newTheme);
        },
        [onThemeChange],
      );

const value: ThemeContextType = {
        theme,
        colors,
        config,
        toggleTheme,
        setTheme,
        isDark: theme === ThemeMode.Dark,
        isLight: theme === ThemeMode.Light,
      };

if (!isReady) return <></> ;

return (
<ThemeContext.Provider value={value}>
<ThemeSwitcher
ref={switcherRef}
theme={theme}
onThemeChange={handleThemeChange}
animationType={currentAnimation.type}
animationDuration={currentAnimation.duration}
easing={currentAnimation.easing}
onAnimationStart={onAnimationStart}
onAnimationComplete={onAnimationComplete}
>
            {children}
</ThemeSwitcher>
</ThemeContext.Provider>
      );
    },
  );

export { ThemeContext, ThemeMode };
