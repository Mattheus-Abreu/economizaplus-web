type TransactionType = "Entrada" | "Saída"
type PaymentMethod = "Dinheiro" | "Cartão" | "Pix" | "Transferencia"
type CardType = "Credito" | "Debito" 

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