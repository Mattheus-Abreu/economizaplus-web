import Card from "@/types/card";
import { createContext, useContext, useState } from "react";

type CardContextType = {
    cards: Card[];
    loadCards: () => Promise<void>;
    addCard: (data: Omit<Card, "id">) => Promise<void>;
    deleteCard: (id: string) => Promise<void>;
    updateCard: (id: string, data: Omit<Card, "id">) => Promise<void>;
    getCardById: (id: string) => Promise<Card | null>;
}

const CardContext = createContext({} as CardContextType);

export function CardProvider({ children }: any) {
  const [cards, setCards] = useState<Card[]>([]);
    async function loadCards() {}
    async function addCard(data: Omit<Card, "id">) {}
    async function deleteCard(id: string) {}
    async function updateCard(id: string, data: Omit<Card, "id">) {}
    async function getCardById(id: string) {
        return null;
    }
  return (
    <CardContext.Provider value={{
        cards,
        loadCards,
        addCard,
        deleteCard,
        updateCard,
        getCardById
    }}>
        {children}
    </CardContext.Provider>
  );
}

export function useCard() {
    return useContext(CardContext);
}