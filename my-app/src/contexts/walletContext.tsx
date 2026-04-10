import Wallet from "@/types/wallet"
import { createContext, useContext, useEffect, useState } from "react"
import { AuthContext } from "./authContext"
import * as walletService from "@/services/walletService"
import CreateWalletDTO from "@/DTO/walletDTO"

type WalletContextType = {
    wallets: Wallet[],
    addWallet: (wallet: CreateWalletDTO) => Promise<void>
    updateWallet: (id: string, data: Partial<Wallet>) => Promise<void>
    loadWallets: () => Promise<void>
    getWalletById: (id: string) => Promise<Wallet>
    deleteWallet: (id: string) => Promise<void>
}

const WalletContext = createContext({} as WalletContextType);

export function WalletProvider({ children }: any) {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const { token, isReady } = useContext(AuthContext);

    async function loadWallets() {
        const data = await walletService.loadWallets();

        setWallets(data);
    }

    async function addWallet(wallet: CreateWalletDTO) {
        const newWallet = await walletService.addWallet(wallet);

        setWallets((prev) => [...prev, newWallet]);
    }

    async function updateWallet(id: string, data: any) {
        const updateWallet = await walletService.updateWallet(id, data);

        setWallets((prev) => prev.map((wallet) => (wallet.id === id ? updateWallet : wallet)));
    }

    async function deleteWallet(id: string) {
        await walletService.deleteWallet(id);

        setWallets((prev) => prev.filter((wallet) => wallet.id !== id));
    }

    useEffect(() => {
        if (!isReady || !token) return;

        loadWallets();
    }, [isReady, token]);

    return (
        <WalletContext.Provider
            value={{
                wallets,
                addWallet: addWallet,
                updateWallet: updateWallet,
                loadWallets: loadWallets,
                getWalletById: walletService.getWalletById,
                deleteWallet: deleteWallet
            }}
    >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallets() {
    return useContext(WalletContext);
}