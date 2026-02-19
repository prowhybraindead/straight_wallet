import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Shield, CreditCard, Loader2, CheckCircle, ArrowLeft, Store } from 'lucide-react';

const Payment: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { profile, verifyPin } = useAuth();

    // State for Transaction Params
    const [transactionId, setTransactionId] = useState('');
    const [merchant, setMerchant] = useState('Merchant');
    const [amount, setAmount] = useState('0.00');

    // State for User Interaction
    const [selectedCard, setSelectedCard] = useState<string>('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const tid = searchParams.get('transactionId');
        const mName = searchParams.get('merchant');
        const amt = searchParams.get('amount');

        if (mName) setMerchant(mName);
        if (amt) setAmount(amt);

        if (tid) {
            setTransactionId(tid);
            // Auto-select first card
            if (profile?.cards && profile.cards.length > 0) {
                setSelectedCard(profile.cards[0].number);
            }
        }
    }, [searchParams, profile]);

    // Defensive: Debug UI for missing params
    if (!searchParams.get('transactionId')) {
        return (
            <div className="p-4 bg-slate-900 text-yellow-400 min-h-screen font-mono text-xs flex flex-col justify-center">
                <h1 className="text-xl font-bold mb-4 text-white">Debug Mode: Missing Params</h1>
                <p className="mb-2">Param 'transactionId' is missing.</p>
                <div className="bg-black p-4 rounded-xl border border-white/10 overflow-auto mb-8">
                    <p className="text-slate-500 mb-2">// Current URL Params:</p>
                    <pre>{JSON.stringify(Object.fromEntries([...searchParams]), null, 2)}</pre>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="w-full py-4 bg-white/10 hover:bg-white/20 px-4 rounded-xl text-white font-bold transition-colors"
                >
                    Go Home
                </button>
            </div>
        );
    }

    const handlePayment = async () => {
        if (!pin || pin.length !== 6) {
            toast.error('Enter 6-digit PIN');
            return;
        }

        setLoading(true);
        try {
            // 1. Verify PIN (Client/Wallet Side)
            const isPinValid = await verifyPin(pin);
            if (!isPinValid) {
                toast.error('Incorrect PIN');
                setLoading(false);
                return;
            }

            // 2. Call Core API (New Public Endpoint)
            const coreUrl = import.meta.env.VITE_CORE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${coreUrl}/api/v1/process-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transactionId,
                    cardNumber: selectedCard,
                    pin
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment Failed');
            }

            setSuccess(true);
            toast.success('Payment Successful!');

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Connection Error');
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
                    Transaction {transactionId.slice(0, 8)}... has been processed.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="p-5 pt-8 max-w-md mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-8"
            >
                <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-black dark:text-white">Checkout</h1>
            </motion.div>

            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl mb-8 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Store className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xs uppercase font-bold text-slate-500">Paying</p>
                        <p className="font-bold text-lg dark:text-white">{(merchant || 'Unknown').toUpperCase()}</p>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 text-sm">Amount</span>
                    <span className="text-xl font-black dark:text-white">${parseFloat(amount).toFixed(2)}</span>
                </div>
            </div>

            {/* Card Selection */}
            <div className="mb-8">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Pay with</label>
                <div className="space-y-3">
                    {/* CRITICAL FIX: Safe Optional Chaining for profile.cards */}
                    {profile?.cards?.length ? (
                        profile.cards.map((card: any) => (
                            <div
                                key={card.number}
                                onClick={() => setSelectedCard(card.number)}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedCard === card.number
                                    ? 'border-primary-500 bg-primary-500/5'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <CreditCard className={`w-6 h-6 ${selectedCard === card.number ? 'text-primary-500' : 'text-slate-400'}`} />
                                <div>
                                    <p className="font-bold text-sm dark:text-white">
                                        {card.provider ? card.provider.toUpperCase() : 'CARD'} <span className="text-slate-500">•••• {card.number.slice(-4)}</span>
                                    </p>
                                </div>
                                {selectedCard === card.number && (
                                    <div className="ml-auto w-4 h-4 bg-primary-500 rounded-full" />
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                            <CreditCard className="w-8 h-8 text-slate-300" />
                            <p>No cards found</p>
                            <button onClick={() => navigate('/card')} className="text-primary-500 font-bold text-xs hover:underline">
                                Add a Card
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* PIN Entry */}
            <div className="mb-8">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                    Confirm with PIN
                </label>
                <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="password"
                        maxLength={6}
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-primary-500 transition-all"
                        placeholder="••••••"
                        value={pin}
                        onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                    />
                </div>
            </div>

            <button
                onClick={handlePayment}
                disabled={loading || !selectedCard || pin.length !== 6}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Payment'}
            </button>
        </div>
    );
};

export default Payment;
