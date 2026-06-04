import { useAppTheme } from '@/hooks/useAppTheme';
import { createTabBarStyle } from "@/styles/tabBarStyle";
import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { JSX, ReactNode, useEffect } from 'react';
import { GestureResponderEvent, Pressable, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';


type Props = {
    color: string,
    label: string | ((props: any) => ReactNode),
    isFocused: boolean,
    onPress: (event: GestureResponderEvent) => void,
    onLongPress: (event: GestureResponderEvent) => void,
    routeName: string
}
const TabBarButton = ({ color, label, isFocused, onPress, onLongPress, routeName }: Props) => {
    const icon: Record<string, (props: {color: string}) => JSX.Element> = {
        "index": (props) => <FontAwesome name="home" size={24} {...props} />,
        "cards": (props) => <FontAwesome name="credit-card" size={24} {...props} />,
        "wallet": (props) => <FontAwesome6 name="wallet" size={24} {...props} />,
        "profile": (props) => <FontAwesome name="user" size={24} {...props} />,
    }
    const theme = useAppTheme();
    const styles = createTabBarStyle(theme);
    const scale = useSharedValue(0);
    useEffect(() => {
        scale.value = withSpring(typeof isFocused === 'boolean' ? (isFocused ? 1 : 0) : isFocused, { duration: 200 });
    }, [scale, isFocused]);

    const animatedIconStyle = useAnimatedStyle(() => {
        const scaleValue = interpolate(scale.value, [0, 1], [1, 1.3]);
        const top = interpolate(scale.value, [0, 1], [0, 8]);

        return {
            transform: [
                { scale: scaleValue },
                { translateY: top }
            ]
        };
    })
    const animatedTextStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scale.value, [0,1], [1,0]);

        return {
            opacity,
        };
    });
    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={createTabBarStyle(theme).tabbarItem}
            >
            <Animated.View style={animatedIconStyle}>
                <View style={{ backgroundColor: isFocused ? "rgba(150, 96, 243, 0.05)" : "transparent", borderRadius: 10 }}>
                    {icon[routeName]?.({ color: isFocused ? theme.colors.primary : theme.colors.textSecondary })}
                </View>
            </Animated.View>
            
            <Animated.Text
                style={[
                    { color: isFocused ? "#A78BFA" : theme.colors.textSecondary },
                    animatedTextStyle
                ]}
                >
                {typeof label === "function"
                    ? label({ focused: isFocused, color, position: "below-icon", children: routeName })
                    : label}
            </Animated.Text>
        </Pressable>
  )
}

export default TabBarButton