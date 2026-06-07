import Category from "@/types/category";
import { ComponentProps } from "react";
import { FontAwesome } from "@expo/vector-icons";

type IconName = ComponentProps<typeof FontAwesome>["name"];

export const DEFAULT_CATEGORIES: Category[]= [
  {
    id: "default-1",
    name: "Luz",
    icon: "lightbulb-o" as IconName,
    color: "#FACC15",
    type: "default",
  },
  {
    id: "default-2",
    name: "Água",
    icon: "tint" as IconName,
    color: "#38BDF8",
    type: "default",
  },
  {
    id: "default-3",
    name: "Internet",
    icon: "wifi" as IconName,
    color: "#A78BFA",
    type: "default",
  },
  {
    id: "default-4",
    name: "Compras",
    icon: "shopping-cart" as IconName,
    color: "#34D399",
    type: "default",
  },
  {
    id: "default-5",
    name: "Transporte",
    icon: "car" as IconName,
    color: "#FB7185",
    type: "default",
  },
  {
    id: "default-6",
    name: "Comida",
    icon: "cutlery" as IconName,
    color: "#F97316",
    type: "default",
  },
  {
    id: "default-7",
    name: "Saúde",
    icon: "heartbeat" as IconName,
    color: "#EF4444",
    type: "default",
  },
];