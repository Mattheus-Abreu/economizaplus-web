import theme from "@/app/themes/theme";
import { GRADIENTS } from "@/components/CardHome";
import GoalCard from "@/components/GoalCard";
import Screen from "@/components/Screen";
import { useGoals } from "@/contexts/goalContext";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import {
  Empty,
  EmptyButton,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/empty-state";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Arrow from "@/assets/images/Arrow.svg";
import FloatingButton from "@/components/FloatingButton";

function cards() {
  const router = useRouter();

  return (
    <Screen style={{ padding: 20 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, gap: 20 }}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <FontAwesome
                  name="arrow-left"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

              <SafeAreaView style={styles.container}>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia
                      variant="icon"
                      style={{ backgroundColor: theme.colors.surface }}
                    >
                      <SymbolView name="creditcard.fill" size={60} tintColor={"#fff"} />
                    </EmptyMedia>
                    <EmptyTitle>Nenhum cartão</EmptyTitle>
                    <View style={{
                          position: "absolute",
                          bottom: -160,
                          right: -80,
                          gap: 15,
                          alignItems: "center"
                        }}>
                      <EmptyDescription>
                        Que tal começar criando um cartão
                      </EmptyDescription>
                      <Arrow width={100} height={60} style={{ transform: [{ rotate: "20deg" }] }} />
                    </View>
                  </EmptyHeader>
                </Empty>
              </SafeAreaView>

           
          </View>

        </View>
      </ScrollView>
      <FloatingButton 
        style={{ position: "absolute", bottom: 120, right: 20, padding: 25}}
        onPress={() => router.push("/goal/createGoal")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 56,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
})

export default cards;
