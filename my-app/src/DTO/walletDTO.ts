type WalletType = "Dinheiro" | "Investimento" | "Poupança" | "Corrente";

type CreateWalletDTO = {
  name: string;
  type: WalletType;
  balance: number;
};

export default CreateWalletDTO;