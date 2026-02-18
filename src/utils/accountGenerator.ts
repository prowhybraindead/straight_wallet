import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Generates a random 14-digit account number.
 * Format: 88 + 12 random digits (starts with 88 for "Fortune" in Asian culture, also resembles bank prefixes)
 */
export const generateAccountNumber = (): string => {
    const prefix = '88';
    const randomPart = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
    return prefix + randomPart;
};

/**
 * Checks if an account number already exists in Firestore.
 * If it does, generates a new one recursively until a unique one is found.
 * @returns A unique 14-digit account number.
 */
export const ensureUniqueAccountNumber = async (): Promise<string> => {
    let unique = false;
    let newAccountNo = '';

    while (!unique) {
        newAccountNo = generateAccountNumber();
        const q = query(collection(db, 'users'), where('accountNumber', '==', newAccountNo));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            unique = true;
        }
    }
    return newAccountNo;
};
