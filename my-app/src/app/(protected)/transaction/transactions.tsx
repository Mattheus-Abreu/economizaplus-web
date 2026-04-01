import Button from '@/components/Button';
import Input from '@/components/inputs/Input';
import Screen from '@/components/Screen';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router'
import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'

function transactionPage() {
  const router = useRouter();
  
  function redirectPage() {
    return router.replace("/home");
  }
  return (
    <Screen>
    <View style={styles.container}>
      <TouchableOpacity onPress={redirectPage}>
        <FontAwesome name="arrow-left" size={24} color="white" />
      </TouchableOpacity>
        <Text style={styles.text}>Crie uma nova transação</Text>
        <Input placeholder="Nome" />
        <Input placeholder="Quanto você quer juntar?" />
        <Input placeholder="Prazo" />
        <Button label="Criar meta" onPress={redirectPage}></Button>
    </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    gap: 20
  },
  text:{
    fontSize: 32,
    fontWeight: 900,
    color: "#fff"
  },
  link:{
    fontSize: 24,
    fontWeight: 900,
    color: "#fff",
    fontStyle: "italic",
    alignContent: "flex-end"
  }
});

export default transactionPage