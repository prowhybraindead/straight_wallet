import { useState, useCallback } from 'react';
import {
    runTransaction, doc, collection, serverTimestamp,
    query, where, getDocs, getDoc, orderBy, limit, addDoc,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Transaction {
    id: string;
    senderId: string;
    recipientId: string;
    senderName?: string;
    recipientName?: string;
    amount: number;
    type: 'P2P' | 'PAYMENT' | 'SAVINGS_DEPOSIT' | 'SAVINGS_WITHDRAW';
    category?: string;
    status: string;
    timestamp: any;
    direction?: 'in' | 'out';
    sourceId?: string; // Account Number or Card ID
}

export interface SavingsJar {
    id: string;
    name: string;
    goal: number;
    current: number;
    color: string;
    icon: string;
    createdAt: any;
}

const CATEGORIES = ['Transfer', 'Food & Drink', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];

export const useTransaction = () => {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getUserByAccount = async (accountNumber: string) => {
        const q = query(collection(db, 'users'), where('accountNumber', '==', accountNumber));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { uid: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
    };

    const sendMoney = async (recipientAccountNumber: string, amount: number, category: string = 'Transfer', sourceId?: string) => {
        if (!user || !profile) throw new Error('Not authenticated');
        if (amount <= 0) throw new Error('Amount must be positive');
        setLoading(true);
        setError(null);

        const actualSourceId = sourceId || profile.accountNumber;

        try {
            const recipientData = await getUserByAccount(recipientAccountNumber);
            // Allow sending to self if using different accounts/cards? For now block self-sending P2P
            if (recipientData && recipientData.uid === user.uid) throw new Error('Cannot send to yourself!');

            // Note: If recipient not found via Account Number, in a real app check Card Number here.
            // For MVP strictness, we require Account Number for P2P unless we add a specific Card Lookup.
            if (!recipientData) throw new Error('Recipient account not found!');

            await runTransaction(db, async (transaction) => {
                const senderRef = doc(db, 'users', user.uid);
                const recipientRef = doc(db, 'users', recipientData.uid);

                const senderDoc = await transaction.get(senderRef);
                const recipientDoc = await transaction.get(recipientRef);

                if (!senderDoc.exists()) throw new Error('Sender does not exist!');
                if (!recipientDoc.exists()) throw new Error('Recipient does not exist!');

                const senderBalance = senderDoc.data().balance;
                if (senderBalance < amount) throw new Error('Insufficient funds!');

                transaction.update(senderRef, { balance: senderBalance - amount });
                transaction.update(recipientRef, { balance: recipientDoc.data().balance + amount });

                const transactionRef = doc(collection(db, 'transactions'));
                transaction.set(transactionRef, {
                    senderId: user.uid,
                    recipientId: recipientData.uid,
                    senderName: profile.displayName || profile.email,
                    recipientName: recipientData.displayName || recipientData.email,
                    amount,
                    type: 'P2P',
                    category,
                    status: 'completed',
                    timestamp: serverTimestamp(),
                    sourceId: actualSourceId
                });
            });
        } catch (err: any) {
            console.error(err);
            const msg = err.message || 'Transaction failed';
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    // === Savings Jar Operations ===
    const getSavingsJars = useCallback(async (): Promise<SavingsJar[]> => {
        if (!user) return [];
        const q = query(
            collection(db, 'users', user.uid, 'savings_jars'),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SavingsJar));
    }, [user]);

    const createSavingsJar = async (name: string, goal: number, color: string, icon: string) => {
        if (!user) throw new Error('Not authenticated');
        const ref = collection(db, 'users', user.uid, 'savings_jars');
        await addDoc(ref, {
            name,
            goal,
            current: 0,
            color,
            icon,
            createdAt: serverTimestamp(),
        });
    };

    const depositToJar = async (jarId: string, amount: number) => {
        if (!user) throw new Error('Not authenticated');
        if (amount <= 0) throw new Error('Amount must be positive');
        setLoading(true);

        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, 'users', user.uid);
                const jarRef = doc(db, 'users', user.uid, 'savings_jars', jarId);

                const userDoc = await transaction.get(userRef);
                const jarDoc = await transaction.get(jarRef);

                if (!userDoc.exists()) throw new Error('User not found');
                if (!jarDoc.exists()) throw new Error('Jar not found');

                const balance = userDoc.data().balance;
                if (balance < amount) throw new Error('Insufficient funds!');

                transaction.update(userRef, { balance: balance - amount });
                transaction.update(jarRef, { current: jarDoc.data().current + amount });

                const txRef = doc(collection(db, 'transactions'));
                transaction.set(txRef, {
                    senderId: user.uid,
                    recipientId: user.uid,
                    amount,
                    type: 'SAVINGS_DEPOSIT',
                    category: 'Savings',
                    status: 'completed',
                    timestamp: serverTimestamp(),
                });
            });
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const withdrawFromJar = async (jarId: string, amount: number) => {
        if (!user) throw new Error('Not authenticated');
        if (amount <= 0) throw new Error('Amount must be positive');
        setLoading(true);

        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, 'users', user.uid);
                const jarRef = doc(db, 'users', user.uid, 'savings_jars', jarId);

                const userDoc = await transaction.get(userRef);
                const jarDoc = await transaction.get(jarRef);

                if (!userDoc.exists()) throw new Error('User not found');
                if (!jarDoc.exists()) throw new Error('Jar not found');

                const jarCurrent = jarDoc.data().current;
                if (jarCurrent < amount) throw new Error('Insufficient jar balance!');

                transaction.update(userRef, { balance: userDoc.data().balance + amount });
                transaction.update(jarRef, { current: jarCurrent - amount });

                const txRef = doc(collection(db, 'transactions'));
                transaction.set(txRef, {
                    senderId: user.uid,
                    recipientId: user.uid,
                    amount,
                    type: 'SAVINGS_WITHDRAW',
                    category: 'Savings',
                    status: 'completed',
                    timestamp: serverTimestamp(),
                });
            });
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteJar = async (jarId: string) => {
        if (!user) throw new Error('Not authenticated');
        // First, withdraw remaining balance
        const jarRef = doc(db, 'users', user.uid, 'savings_jars', jarId);
        const jarSnap = await getDoc(jarRef);
        if (jarSnap.exists() && jarSnap.data().current > 0) {
            await withdrawFromJar(jarId, jarSnap.data().current);
        }
        await deleteDoc(jarRef);
    };

    const getTransactionsByUser = useCallback(async (count: number = 50): Promise<Transaction[]> => {
        if (!user) return [];
        const qSent = query(
            collection(db, 'transactions'),
            where('senderId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(count)
        );
        const qRecv = query(
            collection(db, 'transactions'),
            where('recipientId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(count)
        );
        const [sentSnap, recvSnap] = await Promise.all([getDocs(qSent), getDocs(qRecv)]);
        const sent = sentSnap.docs.map(d => ({ id: d.id, ...d.data(), direction: 'out' as const }));
        const recv = recvSnap.docs.map(d => ({ id: d.id, ...d.data(), direction: 'in' as const }));
        const all = [...sent, ...recv];
        // Deduplicate
        const seen = new Set<string>();
        const unique = all.filter(t => {
            if (seen.has(t.id)) return false;
            seen.add(t.id);
            return true;
        });
        return unique.sort((a: any, b: any) => {
            const aTime = a.timestamp?.toDate?.()?.getTime?.() || 0;
            const bTime = b.timestamp?.toDate?.()?.getTime?.() || 0;
            return bTime - aTime;
        }) as Transaction[];
    }, [user]);

    return {
        sendMoney,
        getUserByAccount,
        getSavingsJars,
        createSavingsJar,
        depositToJar,
        withdrawFromJar,
        deleteJar,
        getTransactionsByUser,
        loading,
        error,
        CATEGORIES,
    };
};
