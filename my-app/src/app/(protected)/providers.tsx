import { CategoryProvider } from "@/contexts/categoryContext";
import { GoalProvider } from "@/contexts/goalContext";
import TransactionProvider from "@/contexts/transactionContext";
import { WalletProvider } from "@/contexts/walletContext";

// providers.tsx
function AppProviders({ children }: any) {
  return (
    <WalletProvider>
      <CategoryProvider>
        <GoalProvider>
          <TransactionProvider>
            {children}
          </TransactionProvider>
        </GoalProvider>
      </CategoryProvider>
    </WalletProvider>
  );
}

export default AppProviders;