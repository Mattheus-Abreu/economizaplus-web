type WalletType = "CASH" | "INVESTMENT" | "SAVINGS_ACCOUNT" | "CHECKING_ACCOUNT" | "GOAL";

type CreateWalletDTO = {
  name: string;
  type: WalletType;
  balance: number;
};

export default CreateWalletDTO;