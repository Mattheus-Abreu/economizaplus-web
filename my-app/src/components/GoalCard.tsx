import Dropdown from "@/components/dropdown";
import { useGoals } from "@/contexts/goalContext";
import Goal from "@/types/goal";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { SemiCircularProgress } from "./semi-circular-progress";
import AppModal, { MODAL_HIDDEN, ModalConfig } from "./modal/modal";

type Props = {
  item: Goal;
  gradient?: [string, string];
};

function GoalCard({ item, gradient }: Props) {
  const router = useRouter();
  const { deleteGoal } = useGoals();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);

  function formatAmount(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return "–";
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  const progress = useSharedValue(0);

  const percentage =
  Number(item.currentAmount) / Number(item.targetAmount || 1);

  const remaining = Number(item.targetAmount) - Number(item.currentAmount);

useEffect(() => {
  progress.value = withTiming(percentage * 100, {
    duration: 1200,
  });
}, [item.currentAmount, item.targetAmount]);


  const InfoItem = ({ label, value }: any) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  function handleEdit() {
    router.push({
      pathname: "/(protected)/goal/createGoal",
      params: {
        id: item.id,
        name: item.name,
        targetAmount: item.targetAmount,
        currentAmount: item.currentAmount,
        deadline: item.deadline,
      },
    });
  }

  function handleDelete() {
    setModal({
      visible: true,
      variant: "warning",
      title: "Excluir meta",
      description: "Tem certeza que deseja excluir essa meta?",
      buttons: [
        {
          label: "Cancelar",
          onPress: () => setModal(MODAL_HIDDEN),
          variant: "secondary",
        },
        {
          label: "Excluir",
          onPress: async () => {
            await deleteGoal(item.id);
            setModal(MODAL_HIDDEN);
          },
          variant: "danger",
        },
      ],
    })
  }

  return (
    <View style={styles.card}>
      
      <View style={styles.topBar}>
        <Text style={styles.title}>{item.name}</Text>

        <Dropdown>
          <Dropdown.Trigger style={styles.trigger}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </Dropdown.Trigger>

          <Dropdown.Content style={styles.menu}>
            <Dropdown.Item onPress={handleEdit}>
              <Text style={styles.itemText}>Editar</Text>
              <Ionicons name="pencil" size={16} color="#111" />
            </Dropdown.Item>

            <Dropdown.Item onPress={handleDelete}>
              <Text style={[styles.itemText, styles.destructive]}>
                Deletar
              </Text>
              <Ionicons name="trash-outline" size={16} color="#dc2626" />
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      </View>

      <View style={styles.chart}>
        <SemiCircularProgress
          progress={progress}
          useGradient={true}
          gradientColors={gradient || ["#6C5CE7", "#A3A3A3"]}
          renderCenter={() => (
            <View style={{ alignItems: "center", gap: 5, marginTop: 50 }}>
              <Text style={styles.percent}>
                {Math.round(percentage * 100)}%
              </Text>
              <Text style={styles.subtitle}>
                de R$ {formatAmount(item.targetAmount.toString())}
              </Text>
            </View>
          )}
        />
      </View>

      <View style={styles.infoRow}>
        <InfoItem
          label="Guardado"
          value={`R$ ${formatAmount(item.currentAmount.toString())}`}
        />
        <InfoItem
          label="Falta"
          value={`R$ ${formatAmount(remaining.toString())}`}
        />
        <InfoItem
          label="Prazo"
          value={new Date(item.deadline).toLocaleDateString("pt-BR")}
        />
      </View>
      <AppModal
        visible={modal.visible}
        onClose={() => setModal(MODAL_HIDDEN)}
        variant={modal.variant}
        title={modal.title}
        description={modal.description}
        buttons={modal.buttons}
      />
    </View>
  );
}

 const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#1A0F2E",
    gap: 20,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  chart: {
    alignItems: "center",
  },

  percent: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },

  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoItem: {
    alignItems: "center",
  },

  infoLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginTop: 4,
  },

  trigger: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },

  menu: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 6,
  },

  itemText: {
    fontSize: 15,
    color: "#111",
  },

  destructive: {
    color: "#FF4D4D",
  },
});

export default GoalCard;
