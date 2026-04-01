import Button from '@/components/Button';
import Input from '@/components/inputs/Input';
import Screen from '@/components/Screen';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router'
import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'

function goalPage() {
  const router = useRouter();
  
  function redirectPage() {
    return router.replace("/home");
  }
  return (
    <Screen>
      <View style={styles.container}>
        
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

export default goalPage