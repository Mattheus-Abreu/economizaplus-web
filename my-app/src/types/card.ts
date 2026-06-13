type CardType = "CREDIT" | "DEBIT";

type CardTransaction = {
  id: string;
  description: string;
  amount: number | string;
  type: string;
  transactionDate: string;
};

type Card = {
  id: string;
  userId: string;
  name: string;
  brand: string;
  last4Digits: string;
  limitTotal: number;
  limitRemaining: number;
  dueDay: number;
  closingDay: number;
  type: CardType;
  transactions?: CardTransaction[];
};

export default Card;
export type { CardTransaction, CardType };
