import { CategoryProvider } from "@/contexts/categoryContext";
import { GoalProvider } from "@/contexts/goalContext";
import { SavingProvider } from "@/contexts/savingContext";
import TransactionProvider from "@/contexts/transactionContext";
import { WalletProvider } from "@/contexts/walletContext";

// providers.tsx
function AppProviders({ children }: any) {
  return (
    <WalletProvider>
      <CategoryProvider>
        <GoalProvider>
          <SavingProvider>
            <TransactionProvider>
              {children}
            </TransactionProvider>
          </SavingProvider>
        </GoalProvider>
      </CategoryProvider>
    </WalletProvider>
  );
}

export default AppProviders;