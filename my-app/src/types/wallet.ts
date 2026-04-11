type  WalletType =  "CHECKING_ACCOUNT" | "SAVINGS_ACCOUNT" | "CASH" | "INVESTMENT";

type Wallet = {
    id: string;
    name: string;
    type: WalletType;
    balance: number;
}

export default Wallet