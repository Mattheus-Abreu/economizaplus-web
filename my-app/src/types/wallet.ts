type WalletType = "CASH" | "SAVINGS_ACCOUNT" | "INVESTMENT" | "CHECKING_ACCOUNT";

type Wallet = {
    id: string;
    name: string;
    type: WalletType;
    balance: number;
}

export default Wallet