type WalletType = "Dinheiro" | "Poupança" | "Investimento" | "Corrente";

type Wallet = {
    id: string;
    name: string;
    type: WalletType;
    balance: number;
}

export default Wallet