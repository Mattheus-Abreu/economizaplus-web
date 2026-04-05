import TabBar from '@/components/tabBar/TabBar'
import { Tabs } from 'expo-router'

function TabLayout() {
  return (
    <Tabs tabBar={props => <TabBar {...props}/>} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="grafics" options={{ title: "Gráficos" }} />
      <Tabs.Screen name="cards" options={{ title: "Cartões" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  )
}

export default TabLayout;