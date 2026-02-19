export type CardScheme = 'VISA' | 'MASTERCARD' | 'NAPAS' | 'AMEX';
export type CardStatus = 'ACTIVE' | 'LOCKED';
export type CardTheme = 'gradient-blue' | 'gradient-black' | 'metallic-silver' | 'gradient-green';

export interface Card {
    id: string; // Internal ID or hash
    scheme: CardScheme;
    number: string; // 16 digits (15 for Amex)
    cvv: string; // 3 digits (4 for Amex)
    expiry: string; // MM/YY
    // balance: REMOVED - Virtual Cards use Main Balance
    status: CardStatus;
    colorTheme: CardTheme;
    holderName: string;
    provider?: string;
    isFrozen?: boolean; // Sprint 31: Freeze Feature
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    phone?: string;
    pin: string;
    accountNumber: string; // 14 digits, unique
    alias?: string;

    // Financials - Single Source
    mainBalance: number;
    savings: number;

    cards: Card[];
    createdAt: string;
}
