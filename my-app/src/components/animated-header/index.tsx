import { BlurView, BlurViewProps } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { easeGradient } from "react-native-easing-gradient";
import { Colors, HEADER_HEIGHT, MAX_BLUR_INTENSITY, spacing } from "./conf";
import type { AnimatedHeaderProps, GradientConfig } from "./types";

const AnimatedBlurView =
  Animated.createAnimatedComponent<BlurViewProps>(BlurView);

export const AnimatedHeaderScrollView = memo<AnimatedHeaderProps>(
  ({
    largeTitle,
    subtitle,
    children,
    rightComponent,
    showsVerticalScrollIndicator = false,
    contentContainerStyle,
    headerBackgroundGradient,
    headerBlurConfig = {
      intensity: 10,
      tint: Platform.OS === "ios" ? "systemThickMaterialDark" : "dark",
    },
    smallTitleBlurIntensity = 90,
    smallTitleBlurTint = "dark",
    maskGradientColors = {
      start: "transparent",
      middle: "rgba(0,0,0,0.99)",
      end: "black",
    },
    largeHeaderTitleStyle,
    largeHeaderSubtitleStyle,
    smallHeaderTitleStyle,
    smallHeaderSubtitleStyle,
  }) => {
    const scrollY = useSharedValue(0);
    const insets = useSafeAreaInsets();

    const onScroll = useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollY.value = event.contentOffset.y;
      },
    });

    // 🔥 GRADIENTE CORRIGIDO (TIPO + FALLBACK)
    const gradientConfig: GradientConfig =
      headerBackgroundGradient ?? {
        colors: [
          "rgba(0,0,0,0.85)",
          "rgba(0,0,0,0.8)",
          "transparent",
        ] as const,
        start: { x: 0.5, y: 0 },
        end: { x: 0.5, y: 1 },
      };

    // 🎯 animações
    const headerOpacity = useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.value, [0, 80], [1, 0], Extrapolation.CLAMP),
    }));

    const smallHeaderStyle = useAnimatedStyle(() => ({
      opacity: withTiming(
        interpolate(scrollY.value, [40, 80], [0, 1], Extrapolation.CLAMP),
        { duration: 400 }
      ),
      transform: [
        {
          translateY: withTiming(
            interpolate(scrollY.value, [40, 80], [20, 0], Extrapolation.CLAMP),
            { duration: 400 }
          ),
        },
      ],
    }));

    const largeTitleStyle = useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.value, [0, 60], [1, 0], Extrapolation.CLAMP),
    }));

    const animatedHeaderBlur = useAnimatedProps(() => ({
      intensity: interpolate(
        scrollY.value,
        [0, 100],
        [0, MAX_BLUR_INTENSITY],
        Extrapolation.CLAMP
      ),
    }));

    const smallTitleBlur = useAnimatedProps(() => ({
      intensity: interpolate(
        scrollY.value,
        [0, 80],
        [0, smallTitleBlurIntensity],
        Extrapolation.CLAMP
      ),
    }));

    const { colors: maskColors, locations: maskLocations } = easeGradient({
      colorStops: {
        0: { color: maskGradientColors.start },
        0.5: { color: maskGradientColors.middle },
        1: { color: maskGradientColors.end },
      },
      extraColorStopsPerTransition: 20,
    });

    return (
      <View style={styles.container}>
        {/* 🌈 BACKGROUND */}
        <Animated.View
          style={[
            styles.headerBackgroundContainer,
            {
              height: HEADER_HEIGHT + insets.top + 50,
            },
            headerOpacity,
          ]}
        >
          <MaskedView
            maskElement={
              <LinearGradient
                locations={maskLocations as any}
                colors={maskColors as any}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
              />
            }
            style={StyleSheet.absoluteFill}
          >
            <LinearGradient
              colors={gradientConfig.colors}
              locations={gradientConfig.locations ?? undefined}
              start={gradientConfig.start}
              end={gradientConfig.end}
              style={StyleSheet.absoluteFill}
            />

            <AnimatedBlurView
              animatedProps={animatedHeaderBlur}
              tint={headerBlurConfig.tint as any}
              style={StyleSheet.absoluteFill}
            />
          </MaskedView>
        </Animated.View>

        {/* 🔝 HEADER FIXO */}
        <Animated.View
          style={[
            styles.fixedHeader,
            {
              paddingTop: insets.top,
              height: HEADER_HEIGHT + insets.top,
            },
            smallHeaderStyle,
          ]}
        >
          <View style={styles.fixedHeaderContent}>
            <View style={styles.fixedHeaderTextContainer}>
              <Animated.Text
                style={[styles.smallHeaderTitle, smallHeaderTitleStyle]}
              >
                {largeTitle}
              </Animated.Text>

              {subtitle && (
                <Animated.Text
                  style={[
                    styles.smallHeaderSubtitle,
                    smallHeaderSubtitleStyle,
                  ]}
                >
                  {subtitle}
                </Animated.Text>
              )}
            </View>

            <AnimatedBlurView
              animatedProps={smallTitleBlur}
              tint={smallTitleBlurTint}
              style={[
                styles.smallTitleBlurOverlay,
                {
                  height: HEADER_HEIGHT + insets.top,
                },
              ]}
            />

            {rightComponent && (
              <View style={styles.rightComponentContainer}>
                {rightComponent}
              </View>
            )}
          </View>
        </Animated.View>

        {/* 📜 SCROLL */}
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          contentContainerStyle={[
            {
              paddingTop: spacing.md,
              paddingBottom: insets.bottom + spacing.xl,
            },
            contentContainerStyle,
          ]}
        >
          <Animated.View style={[styles.largeTitleContainer, largeTitleStyle]}>
            <Text style={[styles.largeTitle, largeHeaderTitleStyle]}>
              {largeTitle}
            </Text>

            {subtitle && (
              <Text style={[styles.largeSubtitle, largeHeaderSubtitleStyle]}>
                {subtitle}
              </Text>
            )}
          </Animated.View>

          <View style={styles.content}>{children}</View>
        </Animated.ScrollView>
      </View>
    );
  }
);

export default AnimatedHeaderScrollView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  headerBackgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 11,
    justifyContent: "flex-end",
  },
  fixedHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  fixedHeaderTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  smallHeaderTitle: {
    fontSize: 20,
    color: Colors.white,
    textAlign: "center",
  },
  smallHeaderSubtitle: {
    fontSize: 12,
    color: Colors.gray[400],
    textAlign: "center",
  },
  rightComponentContainer: {
    marginLeft: spacing.md,
  },
  smallTitleBlurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  largeTitleContainer: {
    marginBottom: spacing.md,
  },
  largeTitle: {
    fontSize: 40,
    color: Colors.white,
  },
  largeSubtitle: {
    fontSize: 16,
    color: Colors.gray[400],
  },
  content: {
    paddingHorizontal: 0,
  },
});