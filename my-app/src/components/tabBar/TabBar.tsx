import theme from "@/app/themes/theme";
import tabBarStyle from "@/styles/tabBarStyle";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import {  LayoutChangeEvent, View } from "react-native";
import TabBarButton from "./TabBarButton";
import { use, useState } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  const [dimensions, setDimensions] = useState({ width: 100, height: 20 });
  const routes = state.routes.filter(route => route.name);
  const buttonWidth = dimensions.width / routes.length;
  const onTabbarLayout = (event: LayoutChangeEvent) =>{
    setDimensions({
        height: event.nativeEvent.layout.height,
        width: event.nativeEvent.layout.width
    });
  }
  const tabPositionX = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{translateX: tabPositionX.value}]
      }
  })


  return (
    <View onLayout={onTabbarLayout} style={tabBarStyle.tabbar}>
      <Animated.View style={[animatedStyle,{
        position: "absolute",
        backgroundColor: "rgba(124,58,237,0.15)",
        borderWidth: 1,
        borderColor: "rgba(124,58,237,0.3)",
        borderRadius: 40,
        marginHorizontal: 12,
        height: dimensions.height - 17,
        width: buttonWidth - 23
      }]}/>
      {routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.routes[state.index].name === route.name;

        const onPress = () => {
          if (!buttonWidth) return;
          tabPositionX.value = withSpring(buttonWidth * index, { damping: 30, stiffness: 130 });
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            label={label}
            color={isFocused ? theme.colors.text : theme.colors.textSecondary}
          />
        );
      })}
    </View>
  );
}

export default TabBar;
