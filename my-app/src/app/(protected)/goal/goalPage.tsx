import theme from "@/app/themes/theme";
import { GRADIENTS } from "@/components/CardHome";
import GoalCard from "@/components/GoalCard";
import Screen from "@/components/Screen";
import { useGoals } from "@/contexts/goalContext";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

function goalPage() {
  const router = useRouter();
  const { goals } = useGoals();

  return (
    <Screen style={{ padding: 20 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1 }}>
          <View style={{ marginTop: 40, gap: 20 }}>
            <Text
              style={{
                fontSize: theme.fontSize.title,
                fontWeight: 900,
                color: theme.colors.text,
                textAlign: "center",
                margin: 20,
              }}
            >
              Minhas Metas
            </Text>

            {goals.length === 0 ? (
              <Text style={{ color: theme.colors.text }}>
                Nenhuma meta criada ainda
              </Text>
            ) : (
              goals.map((item, index) => (
                <GoalCard
                  key={item.id}
                  item={item}
                  gradient={GRADIENTS[index % GRADIENTS.length]}
                />
              ))
            )}
          </View>

          <View
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              padding: 25,
              backgroundColor: theme.colors.primary,
              borderRadius: 80,
            }}
          >
            <TouchableOpacity onPress={() => router.push("/goal/createGoal")}>
              <FontAwesome name="plus" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

export default goalPage;
