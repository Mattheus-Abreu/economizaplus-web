import { useAppTheme } from "@/hooks/useAppTheme";
import React, { createContext, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import type {
  IButton,
  IEmptyContent,
  IEmptyContextValue,
  IEmptyDescription,
  IEmptyHeader,
  IEmptyMedia,
  IEmptyProps,
  IEmptyTitle,
} from "./types";

const EmptyContext = createContext<IEmptyContextValue | undefined>(undefined);

// ==================== EMPTY COMPONENT ====================

export const Empty: React.FC<IEmptyProps> = ({
  children,
  variant = "default",
  style,
}) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const contextValue = useMemo<IEmptyContextValue>(
    () => ({
      variant,
    }),
    [variant],
  );

  return (
    <EmptyContext.Provider value={contextValue}>
      <View
        style={[
          styles.empty,
          variant === "outline" && styles.emptyOutline,
          style,
        ]}
      >
        {children}
      </View>
    </EmptyContext.Provider>
  );
};

// ==================== EMPTY HEADER ====================

export const EmptyHeader: React.FC<IEmptyHeader> = ({ children, style }) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  return <View style={[styles.emptyHeader, style]}>{children}</View>;
};

// ==================== EMPTY MEDIA ====================

export const EmptyMedia: React.FC<IEmptyMedia> = ({
  children,
  variant = "icon",
  style,
}) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  return (
    <View
      style={[
        styles.emptyMedia,
        variant === "icon" && styles.emptyMediaIcon,
        style,
      ]}
    >
      {children}
    </View>
  );
};

// ==================== EMPTY TITLE ====================

export const EmptyTitle: React.FC<IEmptyTitle> = ({ children, style }) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  return <Text style={[styles.emptyTitle, style]}>{children}</Text>;
};

// ==================== EMPTY DESCRIPTION ====================

export const EmptyDescription: React.FC<IEmptyDescription> = ({
  children,
  style,
}) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  return <Text style={[styles.emptyDescription, style]}>{children}</Text>;
};

// ==================== EMPTY CONTENT ====================

export const EmptyContent: React.FC<IEmptyContent> = ({ children, style }) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  return <View style={[styles.emptyContent, style]}>{children}</View>;
};

// ==================== BUTTON COMPONENT ====================

export const EmptyButton: React.FC<IButton> = ({
  children,
  variant = "default",
  size = "md",
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      
      onPress={onPress}
      activeOpacity={0.7}
    >
      {typeof children === "string" ? (
        <Text
         
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

// ==================== ICON CLOUD COMPONENT ====================
const createStyles = (theme: ReturnType<typeof useAppTheme>) => 
  StyleSheet.create({
  empty: {
    // backgroundColor: "transparent",
    // borderRadius: 16,
    // padding: 48,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
  } as ViewStyle,
  emptyOutline: {
    borderWidth: 2,
    borderColor: theme.colors.glass,
    borderStyle: "dashed",
  } as ViewStyle,

  // Empty header
  emptyHeader: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  } as ViewStyle,

  // Empty media
  emptyMedia: {
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  emptyMediaIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,

  // Empty title
  emptyTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: "center",
  } as TextStyle,

  // Empty description
  emptyDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  } as TextStyle,

  // Empty content
  emptyContent: {
    marginTop: 32,
    width: "100%",
  } as ViewStyle,

  // Button base
  // button: {
  //   paddingHorizontal: 24,
  //   paddingVertical: 12,
  //   borderRadius: 120,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   backgroundColor: "#ffffff",
  // } as ViewStyle,
  // buttonOutline: {
  //   backgroundColor: "transparent",
  //   borderWidth: 1,
  //   borderColor: "#333333",
  // } as ViewStyle,

  // // Button sizes
  // buttonSm: {
  //   paddingHorizontal: 16,
  //   paddingVertical: 8,
  // } as ViewStyle,
  // buttonMd: {
  //   paddingHorizontal: 24,
  //   paddingVertical: 12,
  // } as ViewStyle,
  // buttonLg: {
  //   paddingHorizontal: 32,
  //   paddingVertical: 16,
  // } as ViewStyle,

  // // Button text
  // buttonText: {
  //   fontSize: 14,
  //   fontWeight: "500",
  //   color: "#000000",
  // } as TextStyle,
  // buttonTextOutline: {
  //   color: "#ffffff",
  // } as TextStyle,
  // buttonTextSm: {
  //   fontSize: 12,
  // } as TextStyle,
});
