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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function getWalletTypeLabel(type: string) {
    switch (type) {
      case "CHECKING_ACCOUNT":
        return "Corrente";
      case "SAVINGS_ACCOUNT":
        return "Poupança";
      case "CASH":
        return "Dinheiro";
      case "INVESTMENT":
        return "Investimento";
      default:
        return type;
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
    })
  }

  return (
    <View style={styles.card}>
      
      <View style={styles.header}>
        <View style={styles.left}>
          <Ionicons name="wallet-outline" size={20} color={theme.colors.textSecondary} />

          <View>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.subtitle}>
              {getWalletTypeLabel(item.type)}
            </Text>
          </View>
        </View>

        <Dropdown>
          <Dropdown.Trigger style={styles.trigger}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.text} />
          </Dropdown.Trigger>

          <Dropdown.Content style={styles.menu}>
            <Dropdown.Item onPress={handleEdit}>
              <Text style={styles.itemText}>Editar</Text>
              <Ionicons name="pencil" size={16} color={theme.colors.foreground} />
            </Dropdown.Item>

            <Dropdown.Item onPress={handleDelete}>
              <Text style={[styles.itemText, styles.destructive]}>
                Deletar
              </Text>
              <Ionicons name="trash-outline" size={16} color={theme.colors.destructive} />
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Saldo</Text>
        <Text style={styles.balanceValue}>
          R$ {formatAmount(item.balance.toString())}
        </Text>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {getWalletTypeLabel(item.type)}
        </Text>
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
    borderRadius: 24,
    padding: 20,
    backgroundColor: theme.colors.surface,
    gap: 16,

    shadowColor: theme.colors.foreground,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },

  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  balanceContainer: {
    marginTop: 10,
  },

  balanceLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },

  balanceValue: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 4,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.glass,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },

  badgeText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: "600",
  },

  trigger: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.glass,
    justifyContent: "center",
    alignItems: "center",
  },

  menu: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 6,
  },

  itemText: {
    fontSize: 15,
    color: theme.colors.text,
  },

  destructive: {
    color: theme.colors.destructive,
  },
});

export default CardWallet;