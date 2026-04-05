import theme from '@/app/themes/theme';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  name: keyof typeof FontAwesome.glyphMap;
  label: string;
  color: string;
};

const Icons = ({ name, label, color }: Props) => {
  return (
    <View
      style={{
        padding: 10,
        gap: 5, 
        width: 80,
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: theme.colors.glass,
        borderRadius: 25,
      }}
    >
      <FontAwesome name={name} size={30} color={color} />

      <Text
        style={{
          color: theme.colors.text,
          fontSize: 10,
          fontWeight: "400",
          marginTop: 5,
        }}
      >
        {label}
      </Text>
    </View>
  );
};

export default Icons;