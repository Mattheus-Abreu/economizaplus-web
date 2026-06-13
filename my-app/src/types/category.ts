import { FontAwesome } from "@expo/vector-icons";
import { ComponentProps } from "react";

type IconName = ComponentProps<typeof FontAwesome>["name"];

type Category = {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  type?: "default" | "custom";
};

export default Category;
