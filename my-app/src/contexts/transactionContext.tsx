import Transaction from "@/types/transaction"
import * as transactionService from "@/services/transactionService"
import React, { createContext, useContext, useEffect, useState } from "react"
import { AuthContext } from "./authContext";

type transactionContextType = {
    transactions: Transaction[],
    loadTransactions: () => Promise<void>,
    addTransaction: (data: any) => Promise<void>,
    updateTransaction: (id: string, data: any) => Promise<void>,
    deleteTransaction: (id: string) => Promise<void>,

}

const transactionContext = createContext({} as transactionContextType);

export function TransactionProvider({ children }: any) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const { token, isReady } = useContext(AuthContext);

    async function loadTransactions() {
        
    }

    async function addTransaction(data: any) {
        const newTransaction = await transactionService.addTransaction(data);
        
        setTransactions((prev) => [...prev, newTransaction]);
    }

    async function updateTransaction(id: string, data: any) {
        const updateTransaction = await transactionService.updateTransaction(id, data);
        
        setTransactions((prev) => prev.map((transaction) => (transaction.id === id ? updateTransaction : transaction)));
    } 

    async function deleteTransaction(id: string) {
        const deletedTransaction = await transactionService.deleteTransaction(id);       
        
        setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
    }

   

    useEffect(() => {
        if(!token || !isReady) return
        loadTransactions();
    }, [token, isReady]);

    return(
        <transactionContext.Provider
            value={{
                transactions,
                loadTransactions,
                addTransaction,
                updateTransaction,
                deleteTransaction
            }}
        >
            {children}
        </transactionContext.Provider>
    )
}

export function useTransactions() {
    return useContext(transactionContext);
}

export default TransactionProvider