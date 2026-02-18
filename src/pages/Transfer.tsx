import React, { useState, useEffect } from 'react';
import { useTransaction } from '../hooks/useTransaction';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, CheckCircle, Loader2, Shield, Tag } from 'lucide-react';

const QUICK_AMOUNTS = [50, 100, 250, 500];

const Transfer: React.FC = () => {
    const { sendMoney, getUserByAccount, loading, CATEGORIES } = useTransaction();
    const { verifyPin, profile } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [accountNum, setAccountNum] = useState('');
    const [recipient, setRecipient] = useState<any>(null);
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');
    const [category, setCategory] = useState('Transfer');
    const [success, setSuccess] = useState(false);
    const [lookingUp, setLookingUp] = useState(false);

    // Pre-fill from scanner query params
    useEffect(() => {
        const to = searchParams.get('to');
        const name = searchParams.get('name');
        if (to) {
            setAccountNum(to);
            if (name) {
                setRecipient({ accountNumber: to, displayName: decodeURIComponent(name), email: '' });
                setStep(2);
            } else {
                handleLookup(to);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLookup = async (accNum?: string) => {
        const target = accNum || accountNum;
        if (!target || target.length < 5) {
            toast.error('Enter a valid account number');
            return;
        }
        setLookingUp(true);
        try {
            const user = await getUserByAccount(target);
            if (user) {
                if (user.accountNumber === profile?.accountNumber) {
                    toast.error("You can't send money to yourself!");
                    return;
                }
                setRecipient(user);
                setStep(2);
            } else {
                toast.error('Account not found');
            }
        } catch {
            toast.error('Error looking up account');
        } finally {
            setLookingUp(false);
        }
    };

    const handleTransfer = async () => {
        if (!pin || pin.length !== 6) {
            toast.error('Enter your 6-digit PIN');
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Enter a valid amount');
            return;
        }

        const isValid = await verifyPin(pin);
        if (!isValid) {
            toast.error('Incorrect PIN');
            return;
        }

        try {
            await sendMoney(accountNum, parseFloat(amount), category);
            setSuccess(true);
        } catch (e: any) {
            toast.error(e.message || 'Transfer failed');
        }
    };

    const resetForm = () => {
        setStep(1);
        setAccountNum('');
        setAmount('');
        setPin('');
        setRecipient(null);
        setCategory('Transfer');
        setSuccess(false);
    };

    // ═══ SUCCESS SCREEN ═══
    if (success) {
        return (
            <div className="p-6 pt-10 flex flex-col items-center justify-center min-h-[70vh]">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200 }}
                    className="flex flex-col items-center text-center space-y-5"
                >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black dark:text-white">Transfer Successful! 🎉</h2>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
                            Sent <span className="font-bold text-primary-500">${parseFloat(amount).toFixed(2)}</span> to {recipient?.displayName || recipient?.email}
                        </p>
                    </div>
                    <div className="flex gap-3 w-full">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/')}
                            className="flex-1 py-3.5 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                            Home
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={resetForm}
                            className="flex-1 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/20"
                        >
                            Send Again
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-5 pt-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-6"
            >
                {step > 1 && (
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setStep(1); setRecipient(null); }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </motion.button>
                )}
                <h1 className="text-2xl font-black dark:text-white">Send Money</h1>
            </motion.div>

            <AnimatePresence mode="wait">
                {/* ═══ STEP 1: Find Recipient ═══ */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-5"
                    >
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                                Recipient Account Number
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full p-4 pr-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-mono tracking-wider focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                                    placeholder="Enter 14-16 digit number"
                                    value={accountNum}
                                    onChange={e => setAccountNum(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                    maxLength={16}
                                />
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600" />
                            </div>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleLookup()}
                            disabled={accountNum.length < 14 || lookingUp} // Validating min 14 digits
                            className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20 disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
                        >
                            {lookingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Find Account'}
                        </motion.button>
                    </motion.div>
                )}

                {/* ═══ STEP 2: Amount + PIN ═══ */}
                {step === 2 && recipient && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                    >
                        {/* Recipient card */}
                        <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 p-4 rounded-2xl border border-primary-200/50 dark:border-primary-800/30">
                            <p className="text-[10px] uppercase tracking-wider text-primary-400 font-bold mb-1">Sending to</p>
                            <p className="font-bold text-lg dark:text-white">{recipient.displayName || recipient.email}</p>
                            <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{recipient.accountNumber}</p>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 dark:text-slate-600">$</span>
                                <input
                                    type="number"
                                    className="w-full p-4 pl-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-2xl font-bold tracking-wider focus:ring-2 focus:ring-primary-400 transition-all"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                />
                            </div>
                            {/* Quick amounts */}
                            <div className="flex gap-2 mt-3">
                                {QUICK_AMOUNTS.map(qa => (
                                    <motion.button
                                        key={qa}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setAmount(qa.toString())}
                                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${amount === qa.toString()
                                            ? 'bg-primary-500 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        ${qa}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-2">
                                <Tag className="w-3 h-3" /> Category
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${category === cat
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PIN */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-2">
                                <Shield className="w-3 h-3" /> Security PIN
                            </label>
                            <input
                                type="password"
                                maxLength={6}
                                className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl tracking-[0.5em] text-center text-xl font-mono focus:ring-2 focus:ring-primary-400 transition-all"
                                placeholder="••••••"
                                value={pin}
                                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 pt-2">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setStep(1); setRecipient(null); }}
                                className="flex-1 py-3.5 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleTransfer}
                                disabled={loading || !amount || !pin}
                                className="flex-1 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/20 disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Money'}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Transfer;
