import type { Card, CardScheme, CardTheme } from '../types/user';

// BIN Prefixes (Real-world simulation)
const BIN_MAP: Record<CardScheme, string> = {
    VISA: '4221',        // Visa
    MASTERCARD: '5100',  // Mastercard
    NAPAS: '9704',       // Napas (Vietnam Domestic)
    AMEX: '37',          // Amex
};

// Theme Mapping Override
export const THEME_MAP: Record<CardScheme, CardTheme> = {
    VISA: 'gradient-blue',
    MASTERCARD: 'gradient-black',
    AMEX: 'metallic-silver',
    NAPAS: 'gradient-green',
};

/**
 * Calculates the Luhn check digit for a given number string.
 */
const calculateLuhnCheckDigit = (partialNumber: string): string => {
    const digits = partialNumber.split('').map(Number);
    let sum = 0;
    let isSecond = true;

    // Iterate from right to left
    for (let i = digits.length - 1; i >= 0; i--) {
        let d = digits[i];
        if (isSecond) {
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
        isSecond = !isSecond;
    }

    const mod = sum % 10;
    return mod === 0 ? '0' : (10 - mod).toString();
};

/**
 * Generates a valid credit card number passing Luhn checksum.
 * @param scheme Card Scheme
 */
export const generateCardNumber = (scheme: CardScheme): string => {
    const bin = BIN_MAP[scheme];
    const length = scheme === 'AMEX' ? 15 : 16;

    // Generate random digits up to length - 1 (check digit)
    const randomLength = length - bin.length - 1;
    let partial = bin;

    for (let i = 0; i < randomLength; i++) {
        partial += Math.floor(Math.random() * 10).toString();
    }

    const checkDigit = calculateLuhnCheckDigit(partial);
    return partial + checkDigit;
};

/**
 * Generates a CVV code.
 * @param scheme Card Scheme
 */
const generateCVV = (scheme: CardScheme): string => {
    const length = scheme === 'AMEX' ? 4 : 3;
    let cvv = '';
    for (let i = 0; i < length; i++) {
        cvv += Math.floor(Math.random() * 10).toString();
    }
    return cvv;
};

/**
 * Generates a random expiry date (3-5 years in future).
 */
const generateExpiry = (): string => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const expiryYear = currentYear + 3 + Math.floor(Math.random() * 3); // 3 to 5 years
    const expiryMonth = Math.floor(Math.random() * 12) + 1;

    return `${expiryMonth.toString().padStart(2, '0')}/${expiryYear.toString().slice(-2)}`;
};

/**
 * Creates a full Card object.
 */
export const createNewCard = (scheme: CardScheme, holderName: string): Card => {
    return {
        id: crypto.randomUUID(),
        scheme,
        number: generateCardNumber(scheme),
        cvv: generateCVV(scheme),
        expiry: generateExpiry(),
        // balance: 0, // REMOVED
        status: 'ACTIVE',
        colorTheme: THEME_MAP[scheme],
        holderName: holderName.toUpperCase(),
    };
};
