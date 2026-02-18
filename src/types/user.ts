export type CardScheme = 'VISA' | 'MASTERCARD' | 'NAPAS' | 'AMEX';
export type CardStatus = 'ACTIVE' | 'LOCKED';
export type CardTheme = 'gradient-blue' | 'gradient-black' | 'metallic-silver' | 'gradient-green';

export interface Card {
    id: string;
    scheme: CardScheme;
    number: string; // 16 digits (15 for Amex)
    cvv: string; // 3 digits (4 for Amex)
    expiry: string; // MM/YY
    balance: number; // Linked to main wallet or separate
    status: CardStatus;
    colorTheme: CardTheme;
    holderName: string;
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    phone?: string; // Optional during migration, required for new users
    pin: string;
    accountNumber: string; // 14 digits, unique
    alias?: string; // Unique, no special chars
    balance: number;
    savings: number;
    cards: Card[];
    createdAt: string;
}
