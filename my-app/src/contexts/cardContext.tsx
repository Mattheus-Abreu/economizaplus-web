import * as cardService from "@/services/cardService";
import Card from "@/types/card";
import { createContext, useCallback, useContext, useState } from "react";

type CardContextType = {
  cards: Card[];
  isLoading: boolean;
  loadCards: () => Promise<void>;
  addCard: (data: Omit<Card, "id" | "userId">) => Promise<void>;
  updateCard: (id: string, data: Omit<Card, "id" | "userId">) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  getCardById: (id: string) => Promise<Card | null>;
};

const CardContext = createContext({} as CardContextType);

export function CardProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await cardService.getCards();
      setCards(Array.isArray(data) ? data : data.cards ?? []);
    } catch (error) {
      console.error("Erro ao carregar cartões:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCard = useCallback(async (data: Omit<Card, "id" | "userId">) => {
    try {
      const newCard = await cardService.addCard(data);
      setCards((prev) => [...prev, newCard]);
    } catch (error) {
      console.error("Erro ao adicionar cartão:", error);
      throw error;
    }
  }, []);

  const deleteCard = useCallback(async (id: string) => {
    try {
      await cardService.deleteCard(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Erro ao deletar cartão:", error);
      throw error;
    }
  }, []);

  const updateCard = useCallback(async (id: string, data: Omit<Card, "id" | "userId">) => {
    try {
      const updated = await cardService.updateCard(id, data);
      setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (error) {
      console.error("Erro ao atualizar cartão:", error);
      throw error;
    }
  }, []);

  const getCardById = useCallback(async (id: string): Promise<Card | null> => {
    try {
      const local = cards.find((c) => c.id === id);
      if (local) return local;

      const data = await cardService.getCardById(id);
      return data ?? null;
    } catch (error) {
      console.error("Erro ao buscar cartão:", error);
      return null;
    }
  }, [cards]);

  return (
    <CardContext.Provider
      value={{ cards, isLoading, loadCards, addCard, deleteCard, updateCard, getCardById }}
    >
      {children}
    </CardContext.Provider>
  );
}

export function useCard() {
  return useContext(CardContext);
}