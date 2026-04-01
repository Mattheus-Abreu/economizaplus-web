import Screen from "@/components/Screen";
import useAuth from "@/hooks/useAuth";
import { FontAwesome } from "@expo/vector-icons";
import { Stack } from "expo-router";
import {
  Alert,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import homeStyle from "../../../styles/homeStyle";

function Home() {
  const { signOut } = useAuth();

  function handleLogout() {
    Alert.alert("Sair", "tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: signOut },
    ]);
  }

  return (
    <Screen>
      <View style={homeStyle.container}>
        <Text style={homeStyle.title}>Home</Text>
        <TouchableOpacity onPress={handleLogout}>
          <FontAwesome name="sign-out" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </Screen>
  );
}

export default Home;
