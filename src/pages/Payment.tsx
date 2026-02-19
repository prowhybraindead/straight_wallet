import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Shield, CreditCard, Loader2, CheckCircle, ArrowLeft, Store } from 'lucide-react';
import { db } from '../firebase'; // Correct path to initialized Client SDK
import { doc, runTransaction, getDoc, serverTimestamp, increment } from 'firebase/firestore';

const Payment: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { profile, verifyPin } = useAuth();

    // Transaction State
    const [transactionId, setTransactionId] = useState('');
    const [merchantName, setMerchantName] = useState('Loading...');
    const [amount, setAmount] = useState('0.00');
    const [loaded, setLoaded] = useState(false);

    // User Input State
    const [selectedCard, setSelectedCard] = useState<string>('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const tid = searchParams.get('transactionId');
        if (!tid) return;
        setTransactionId(tid);

        // Fetch Transaction Details to Display Amount/Merchant
        // This is a READ-ONLY fetch for UI. The actual atomic check happens in runTransaction.
        async function fetchDetails() {
            try {
                const docRef = doc(db, 'transactions', tid!);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setAmount(data.amount.toFixed(2));
                    setMerchantName(data.merchantName || 'Merchant');
                    setLoaded(true);
                } else {
                    toast.error("Transaction not found");
                    navigate('/');
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load transaction");
            }
        }
        fetchDetails();

        // Auto-select card
        if (profile?.cards?.length) {
            setSelectedCard(profile.cards[0].number);
        }
    }, [searchParams, navigate, profile]);

    const handlePayment = async () => {
        if (!pin || pin.length !== 6) {
            toast.error('Enter 6-digit PIN');
            return;
        }

        setLoading(true);
        try {
            // 1. Client Logic: Hash Check (Optional optimization, strictly done in security rules or trusted env)
            const isPinValid = await verifyPin(pin);
            if (!isPinValid) {
                toast.error('Incorrect PIN');
                setLoading(false);
                return;
            }

            // 2. ATOMIC FIRESTORE TRANSACTION
            await runTransaction(db, async (transaction) => {
                const txRef = doc(db, 'transactions', transactionId);
                const userRef = doc(db, 'users', profile!.uid);

                // --- PHASE 1: ALL READS ---
                // We must read transaction first to get merchantId
                const txDoc = await transaction.get(txRef);
                const userDoc = await transaction.get(userRef);

                if (!txDoc.exists()) throw new Error("Transaction does not exist!");
                if (!userDoc.exists()) throw new Error("User profile not found!");

                const txData = txDoc.data();
                const userData = userDoc.data();

                // Conditional Read: Merchant (Must happen before ANY write)
                let merchantRef: any = null;
                let merchantDoc: any = null;

                if (txData.merchantId) {
                    merchantRef = doc(db, 'merchants', txData.merchantId);
                    merchantDoc = await transaction.get(merchantRef);
                }

                // --- PHASE 2: VALIDATIONS (No writes yet) ---
                // Idempotency & Status Check
                if (txData.status === 'COMPLETED') throw new Error("Transaction already completed!");
                if (txData.status === 'FAILED') throw new Error("Transaction Failed/Expired!");

                // Balance Check (Single-Source Debit)
                const chargeAmount = txData.amount;
                const currentBalance = userData.mainBalance || 0;

                const card = profile!.cards.find(c => c.number === selectedCard);
                if (!card) throw new Error('Selected card not found');
                if (card.isFrozen) throw new Error('This card is frozen. Please unfreeze it to make payments.');

                if (currentBalance < chargeAmount) {
                    throw new Error(`Insufficient Funds. Balance: $${currentBalance}`);
                }

                // --- PHASE 3: ALL WRITES ---

                // 1. Deduct from User
                transaction.update(userRef, {
                    mainBalance: increment(-chargeAmount)
                });

                // 2. Credit Merchant
                if (merchantRef && merchantDoc && merchantDoc.exists()) {
                    transaction.update(merchantRef, {
                        balance: increment(chargeAmount)
                    });
                }

                // 3. Complete Transaction
                transaction.update(txRef, {
                    status: 'COMPLETED',
                    payerId: profile!.uid, // Keep for legacy compatibility
                    senderId: profile!.uid, // CRITICAL: For Global History (Home.tsx)
                    sourceId: selectedCard, // CRITICAL: For Card-Specific History (CardDetailView.tsx)
                    paymentMethod: 'DEBIT',
                    processedAt: serverTimestamp(),
                    timestamp: serverTimestamp() // CRITICAL: For sorting in History (Home.tsx uses .toDate())
                });
            });

            setSuccess(true);
            toast.success('Payment Successful!');

        } catch (error: any) {
            console.error("Transaction Failed:", error);
            toast.error(error.message || 'Payment processing failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="p-6 pt-10 flex flex-col items-center justify-center min-h-[70vh]">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-emerald-500/50 shadow-lg mb-6"
                >
                    <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold dark:text-white mb-2">Payment Sent!</h2>
                <p className="text-slate-500 text-sm mb-8 text-center max-w-xs">
                    Transaction Completed.
                </p>
                <button onClick={() => navigate('/')} className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">
                    Return Home
                </button>
            </div>
        );
    }

    if (!loaded) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

    return (
        <div className="p-5 pt-8 max-w-md mx-auto">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-black dark:text-white">Confirm Pay</h1>
            </motion.div>

            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl mb-8 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Store className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xs uppercase font-bold text-slate-500">Paying</p>
                        <p className="font-bold text-lg dark:text-white">{merchantName}</p>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 text-sm">Amount</span>
                    <span className="text-xl font-black dark:text-white">${amount}</span>
                </div>
            </div>

            {/* Card Selection */}
            <div className="mb-8">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Pay with</label>
                <div className="space-y-3">
                    {profile?.cards?.map((card: any) => (
                        <div key={card.number} onClick={() => setSelectedCard(card.number)}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedCard === card.number ? 'border-primary-500 bg-primary-500/5' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                            <CreditCard className={`w-6 h-6 ${selectedCard === card.number ? 'text-primary-500' : 'text-slate-400'}`} />
                            <div>
                                <p className="font-bold text-sm dark:text-white">
                                    {card.provider ? card.provider.toUpperCase() : 'DEBIT'} <span className="text-slate-500">•••• {card.number.slice(-4)}</span>
                                </p>
                            </div>
                            {selectedCard === card.number && <div className="ml-auto w-4 h-4 bg-primary-500 rounded-full" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* PIN Entry */}
            <div className="mb-8">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Security PIN</label>
                <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="password" maxLength={6} className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-primary-500"
                        placeholder="••••••" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} />
                </div>
            </div>

            <button onClick={handlePayment} disabled={loading || !selectedCard || pin.length !== 6}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Execute Payment'}
            </button>
        </div>
    );
};

export default Payment;
