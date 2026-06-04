import { BlurCarousel } from "@/components/molecules/blur-carousel";
import { useAppTheme } from "@/hooks/useAppTheme";
import BancoIcon from "@/services/apiBanco";
import { isBancoNome } from "@/utils/banco";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type CardItem = {
  id: string;
  title: string;
  type: string;
  lastDigits: string;
  transactions: Array<{
    description: string;
    amount: string;    
    date: string;
  }>
};

const dataBackgroundColors = {
  nubank: {
    fundo: '#820AD1',
  },
  cora: {
    fundo: '#FE3E6D',
  },
  itau: {
    fundo: '#EC7000',
  },
  inter: {
    fundo: '#FF7A00',
  },
  bancodobrasil: {
    fundo: '#003D7A',
  },
  bradesco: {
    fundo: '#CC092F',
  },
  santander: {
    fundo: '#EC0000',
  },
  caixa: {
    fundo: '#0066A1',
  },
  btg: {
    fundo: '#001E62',
  },
  xp: {
    fundo: '#ffffff',
  },
  infinitepay: {
    fundo: '#171527',
  },
  picpay: {
    fundo: '#21C25E',
  },
  mercadopago: {
    fundo: '#00BCFF',
  },
  pagbank: {
    fundo: '#42A936',
  },
  c6: {
    fundo: '#121212',
  },
  digio: {
    fundo: '#00275C',
  },
  sicoob: {
    fundo: '#003B43',
  },
  neon: {
    fundo: '#161C3E',
  },
  pan: {
    fundo: '#FFFFFF',
  },
  safra: {
    fundo: '#151D43',
  },
  wise: {
    fundo: '#9FE870',
  },
  paypal: {
    fundo: '#ffffff',
  },
  stripe: {
    fundo: '#635BFF',
  },
  stone: {
    fundo: '#ffffff',
  },
  next: {
    fundo: '#00FF5F',
  },
  original: {
    fundo: '#00A857',
  },
  sicredi: {
    fundo: '#ffffff',
  }
};

const DATA = [
  {
    id: "1",
    title: "mercadopago",
    type: "Cartão de Crédito",
    lastDigits: "**** 1234",
    transactions: [
      { description: "Netflix", amount: "-R$ 49,90", date: "15/11" },
      { description: "Uber", amount: "-R$ 23,50", date: "14/11" },
      { description: "McDonald's", amount: "-R$ 42,80", date: "13/11" },
      { description: "Supermercado", amount: "-R$ 156,30", date: "12/11" },
    ],
  },
  {
    id: "2",
    title: "nubank",
    type: "Cartão de Crédito",
    lastDigits: "**** 5678",
    transactions: [
      { description: "Amazon", amount: "-R$ 99,90", date: "15/11" },
      { description: "Steam", amount: "-R$ 49,90", date: "14/11" },
    ],
  },
  {
    id: "3",
    title: "bradesco",
    type: "Cartão de Débito",
    lastDigits: "**** 9012",
    transactions: [
      { description: "Padaria", amount: "-R$ 15,20", date: "15/11" },
      { description: "Farmácia", amount: "-R$ 32,50", date: "14/11" },
      { description: "Posto de Gasolina", amount: "-R$ 120,00", date: "13/11" },
      { description: "Supermercado", amount: "-R$ 156,30", date: "12/11" },
      { description: "Padaria", amount: "-R$ 15,20", date: "15/11" },
      { description: "Farmácia", amount: "-R$ 32,50", date: "14/11" },
      { description: "Posto de Gasolina", amount: "-R$ 120,00", date: "13/11" },
      { description: "Padaria", amount: "-R$ 15,20", date: "15/11" },
      { description: "Farmácia", amount: "-R$ 32,50", date: "14/11" },
      { description: "Posto de Gasolina", amount: "-R$ 120,00", date: "13/11" },
      

    ]
  },
];

export default function App() {
  const [currentCard, setCurrentCard] = useState<CardItem>(DATA[0]);
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const getBackgroundColor = (title: string) => {
    return dataBackgroundColors[title.toLocaleLowerCase() as keyof typeof dataBackgroundColors]?.fundo || '#ec0192';
  };

  function getBancoNomeSafe(title: string) {
    return isBancoNome(title) ? title : "nubank";
  }

  const renderTransactions = () => {
    return currentCard.transactions.map((transaction, index) => (
      <View key={index} style={styles.transactionRow}>
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionDescription}>{transaction.description}</Text>
          <Text style={styles.transactionDate}>{transaction.date}</Text>
        </View>
        <Text style={styles.transactionAmount}>{transaction.amount}</Text>
      </View>
    ));
  };

  const handleSnapToItem = useCallback((index: number) => {
    setCurrentCard(DATA[index]);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>Cartões</Text>

                  <View
            style={{
              position: "absolute",
              bottom: 15,
              right: 30,
              padding: 12,
              backgroundColor: theme.colors.primary,
              borderRadius: 12,
            }}
          >
            <TouchableOpacity onPress={() => router.push("/")}>
              <FontAwesome name="plus" size={15} color="white" />
            </TouchableOpacity>
          </View>
      </View>

      <BlurCarousel
        data={DATA}
        onSnapToItem={handleSnapToItem}  
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View
              style={[
                styles.cardBackground,
                { backgroundColor: getBackgroundColor(item.title) }
              ]}
            />
          
            <View style={styles.cardTop}>
              <View style={styles.cardIcon}>
                <BancoIcon nome={getBancoNomeSafe(item.title)} formato="sem" tamanho={60} />
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.cardLastDigits}>{item.lastDigits}</Text>
              </View>
            </View>

            <View style={styles.cardMiddle}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardType}>{item.type}</Text>
            </View>
          </View>
        )}
      />
      
      <View style={styles.transactionsContainer}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>Últimas transações</Text>
        </View>
        
        <ScrollView 
          style={styles.transactionsScroll}
          showsVerticalScrollIndicator={false}
        >
          {renderTransactions()}
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
 StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#100420",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
  },
  card: {
    width: "100%",
    height: 200,
    borderRadius: 28,
    overflow: "hidden",
    padding: 24,
    justifyContent: "space-between",
  },
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardMiddle: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 27,
    fontWeight: "800",
    color: "#fff",
  },
  cardType: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
  },
  cardBottom: {
    alignItems: "flex-end",
  },
  cardLastDigits: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  transactionsHeader: {
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  transactionsScroll: {
    flex: 1,
    marginBottom: 105,
    
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#26074e",
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF6B6B",
  },
});
