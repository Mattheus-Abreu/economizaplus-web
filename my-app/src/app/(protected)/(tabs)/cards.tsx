import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { GestureHandlerRootView} from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import { BlurCarousel } from "@/components/molecules/blur-carousel";
import BancoIcon from "@/components/iconsBank/BankIcons";
import  theme  from "@/app/themes/theme";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { isBancoNome } from "@/utils/banco";
import { getCards } from "@/services/cardService";
//import { linearGradient } from "expo-linear-gradient";

type CardItem = {
  id: string;
  title: string;
  type: string;
  lastDigits: string;
  invoiceAmount?: number | string;
  CardExpiry: string;
  transactions: Array<{
    description: string;
    amount: string;    
    date: string;
  }>;
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
    fundo: '#F9DD16',
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
    fundo: '#333333',
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

const DATA: CardItem[] = [
  {
    id: "1",
    title: "mercadopago",
    type: "Cartão de Crédito",
    lastDigits: "**** 1234",
    CardExpiry: "15/11",
    invoiceAmount: 549.82,
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
    CardExpiry: "15/11",
    invoiceAmount: 149.80,
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
    CardExpiry: "25/11",
    invoiceAmount: 0,
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
  const [cards, setCards] = useState<CardItem[]>(DATA);
  const [currentCard, setCurrentCard] = useState<CardItem | null>(DATA[0]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getBackgroundColor = (title: string) => {
    return dataBackgroundColors[title.toLocaleLowerCase() as keyof typeof dataBackgroundColors]?.fundo || '#ec0192';
  };

  function getBancoNomeSafe(title: string) {
    return isBancoNome(title) ? title : "nubank";
  }

  const formatCurrency = (value?: number | string) => {
    if (value === undefined || value === null || value === "") {
      return "-";
    }

    const numberValue = typeof value === "number"
      ? value
      : Number(String(value).replace(/[^0-9,-]/g, "").replace(",", "."));

    if (Number.isNaN(numberValue)) {
      return "-";
    }

    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const normalizeApiCards = (apiCards: any[]): CardItem[] => {
    return apiCards.map((card) => ({
      id: String(card.id ?? card._id ?? card.last4Digits ?? Math.random()),
      title: card.name ?? card.brand ?? card.title ?? "Cartão",
      type: card.type === "CREDIT" ? "Cartão de Crédito" : card.type === "DEBIT" ? "Cartão de Débito" : card.type ?? "Cartão",
      lastDigits: card.last4Digits ? `**** ${card.last4Digits}` : card.lastDigits ? `**** ${card.lastDigits}` : "**** xxxx",
      invoiceAmount: card.invoiceAmount ?? card.faturaAmount ?? card.currentInvoiceAmount ?? card.limitRemaining ?? 0,
      CardExpiry: card.CardExpiry ?? card.expiryDate ?? card.expirationDate ?? card.validThru ?? card.dueDate ?? "--",
      transactions: card.transactions ?? [],
    }));
  };

  const loadCards = async () => {
    try {
      const apiCards = await getCards();
      const normalizedCards = Array.isArray(apiCards) ? normalizeApiCards(apiCards) : normalizeApiCards([apiCards]);
      setCards(normalizedCards);
      if (normalizedCards.length > 0) {
        setCurrentCard(normalizedCards[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar cartões:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const renderTransactions = () => {
    if (!currentCard || !currentCard.transactions?.length) {
      return (
        <Text style={[styles.transactionDescription, { color: "rgba(255,255,255,0.6)", fontSize: 14 }]}>Nenhuma transação disponível.</Text>
      );
    }

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
    if (cards[index]) {
      setCurrentCard(cards[index]);
    }
  }, [cards]);

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
            <TouchableOpacity onPress={() => router.push("/addCard/newCard")}>
              <FontAwesome name="plus" size={15} color="white" />
            </TouchableOpacity>
          </View>
      </View>

      {isLoading ? (
        <View style={{ height: 240, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <BlurCarousel
          data={cards}
          onSnapToItem={handleSnapToItem}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View
                style={[
                  styles.cardBackground,
                  { backgroundColor: getBackgroundColor(item.title) }
                ]}
              />

              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <BancoIcon bankName={getBancoNomeSafe(item.title)} size={45} />
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.cardLastDigits}>{item.lastDigits}</Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.cardLabel}>Fatura atual</Text>
                <Text style={styles.cardBalance}>{formatCurrency(item.invoiceAmount)}</Text>
              </View>

              <View style={styles.cardMiddle}>
                <View>
                <Text style={styles.cardType}>{item.type}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                </View>

                <View>
                  <Text style={styles.cardType}>Venc:</Text>
                  <Text style={styles.cardExpiry}>{item.CardExpiry}</Text>
                </View>
                
              </View>

            </View>
          )}
        />
      )}
      
      <View style= {styles.actionsContainer}>
        
        <TouchableOpacity style={styles.action}>
          <View style={styles.iconContainer}>
            <FontAwesome name="plus" size={20} color="#FFF" />
          </View>
          <Text style={styles.label}>Regist.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action}>
          <View style={styles.iconContainer}>
            <FontAwesome name="dollar" size={20} color="#FFF" />
          </View>
          <Text style={styles.label}>Pagar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action}>
          <View style={styles.iconContainer}>
            <FontAwesome name="ellipsis-h" size={20} color="#FFF" />
          </View>
          <Text style={styles.label}>Mais</Text>
        </TouchableOpacity>
      </View>

      
      <View style={styles.balanceContainer}>
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
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 10,
    overflow: "hidden",
    padding: 15,
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
    gap: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "400",
    color: "#fff",
  },
  cardType: {
    fontSize: 10,
    fontWeight: "300",
    color: "rgba(255,255,255,0.8)",
  },
  cardBottom: {
    alignItems: "flex-start",
    
  },
  cardLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    
  },
  cardLastDigits: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  balanceContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  transactionsContainer: {
    backgroundColor: "#1A1334",
    borderRadius: 15,
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
    borderBottomColor: "#320f5f",
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
    color: "#ffffff",
  },
  cardBalance: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  cardExpiry: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },

  actionsContainer: {
    height: 84,
    width: "90%",
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',

    backgroundColor: 'rgba(16, 9, 46, 0.95)',
    borderRadius: 10,

    paddingVertical: 5,
    marginHorizontal: 20,
    marginTop: 20,
    

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',

    
    elevation: 8,
    paddingTop: 8,
  },

  action: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 72,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,

    backgroundColor: '#1d1453',
    

    justifyContent: 'center',
    alignItems: 'center',
  },

  label: {
    marginTop: 8,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '400',
  },





});
