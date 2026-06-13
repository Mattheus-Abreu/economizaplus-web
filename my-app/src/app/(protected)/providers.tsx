import { CardProvider } from "@/contexts/cardContext";
import { CategoryProvider } from "@/contexts/categoryContext";
import { GoalProvider } from "@/contexts/goalContext";
import { SavingProvider } from "@/contexts/savingContext";
import TransactionProvider from "@/contexts/transactionContext";
import { WalletProvider } from "@/contexts/walletContext";

function AppProviders({ children }: any) {
  return (
    <WalletProvider>
      <CardProvider>
        <CategoryProvider>
          <GoalProvider>
            <SavingProvider>
              <TransactionProvider>
                {children}
              </TransactionProvider>
            </SavingProvider>
          </GoalProvider>
        </CategoryProvider>
      </CardProvider>
    </WalletProvider>
  );
}

export default AppProviders;