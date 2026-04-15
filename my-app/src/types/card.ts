type CardType = "CREDIT" | "DEBIT";


type Card = {
    id: string;
    userId: string;
    name: string;
    brand: string;
    last4Digits: string;
    limitTotal: number;
    limitRemaining: number;
    dueDay: number;
    closingDay: number;
    type: CardType;
}

export default Card;