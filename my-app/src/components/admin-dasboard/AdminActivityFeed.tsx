import { useTheme } from "@/components/theme-switch/hooks";
import { StyleSheet, Text, View } from "react-native";

export type ActivityEventType =
  | "signup"
  | "cancel"
  | "upgrade"
  | "downgrade"
  | "peak"
  | "alert"
  | "payment"
  | "custom";

export type ActivityEvent = {
  id: string;
  type: ActivityEventType;
  message: string;       // texto simples; use highlight para negrito
  highlight?: string;    // substring que fica em branco/negrito
  timeLabel: string;     // ex: "há 2 min", "agora"
  customColor?: string;  // só para type === "custom"
};

const EVENT_COLORS: Record<ActivityEventType, string> = {
  signup:    "#22C55E",
  cancel:    "#F43F5E",
  upgrade:   "#A855F7",
  downgrade: "#F97316",
  peak:      "#7C3AED",
  alert:     "#F59E0B",
  payment:   "#22C55E",
  custom:    "#94A3B8",
};

type AdminActivityFeedProps = {
  events: ActivityEvent[];
  title?: string;
};

export function AdminActivityFeed({ events, title }: AdminActivityFeedProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      {title && <Text style={styles.title}>{title}</Text>}
      {events.map((event, i) => {
        const dotColor =
          event.type === "custom"
            ? (event.customColor ?? EVENT_COLORS.custom)
            : EVENT_COLORS[event.type];

        // Destaca substring dentro da mensagem
        let content: React.ReactNode = (
          <Text style={styles.message}>{event.message}</Text>
        );
        if (event.highlight) {
          const idx = event.message.indexOf(event.highlight);
          if (idx !== -1) {
            const before = event.message.slice(0, idx);
            const after = event.message.slice(idx + event.highlight.length);
            content = (
              <Text style={styles.message}>
                {before}
                <Text style={styles.messageHighlight}>{event.highlight}</Text>
                {after}
              </Text>
            );
          }
        }

        return (
          <View
            key={event.id}
            style={[styles.row, i < events.length - 1 && styles.rowBorder]}
          >
            {/* Dot + linha vertical */}
            <View style={styles.dotCol}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              {i < events.length - 1 && (
                <View style={[styles.line, { backgroundColor: `${dotColor}25` }]} />
              )}
            </View>

            {/* Texto */}
            <View style={styles.textCol}>
              {content}
              <Text style={styles.time}>{event.timeLabel}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 0.5,
      borderColor: colors.glass,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 12,
    },
    row: {
      flexDirection: "row",
      gap: 12,
      paddingBottom: 12,
    },
    rowBorder: {
      // A linha vertical substitui o divisor horizontal
    },
    dotCol: {
      alignItems: "center",
      width: 10,
      paddingTop: 3,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    line: {
      flex: 1,
      width: 1.5,
      marginTop: 4,
      borderRadius: 1,
      minHeight: 12,
    },
    textCol: {
      flex: 1,
      gap: 2,
      paddingBottom: 4,
    },
    message: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    messageHighlight: {
      color: colors.text,
      fontWeight: "600",
    },
    time: {
      fontSize: 11,
      color: colors.textSecondary + "10",
    },
  });