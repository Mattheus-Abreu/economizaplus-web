type WalletType = "CASH" | "INVESTMENT" | "SAVINGS_ACCOUNT" | "CHECKING_ACCOUNT";

type CreateWalletDTO = {
  name: string;
  type: WalletType;
  balance: number;
};

export default CreateWalletDTO;