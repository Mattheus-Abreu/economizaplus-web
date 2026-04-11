type TransactionType = "INCOME" | "EXPENSE" |"TRANSFER";
type PaymentMethod = "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "BANK_TRANSFER";
type CardType = "CREDIT" | "DEBIT";

type Transaction = {
    id: string,
    type: TransactionType,
    paymentMethod: PaymentMethod,
    cardType?: CardType,
    interestRate?: number,
    walletId: string,
    amount: number,
    description: string,
    transactionDate: string,
    goalId?: number,
    categoryId?: number,
    isInstallment?: boolean,
    installmentNumber?: number,
    installmentTotal?: number
}

export default Transaction;