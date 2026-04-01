import theme from "@/app/themes/theme";
import Button from "@/components/Button"
import Screen from "@/components/Screen";
import useAuth from "@/hooks/useAuth";
import { api } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native"

function IAScreen() {
  const router = useRouter();
  const { goals } = useLocalSearchParams();
  const { token } = useAuth();
  type Tip = {
    title: string;
    description: string;
  };

  type Section = {
    title: string;
    tips: Tip[];
  };

  type AIResponse = {
    sections: Section[];
    finalTip: string;
  };

  const [content, setContent] = useState<AIResponse | null>(null);

  const parsedGoals = goals ? JSON.parse(goals as string) : [];

  useEffect(() => {
    async function load() {
      if(!token){
        console.log("esperando token");
        return;
      }
      
      const result = await api.post("/api/ai/tips", 
        {
          goals: parsedGoals
        },
        {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      console.log(token);

      try {
        const data = JSON.parse(result.data);
        setContent(data);
      } catch (error) {
        console.log("erro ao parsear:", result.data);
      }
    }

    load();
  }, [token]);

  function redirectPage() {
    return router.replace("/goal/createGoal");
  }

  return (
    <Screen>
      <ScrollView>
        {content && content.sections.map((section: Section) => (
          <View key={section.title} style={styles.container}>
            <Text style={styles.title}>{section.title}</Text>

            {section.tips.map((tip: Tip) => (
              <View key={tip.title}>
                <Text style={styles.subtitle}>{tip.title}</Text>
                <Text style={styles.text}>{tip.description}</Text>
              </View>
            ))}
          </View>
        ))}
        <Text style={styles.text}>
          Que tal começar? Crie uma meta.
      </Text>
      <Button label="Criar meta" onPress={redirectPage} />
      </ScrollView>

      
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: 900,
    color: theme.colors.text,
    marginTop: 40,
  },
  subtitle: {
    fontSize: theme.fontSize.subtitle,
    fontWeight: 800,
    color: theme.colors.text
  },
  text:{
    fontSize: theme.fontSize.text,
    fontWeight: 400,
    color: theme.colors.text
  }
});

export default IAScreen