type  WalletType =  "CHECKING_ACCOUNT" | "SAVINGS_ACCOUNT" | "CASH" | "INVESTMENT";

type CreateWalletDTO = {
  name: string;
  type: WalletType;
  balance: number;
};

export default CreateWalletDTO;