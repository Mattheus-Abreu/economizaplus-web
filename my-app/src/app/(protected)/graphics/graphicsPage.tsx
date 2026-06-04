import Screen from '@/components/Screen';
import { useAppTheme } from '@/hooks/useAppTheme';
import { StyleSheet, Text, View } from 'react-native';

function graphics(){
  const theme = useAppTheme();
  return (
    <Screen>
        <View>
        <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.title}}>graphics</Text>
        </View>
    </Screen>
  );
}

const styles = StyleSheet.create({})

export default graphics;
