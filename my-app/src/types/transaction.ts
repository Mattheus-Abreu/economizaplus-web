export type TransactionType = "INCOME" | "EXPENSE"
export type PaymentMethod = "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | "PIX" | "TRANSFER"
export type CardType = "    CREDIT" | "DEBIT" 

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