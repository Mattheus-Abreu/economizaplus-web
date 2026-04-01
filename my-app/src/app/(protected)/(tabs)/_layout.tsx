import TabBar from '@/components/TabBar'
import { Tabs } from 'expo-router'

function TabLayout() {
  return (
    <Tabs tabBar={props => <TabBar {...props}/>} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="grafics" options={{ title: "Grafics" }} />
      <Tabs.Screen name="cards" options={{ title: "Cards" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  )
}

export default TabLayout