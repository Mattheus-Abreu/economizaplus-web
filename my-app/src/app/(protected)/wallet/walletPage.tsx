import {
  Empty,
  EmptyButton,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/empty-state";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import theme from "@/app/themes/theme";
import Button from "@/components/Button";
import Screen from "@/components/Screen";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTransactions } from "@/contexts/transactionContext";
import { ScrollView } from "react-native-gesture-handler";
import Arrow from "@/assets/images/Arrow.svg";
import { useWallets } from "@/contexts/walletContext";

function walletPage() {
  const router = useRouter();
  const { wallets } = useWallets();
  
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

            {wallets.length === 0 ? (
              <SafeAreaView style={styles.container}>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia
                    variant="icon"
                    style={{
                      backgroundColor: theme.colors.surface
                    }}
                  >
                  <SymbolView name="gift.fill" size={60} tintColor={"#fff"} />
                  </EmptyMedia>
                  <EmptyTitle>Nenhuma caixinha</EmptyTitle>
                  <View style={{
                      position: "absolute",
                      bottom: -240,
                      right: -70,
                      gap: 15,
                      alignItems: "center"
                    }}>
                  <EmptyDescription>
                    Que tal começar criando uma caixinha
                  </EmptyDescription>
                  <Arrow width={100} height={60} style={{ transform: [{ rotate: "20deg" }] }} />
                </View>
                </EmptyHeader>
              </Empty>
            </SafeAreaView>
            ) : (
              <View>
                {wallets.map((index, item) => (
                  <View>
                    <Text>{item}</Text>
                  </View>
                ))}
              </View>
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
            <TouchableOpacity onPress={() => router.push("/(protected)/wallet/createWallet")}>
              <FontAwesome name="plus" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

export default walletPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    alignItems: "center",
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
});
