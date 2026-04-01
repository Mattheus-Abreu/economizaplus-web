import checkboxStyle from "@/styles/checkboxStyle";
import { FontAwesome } from "@expo/vector-icons";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

type Option = {
  label: string;
  value: string;
};

type CheckBoxProps = {
  options: Option[];
  checkedValues: string[];
  onChange: (value: string[]) => void;
  style?: any;
};

function Checkbox({ options, checkedValues, onChange, style }: CheckBoxProps) {
  let updateCheckedValues = [...checkedValues];
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}
    >
      <View style={[checkboxStyle.container, style]}>
        {options.map((option) => {
          const isChecked = updateCheckedValues.includes(option.value);
          return (
            <TouchableOpacity
              style={checkboxStyle.checkBox}
              key={option.value}
              activeOpacity={0.9}
              onPress={() => {
                if (isChecked) {
                  updateCheckedValues = updateCheckedValues.filter(
                    (checkedValues) => checkedValues !== option.value,
                  );
                  return onChange(updateCheckedValues);
                }
                updateCheckedValues.push(option.value);
                onChange(updateCheckedValues);
              }}
            >
              <FontAwesome
                name={isChecked ? "check-circle" : "circle-o"}
                size={24}
                color={isChecked ? "#55595f" : "#f3f4f6"}
              />
              <Text style={checkboxStyle.text}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

export default Checkbox;
