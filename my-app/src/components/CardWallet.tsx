import Dropdown from "@/components/dropdown";
import { useWallets } from "@/contexts/walletContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import Wallet from "@/types/wallet";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AppModal, { MODAL_HIDDEN, ModalConfig } from "./modal/modal";

type Props = {
  item: Wallet;
};

function CardWallet({ item }: Props) {
  const router = useRouter();
  const { deleteWallet } = useWallets();
  const [modal, setModal] = useState<ModalConfig>(MODAL_HIDDEN);

  const theme = useAppTheme();
  const styles = createStyles(theme);

  function formatAmount(value: string): string {
    const num = parseFloat(value);

    if (isNaN(num)) return "–";

    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function getWalletTypeLabel(type: string) {
    switch (type) {
      case "CHECKING_ACCOUNT":
        return "Conta Corrente";
      case "SAVINGS_ACCOUNT":
        return "Poupança";
      case "CASH":
        return "Dinheiro";
      case "INVESTMENT":
        return "Investimento";
      case "GOAL":
        return "Caixinha";
      default:
        return type;
    }
  }

  function getWalletColor(type: string) {
    switch (type) {
      case "CHECKING_ACCOUNT":
        return "#3B82F6";
      case "SAVINGS_ACCOUNT":
        return "#22C55E";
      case "CASH":
        return "#EC4899";
      case "INVESTMENT":
        return "#8B5CF6";
      case "GOAL":
        return "#F59E0B";
      default:
        return theme.colors.primary;
    }
  }

  function handleEdit() {
    router.push({
      pathname: "/(protected)/wallet/createWallet",
      params: {
        id: item.id,
        name: item.name,
        type: item.type,
        balance: item.balance.toString(),
      },
    });
  }

  function handleDelete() {
    setModal({
      visible: true,
      variant: "warning",
      title: "Excluir carteira",
      description: "Tem certeza que deseja excluir essa carteira?",
      buttons: [
        {
          label: "Cancelar",
          onPress: () => setModal(MODAL_HIDDEN),
          variant: "secondary",
        },
        {
          label: "Excluir",
          onPress: async () => {
            await deleteWallet(item.id);
            setModal(MODAL_HIDDEN);
          },
          variant: "danger",
        },
      ],
    });
  }

  const walletColor = getWalletColor(item.type);

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.typeIndicator,
          { backgroundColor: walletColor },
        ]}
      />

      <View style={styles.container}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: walletColor + "20" },
          ]}
        >
          <Ionicons
            name="wallet-outline"
            size={20}
            color={walletColor}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.name}</Text>

          <Text style={styles.subtitle}>
            {getWalletTypeLabel(item.type)}
          </Text>
        </View>

        <View style={styles.right}>
          <Dropdown>
            <Dropdown.Trigger style={styles.trigger}>
              <Ionicons
                name="ellipsis-horizontal"
                size={18}
                color={theme.colors.text}
              />
            </Dropdown.Trigger>

            <Dropdown.Content style={styles.menu}>
              <Dropdown.Item onPress={handleEdit}>
                <Text style={styles.itemText}>Editar</Text>

                <Ionicons
                  name="pencil"
                  size={16}
                  color={theme.colors.foreground}
                />
              </Dropdown.Item>

              <Dropdown.Item onPress={handleDelete}>
                <Text
                  style={[
                    styles.itemText,
                    styles.destructive,
                  ]}
                >
                  Deletar
                </Text>

                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={theme.colors.destructive}
                />
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown>

          <Text style={styles.balance}>
            {formatAmount(item.balance.toString())}
          </Text>
        </View>
      </View>

      <AppModal
        visible={modal.visible}
        onClose={() => setModal(MODAL_HIDDEN)}
        variant={modal.variant}
        title={modal.title}
        description={modal.description}
        buttons={modal.buttons}
      />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      borderRadius: 20,
      padding: 18,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.glass,
      overflow: "hidden",
    },

    typeIndicator: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
    },

    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },

    content: {
      flex: 1,
      gap: 2,
    },

    title: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },

    subtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },

    right: {
      alignItems: "flex-end",
      gap: 6,
    },

    balance: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.text,
    },

    trigger: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: theme.colors.glass,
      justifyContent: "center",
      alignItems: "center",
    },

    menu: {
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      paddingVertical: 6,
    },

    itemText: {
      fontSize: 15,
      color: theme.colors.foreground,
      fontWeight: "500",
    },

    destructive: {
      color: theme.colors.destructive,
    },
  });

export default CardWallet;