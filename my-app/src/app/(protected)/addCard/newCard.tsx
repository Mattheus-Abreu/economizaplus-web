import Input from "@/components/inputs/Input";
import { useAppTheme } from "@/hooks/useAppTheme";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function newCard() {
    const router = useRouter();
    const theme = useAppTheme();
    const styles = createStyles(theme);

    const dataCard = useLocalSearchParams<{
      id?: string;
      nameBank?: string;
      brandBank?: string;
      typeCard?:string;
      lastDigits?: string;
      limitTotal?: string;
      closingDay?: string;
      dueDay?: string;
    }>();

    const [nameBank, setNameBank] = useState(dataCard.nameBank || "");
    const [brandBank, setBrandBank] = useState(dataCard.brandBank || "");
    const [typeCard, setTypeCard] = useState(dataCard.typeCard || "");
    const [lastDigits, setLastDigits] = useState(dataCard.lastDigits || "");
    const [limitTotal, setLimitTotal] = useState(dataCard.limitTotal || "");
    const [closingDay, setClosingDay] = useState(dataCard.closingDay || "");
    const [dueDay, setDueDay] = useState(dataCard.dueDay || "");

    const [isLoading, setIsLoading] = useState(false);

    const validateInputs = (): boolean =>{
      if(!nameBank.trim()){
        Alert.alert("Erro", "Por favor, informe o nome do banco.");
        return false;
      }
      if (!brandBank.trim()) {
      Alert.alert("Erro", "Por favor, informe a bandeira do cartão");
      return false;
    }
    if (!lastDigits.trim() || lastDigits.length !== 4 || isNaN(Number(lastDigits))) {
      Alert.alert("Erro", "Os últimos 4 dígitos devem ter exatamente 4 números");
      return false;
    }
    if (!typeCard.trim()) {
      Alert.alert("Erro", "Por favor, informe o tipo do cartão");
      return false;
    }
    if (!limitTotal.trim() || isNaN(Number(limitTotal))) {
      Alert.alert("Erro", "O limite deve ser um número válido");
      return false;
    }
    if (!closingDay.trim()) {
      Alert.alert("Erro", "Por favor, informe a data de fechamento");
      return false;
    }
    if (!dueDay.trim()) {
      Alert.alert("Erro", "Por favor, informe a data de vencimento");
      return false;
    }
    return true;

    }

    async function saveCard() {
      // Aqui você pode adicionar a lógica para salvar os dados do cartão
      // Por exemplo, enviar os dados para uma API ou armazená-los localmente
      if (!validateInputs()) return;

      setIsLoading(true);
      
      try {
        const cardData ={
          nameBank: nameBank.trim(),
          brandBank: brandBank.trim(),
          typeCard: typeCard.trim(),
          lastDigits: lastDigits.trim(),
          limitTotal: parseFloat(limitTotal),
          closingDay: closingDay.trim(),
          dueDay: dueDay.trim(),
          //userId: "ID do usuário logado"
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),


        }
          const existingCards = await AsyncStorage.getItem('userCards');
          const cardsArray = existingCards ? JSON.parse(existingCards) : [];
    
          const cardsExists = cardsArray.some((card: any) => 
            card.lastDigits === cardData.lastDigits);
    
          if (cardsExists && !dataCard.id) {
            Alert.alert("Erro","Já existe um cartão cadastrado com os mesmos últimos 4 digitos!")
            return;
        }

        await AsyncStorage.setItem('userCards', JSON.stringify([...cardsArray, cardData]));

        Alert.alert(
        "Sucesso", 
        dataCard.id ? "Cartão atualizado com sucesso!" : "Cartão adicionado com sucesso!",
        [{ text: "OK", onPress: () => router.back() }]
      );



      } catch (error) {
        console.error("Erro ao salvar o cartão:", error);
        Alert.alert("Erro", "Ocorreu um erro ao salvar o cartão. Tente novamente.");
      }finally{
        setIsLoading(false);
      }
    }
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
            <View style={styles.header}>
                  <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <FontAwesome
                      name="chevron-left"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>Novo Cartão</Text>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View >
              <View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Nome do banco</Text>
                  <View style={[styles.fieldInput, nameBank.length > 0 && styles.fieldInputActive]}>
                    <Ionicons name="card-outline" size={20} color={theme.colors.textSecondary} />
                    <Input
                      style={styles.inlineInput}
                      placeholder="Digite o nome do banco"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={nameBank}
                      onChangeText={setNameBank}
                    />
                  </View>
                </View>
              </View>

              <View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Bandeira do banco</Text>
                  <View style={[styles.fieldInput, brandBank.length > 0 && styles.fieldInputActive]}>
                  <Ionicons name="logo-paypal" size={20} color={theme.colors.textSecondary} />
                    
                    <Input
                      style={styles.inlineInput}
                      placeholder="Digite a bandeira do banco"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={brandBank}
                      onChangeText={setBrandBank}
                    />
                  </View>
                </View>
              </View>

              <View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Ultimos 4 dígitos</Text>
                  <View style={[styles.fieldInput, lastDigits.length > 0 && styles.fieldInputActive]}>
                  <Ionicons name="card" size={20} color={theme.colors.textSecondary} />
                    
                    <Input
                      style={styles.inlineInput}
                      placeholder="Digite os ultimos 4 dígitos"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={lastDigits}
                      onChangeText={(text) => setLastDigits(text.replace(/\D/g, '').slice(0, 4))}
                      keyboardType="numeric"
                      maxLength={4}
                    />
                  </View>
                </View>
              </View>

              <View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Tipo do cartão</Text>
                  <View style={[styles.fieldInput, typeCard.length > 0 && styles.fieldInputActive]}>
                  <Ionicons name="card-outline" size={20} color={theme.colors.textSecondary} />
                    
                    <Input
                      style={styles.inlineInput}
                      placeholder="Ex: Crédito ou Débito"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={typeCard}
                      onChangeText={setTypeCard}
                    />
                  </View>
                </View>
              </View>

              <View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Qual o limite do cartão</Text>
                  <View style={[styles.fieldInput, limitTotal.length > 0 && styles.fieldInputActive]}>
                  <Ionicons name="cash" size={20} color={theme.colors.textSecondary} />
                    
                    <Input
                      style={styles.inlineInput}
                      placeholder="Digite o limite do seu cartão"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={limitTotal}
                      onChangeText={(text) => setLimitTotal(text.replace(/[^0-9,]/g, ''))}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              <View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Data de fechamento</Text>
                  <View style={[styles.fieldInput, closingDay.length > 0 && styles.fieldInputActive]}>
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
                    
                    <Input
                      style={styles.inlineInput}
                      placeholder="Digite a data de fechamento"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={closingDay}
                      onChangeText={(text) => setClosingDay(text.replace(/\D/g, '').slice(0, 2))}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                </View>
              </View>

              <View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Data de vencimento</Text>
                  <View style={[styles.fieldInput, dueDay.length > 0 && styles.fieldInputActive]}>
                  <Ionicons name="calendar" size={20} color={theme.colors.textSecondary} />
                    
                    <Input
                      style={styles.inlineInput}
                      placeholder="Digite a data de vencimento da fatura"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={dueDay}
                      onChangeText={(text) => setDueDay(text.replace(/\D/g, '').slice(0, 2))}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                </View>
              </View>
              


            </View>
            </ScrollView>
            
              <View style={styles.save}>
                <Pressable
                  style={({ pressed }) => [
                    styles.submitBtn,
                    pressed && styles.submitBtnPressed,
                    isLoading && styles.submitBtnLoading,
                  ]}
                  onPress={saveCard}
                  disabled={isLoading}
                >
                  {isLoading? (<Ionicons name="hourglass" size={20} color="#fff" />) : 
                  (<>
                      <Text style={styles.submitText}>
                        {dataCard.id ? "Atualizar cartão" : "Adicionar novo cartão"}
                      </Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </>
                  )}
                </Pressable>
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
  header:{
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backBtn:{
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  form:{
    paddingHorizontal: 24,
    gap:28

  },
  field:{
    gap: 6
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingLeft: 5,
  },
  fieldInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 16,
  },
  fieldInputActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(124,58,237,0.06)",
  },
  inlineInput: {
    flex: 1,
    height: 54,
    borderWidth: 0,
    borderRadius: 0,
    paddingLeft: 0,
    color: theme.colors.text,
    fontSize: 12,
  },
  save:{
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  submitBtn: {
    width: "100%",
    height: 54,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  submitBtnLoading: {
    backgroundColor: theme.colors.primary + '80',
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
  },
});
