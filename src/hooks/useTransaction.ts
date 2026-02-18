import { useState } from 'react';
import { runTransaction, doc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export const useTransaction = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getUserByAccount = async (accountNumber: string) => {
        const q = query(collection(db, 'users'), where('accountNumber', '==', accountNumber));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { uid: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    };

    const sendMoney = async (recipientAccountNumber: string, amount: number) => {
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            const recipientData = await getUserByAccount(recipientAccountNumber);
            if (!recipientData) throw new Error("Recipient account not found!");

            await runTransaction(db, async (transaction) => {
                const senderRef = doc(db, 'users', user.uid);
                const recipientRef = doc(db, 'users', recipientData.uid);

                const senderDoc = await transaction.get(senderRef);
                const recipientDoc = await transaction.get(recipientRef);

                if (!senderDoc.exists()) throw "Sender does not exist!";
                if (!recipientDoc.exists()) throw "Recipient does not exist!";

                const senderBalance = senderDoc.data().balance;
                if (senderBalance < amount) throw "Insufficient funds!";

                const newSenderBalance = senderBalance - amount;
                const newRecipientBalance = recipientDoc.data().balance + amount;

                transaction.update(senderRef, { balance: newSenderBalance });
                transaction.update(recipientRef, { balance: newRecipientBalance });

                // Record transaction
                const transactionRef = doc(collection(db, 'transactions'));
                transaction.set(transactionRef, {
                    senderId: user.uid,
                    recipientId: recipientData.uid,
                    amount,
                    type: 'P2P',
                    status: 'completed',
                    timestamp: serverTimestamp()
                });
            });
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Transaction failed");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { sendMoney, getUserByAccount, loading, error };
};
