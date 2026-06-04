import { Redirect } from "expo-router";

// TEMP: pular login para visualizar tela de profile
function Index() {
  return <Redirect href={"/(protected)/(tabs)/profile"} />;
}

export default Index;