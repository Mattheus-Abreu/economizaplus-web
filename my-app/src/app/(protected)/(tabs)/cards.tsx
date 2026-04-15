import theme from "@/app/themes/theme";
import Arrow from "@/assets/images/Arrow.svg";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/empty-state";
import FloatingButton from "@/components/FloatingButton";
import Screen from "@/components/Screen";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

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
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.back()}
              >
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
                    {Platform.OS === "ios" ? (
                      <SymbolView
                        name="creditcard.fill"
                        size={60}
                        tintColor="#fff"
                      />
                    ) : (
                      <Ionicons name="card" size={60} color="#fff" />
                    )}
                  </EmptyMedia>
                  <EmptyTitle>Nenhum cartão</EmptyTitle>
                  <View
                    style={{
                      position: "absolute",
                      bottom: -220,
                      left: 0,
                      gap: 15,
                      alignItems: "center",
                    }}
                  >
                    <EmptyDescription>
                      Que tal começar criando um cartão
                    </EmptyDescription>
                    <Arrow
                      width={100}
                      height={60}
                      style={{ transform: [{ rotate: "20deg" }] }}
                    />
                  </View>
                </EmptyHeader>
              </Empty>
            </SafeAreaView>
          </View>
        </View>
      </ScrollView>
      <FloatingButton
        style={{
          position: "absolute",
          bottom: 110,
          right: 20,
          padding: 25,
        }}
        onPress={() => router.push("/")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {},
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default cards;
