type CreateSavingDTO = {
  goalId: string;
  walletId: string;
  amount: number;
  createdAt: string;
  description?: string;
};

export default CreateSavingDTO;