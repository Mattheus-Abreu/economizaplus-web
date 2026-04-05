import Dropdown from "@/components/dropdown";
import { useGoals } from "@/contexts/goalContext";
import Goal from "@/types/goal";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";
import { AnimatedProgressBar } from "./progressBar";

type Props = {
  item: Goal;
  gradient?: [string, string];
};

function GoalCard({ item, gradient }: Props) {
  const router = useRouter();
  const { deleteGoal } = useGoals();

  function handleEdit() {
    router.push({
      pathname: "/(protected)/goal/createGoal",
      params: {
        id: item.id,
        name: item.name,
        targetAmount: item.targetAmount,
        deadline: item.deadline,
      },
    });
  }

  function handleDelete() {
    Alert.alert("Deletar meta", "Tem certeza que deseja excluir essa meta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => deleteGoal(item.id),
      },
    ]);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>Meta de R$ {item.targetAmount}</Text>
          <Text style={{...styles.subtitle, fontSize: 12}}>Prazo: {new Date(item.deadline).toLocaleDateString("pt-BR")}</Text>
        </View>

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
              <Text style={[styles.itemText, styles.destructive]}>Deletar</Text>
              <Ionicons name="trash-outline" size={16} color="#dc2626" />
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
        
      </View>
      <AnimatedProgressBar 
        progress={0.5}
        useGradient
        gradientColors={gradient ?? ["#4dabf7", "#3b5bdb"]}
        trackColor="rgba(255,255,255,0.08)"
        showPercentage
        width={"85%"}
       /> 
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#1A0F2E",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
    gap: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 4,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },

  itemText: {
    fontSize: 15,
    color: "#111",
    fontWeight: "500",
  },

  destructive: {
    color: "#FF4D4D",
  },
});

export default GoalCard;
