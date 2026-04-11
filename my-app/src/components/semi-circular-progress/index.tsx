import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Animated, { SharedValue, useAnimatedProps } from "react-native-reanimated";
import { Circle, Svg, Defs, LinearGradient, Stop, type CircleProps } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent<CircleProps>(Circle);

type Props = {
  progress: SharedValue<number>; 
  size?: number;
  strokeWidth?: number;
  progressColor?: string;
  trackColor?: string;
  backgroundColor?: string;
  useGradient?: boolean;
  gradientColors?: string[];
  renderCenter?: () => React.ReactNode;
};

export const SemiCircularProgress: React.FC<Props> = ({
  progress,
  size = 180,
  strokeWidth = 20,
  progressColor = "#6C5CE7",
  trackColor = "rgba(255,255,255,0.1)",
  useGradient = false,
  gradientColors,
  backgroundColor = "transparent",
  renderCenter,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circum = 2 * Math.PI * radius;

  const halfCircum = circum / 2;

  const animatedProps = useAnimatedProps(() => {
    const value = Math.min(Math.max(progress.value, 0), 100);

    return {
      strokeDashoffset: halfCircum * (1 - value / 100),
    };
  });

  return (
    <View style={{ width: size, height: size / 2 }}>
      <Svg width={size} height={size}>
        {useGradient && (
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              {gradientColors?.map((color, index) => {
                const total = gradientColors.length - 1 || 1;

                return (
                  <Stop
                    key={index}
                    offset={`${(index / total) * 100}%`}
                    stopColor={color}
                  />
                );
              })}
            </LinearGradient>
          </Defs>
        )}
        <Circle
          stroke={trackColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${halfCircum} ${circum}`}
          strokeLinecap="round"
          transform={`rotate(-180, ${size / 2}, ${size / 2})`}
        />

        <AnimatedCircle
          stroke={useGradient ? "url(#grad)" : progressColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${halfCircum} ${circum}`}
          strokeLinecap="round"
          transform={`rotate(-180, ${size / 2}, ${size / 2})`}
          animatedProps={animatedProps}
        />
      </Svg>

      <View style={[styles.center, { width: size, height: size / 2 }]}>
        {renderCenter && renderCenter()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});