import TabBar from '@/components/tabBar/TabBar'
import { Tabs } from 'expo-router'

function TabLayout() {
  return (
    <Tabs tabBar={props => <TabBar {...props}/>} screenOptions={{ headerShown: false }} initialRouteName="profile">
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="grafics" options={{ title: "Gráficos" }} />
      <Tabs.Screen name="cards" options={{ title: "Cartões" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  )
}

export default TabLayout;