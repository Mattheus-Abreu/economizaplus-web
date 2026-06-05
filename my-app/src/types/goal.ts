type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  deadline: string;
  currentAmount: number;
  description: string;
  walletId: string;
  isCompleted: boolean;
};

export default Goal;