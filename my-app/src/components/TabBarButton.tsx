import { Pressable, Text } from 'react-native'
import tabBarStyle from '@/styles/tabBarStyle'
import theme from '@/app/themes/theme'
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { JSX, ReactNode, useEffect } from 'react'
import { GestureResponderEvent } from "react-native";
import { FontAwesome } from '@expo/vector-icons'


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
        "home": (props) => <FontAwesome name="home" size={24} {...props} />,
        "cards": (props) => <FontAwesome name="credit-card" size={24} {...props} />,
        "grafics": (props) => <FontAwesome name="bar-chart" size={24} {...props} />,
        "profile": (props) => <FontAwesome name="user" size={24} {...props} />,
    }
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
            style={tabBarStyle.tabbarItem}
            >
            <Animated.View style={animatedIconStyle}>
                {icon[routeName]?.({ color: isFocused ? theme.colors.background : theme.colors.gray })}
            </Animated.View>
            
            <Animated.Text
                style={[
                    { color: isFocused ? theme.colors.background : theme.colors.gray },
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