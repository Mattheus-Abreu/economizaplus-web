import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { useEffect } from "react";
import { CircularProgress } from "./circular-progress";
import theme from "@/app/themes/theme";
import Goal from "@/types/goal";

// paleta de gradientes — atribuída por índice no home
export const GRADIENTS: [string, string][] = [
  ["#F43F5E", "#FB7185"],
  ["#7C3AED", "#A78BFA"],
  ["#22C55E", "#4ADE80"],
  ["#F97316", "#FDBA74"],
  ["#0EA5E9", "#38BDF8"],
  ["#EC4899", "#F9A8D4"],
];

type Props = {
  item: Goal;
  fontLoaded: boolean;
  gradientIndex?: number; // índice para escolher o gradiente
};

const CardMeta = ({ item, fontLoaded, gradientIndex = 0 }: Props) => {
  const router = useRouter();
  const progress = useSharedValue(0);

  const progressPercent = 0;

  useEffect(() => {
    progress.value = withTiming(progressPercent, {
      easing: Easing.bezier(0.95, 0.1, 0.95, 1),
      duration: 2000,
    });
  }, [progressPercent]);

  const gradient = GRADIENTS[gradientIndex % GRADIENTS.length];

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      />
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(protected)/goal/goalPage",
            params: { id: item.id },
          })
        }
        style={({ pressed }) => [
          styles.pressable,
          { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
      >
        <View style={styles.progressContainer}>
          <CircularProgress
            progress={progress}
            size={80}
            strokeWidth={7}
            outerCircleColor="rgba(255,255,255,0.15)"
            progressCircleColor="#ffffff"
            backgroundColor="#0000000f"
          />
        </View>

        <View style={styles.cardMiddle}>
          <Text style={[styles.cardTitle, fontLoaded && { fontFamily: "InterMedium" }]}>
            {item.name}
          </Text>
          <Text style={[styles.cardSubtitle, fontLoaded && { fontFamily: "InterRegular" }]}>
            Meta de R$ {item.targetAmount}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

export default CardMeta;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 180,
    borderRadius: 28,
    overflow: "hidden",
    padding: 24,
    justifyContent: "space-between",
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  pressable: {
    flex: 1,
    justifyContent: "space-between",
  },
  progressContainer: {
    position: "absolute",
    top: 16,
    right: 5,
  },
  cardMiddle: {
    gap: 8,
    marginTop: 40,
  },
  cardTitle: {
    fontSize: 34,
    fontWeight: "600",
    color: theme.colors.text,
  },
  cardSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  cardDeadline: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
});