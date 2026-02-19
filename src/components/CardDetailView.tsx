import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Smartphone, Settings, Lock, RotateCcw, CreditCard, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Card as CardType } from '../types/user';
import { toast } from 'sonner';

interface CardDetailViewProps {
    card: CardType;
    onClose: () => void;
}

const CardDetailView: React.FC<CardDetailViewProps> = ({ card, onClose }) => {
    const userAuth = useAuth();
    const { user } = userAuth;
    const [isFlipped, setIsFlipped] = useState(false);
    const [isRotating, setIsRotating] = useState(true);

    // Info Table State
    const [showNumber, setShowNumber] = useState(false);
    const [showCvv, setShowCvv] = useState(false);
    const [copiedState, setCopiedState] = useState<{ field: string | null }>({ field: null });

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedState({ field: text });
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedState({ field: null }), 2000);
    };

    // Ledger State
    const [transactions, setTransactions] = useState<any[]>([]);
    const [timeFilter, setTimeFilter] = useState<'1D' | '1W' | '1M'>('1M');
    const [spent, setSpent] = useState(0);
    const limitAmount = 5000; // Mock limit for now

    useEffect(() => {
        const timer = setTimeout(() => setIsRotating(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Fetch Transactions
    useEffect(() => {
        if (!user || !card.number) return;

        const q = query(
            collection(db, 'transactions'),
            where('senderId', '==', user.uid),
            where('sourceId', '==', card.number), // Filter by this card
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rawTxs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Filter by Time
            const now = new Date();
            const filtered = rawTxs.filter((tx: any) => {
                if (!tx.timestamp) return false;
                const txDate = tx.timestamp.toDate();
                const diffTime = Math.abs(now.getTime() - txDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (timeFilter === '1D') return diffDays <= 1;
                if (timeFilter === '1W') return diffDays <= 7;
                if (timeFilter === '1M') return diffDays <= 30;
                return true;
            });

            setTransactions(filtered);

            // Calculate Spent
            const totalSpent = filtered.reduce((sum, tx: any) => sum + (tx.amount || 0), 0);
            setSpent(totalSpent);
        });

        return () => unsubscribe();
    }, [user, card.number, timeFilter]);

    const getBgClass = (theme: string) => {
        switch (theme) {
            case 'gradient-blue': return 'bg-gradient-to-br from-blue-600 to-indigo-900';
            case 'gradient-black': return 'bg-gradient-to-br from-slate-900 to-red-900';
            case 'metallic-silver': return 'bg-gradient-to-br from-gray-300 via-gray-100 to-gray-400';
            case 'gradient-green': return 'bg-gradient-to-br from-emerald-600 to-teal-900';
            default: return 'bg-slate-800';
        }
    };

    const bgClass = getBgClass(card.colorTheme);
    const textColor = card.colorTheme === 'metallic-silver' ? 'text-slate-800' : 'text-white';
    const labelColor = card.colorTheme === 'metallic-silver' ? 'text-slate-600' : 'text-white/60';

    const progress = Math.min((spent / limitAmount) * 100, 100);

    const handleToggleFreeze = async () => {
        if (!user || !card) return;

        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, 'users', user.uid);
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) throw new Error("User does not exist");

                const userData = userDoc.data();
                const cards = userData.cards || [];
                const cardIndex = cards.findIndex((c: any) => c.number === card.number);

                if (cardIndex === -1) throw new Error("Card not found");

                const newStatus = !cards[cardIndex].isFrozen;
                cards[cardIndex].isFrozen = newStatus;

                // If freezing, also set status to INACTIVE? Or just keep valid but frozen?
                // requirement says "isFrozen" flag. Let's keep it orthogonal to 'status'.

                transaction.update(userRef, { cards });
            });
            toast.success(card.isFrozen ? 'Card Unfrozen' : 'Card Frozen');
        } catch (error: any) {
            console.error('Freeze error:', error);
            toast.error(error.message || 'Failed to update card');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-start pt-12 px-6 overflow-y-auto"
        >
            <button
                onClick={onClose}
                className="absolute top-6 left-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50"
            >
                <X className="w-6 h-6" />
            </button>

            <h2 className="text-white text-xl font-bold mb-8 tracking-wide uppercase">{card.scheme}</h2>

            {/* 3D Card Container */}
            <div className="perspective-1000 mb-12">
                <motion.div
                    className="relative w-80 h-[200px] cursor-pointer preserve-3d"
                    animate={{
                        rotateY: isRotating ? 360 : isFlipped ? 180 : 0,
                        y: isRotating ? [0, -20, 0] : 0,
                        filter: card.isFrozen ? 'grayscale(100%) brightness(0.7)' : 'none'
                    }}
                    transition={{
                        rotateY: { duration: isRotating ? 1 : 0.6, ease: "easeInOut" },
                        y: { duration: 1, ease: "easeInOut" }
                    }}
                    onClick={() => !isRotating && setIsFlipped(!isFlipped)}
                >
                    {card.isFrozen && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none" style={{ transform: 'translateZ(1px)' }}>
                            <Lock className="w-16 h-16 text-white/50 drop-shadow-lg" />
                        </div>
                    )}
                    {/* === FRONT FACE === */}
                    <div
                        className={`absolute inset-0 backface-hidden rounded-2xl p-6 shadow-2xl ${bgClass} ${textColor} flex flex-col justify-between overflow-hidden border border-white/10`}
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                        {/* ... existing front face ... */}
                        {/* Shine effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="flex justify-between items-start relative z-10">
                            {/* Scheme Logo Text */}
                            <span className="font-bold tracking-wider text-lg">{card.scheme}</span>
                            <div className="flex items-center gap-1">
                                <div className="w-10 h-7 bg-yellow-200/80 rounded-md flex items-center justify-center overflow-hidden border border-yellow-400/30">
                                    <div className="w-full h-[1px] bg-yellow-600/20 my-0.5" />
                                    <div className="absolute w-6 h-4 border border-yellow-600/20 rounded-sm" />
                                </div>
                                <div className="ml-2">
                                    <CreditCard className="w-6 h-6 opacity-80" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <p className="font-mono text-xl tracking-[0.15em] drop-shadow-md">
                                {card.number.match(/.{1,4}/g)?.join(' ') || card.number}
                            </p>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className={`text-[10px] uppercase tracking-widest ${labelColor} mb-0.5`}>Card Holder</p>
                                    <p className="font-medium tracking-wide truncate max-w-[180px] text-sm">{card.holderName}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-[10px] uppercase tracking-widest ${labelColor} mb-0.5`}>Expires</p>
                                    <p className="font-medium tracking-wide text-sm">{card.expiry}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === BACK FACE (Asymmetric) === */}
                    <div
                        className={`absolute inset-0 backface-hidden rounded-2xl shadow-2xl bg-slate-800 text-white flex flex-col overflow-hidden border border-white/10`}
                        style={{
                            transform: 'rotateY(180deg)',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden'
                        }}
                    >
                        {/* Magnetic Strip */}
                        <div className="w-full h-10 bg-black mt-5" />

                        <div className="px-6 relative flex-1 flex flex-col justify-center">
                            {/* Signature Panel & CVV */}
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 h-8 bg-white/90 flex items-center px-2">
                                    <div className="w-full h-full bg-repeating-linear-gradient-45 from-transparent to-transparent via-slate-200 to-slate-200 opacity-30 bg-[length:4px_4px]" />
                                </div>
                                <div className="bg-white text-black font-mono font-bold italic px-2 py-1 rounded-sm tracking-widest text-sm">
                                    {card.cvv}
                                </div>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1 text-right w-full">Security Code</p>


                            <div className="flex gap-2 mt-4 opacity-50">
                                <div className="w-8 h-5 bg-white/10 rounded" />
                                <div className="w-8 h-5 bg-white/10 rounded" />
                            </div>
                        </div>

                        <div className="p-3 bg-black/20 text-center">
                            <p className="text-[8px] text-slate-500">
                                This card is property of Straight Bank. If found, please return to nearest branch.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <p className="text-slate-400 text-sm mb-8 animate-pulse">Tap card to flip</p>

            {/* Actions Grid */}
            <div className="grid grid-cols-3 gap-6 mb-8 w-full max-w-sm">
                <OptionButton
                    icon={card.isFrozen ? Lock : Smartphone} // Using Smartphone as 'Unlock' icon equivalent for now, or Lock with color
                    isActive={card.isFrozen}
                    label={card.isFrozen ? "Unfreeze" : "Freeze"}
                    onClick={handleToggleFreeze}
                    color={card.isFrozen ? "bg-red-500 text-white" : undefined}
                />
                <OptionButton icon={Smartphone} label="Mobile Pay" />
                <OptionButton icon={Settings} label="Settings" />
            </div>

            {/* Detailed Card Information Table */}
            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-white/5 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">Card Details</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">Available</span>
                        <span className="text-emerald-400 font-bold font-mono">
                            {userAuth.privacyMode ? '••••••' : `$${(userAuth?.profile?.mainBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Card Number Row */}
                    <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest">Card Number</label>
                        <div className="flex items-center justify-between">
                            <p className="font-mono text-white tracking-widest">
                                {showNumber
                                    ? (card.number.match(/.{1,4}/g)?.join(' ') || card.number)
                                    : `•••• •••• •••• ${card.number.slice(-4)}`
                                }
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleCopy(card.number)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    {copiedState.field === card.number ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setShowNumber(!showNumber)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    {showNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Holder Name */}
                        <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
                            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Card Holder</label>
                            <p className="font-medium text-white text-sm truncate">{card.holderName}</p>
                        </div>

                        {/* Expiry */}
                        <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
                            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Expires</label>
                            <p className="font-mono text-white text-sm">{card.expiry}</p>
                        </div>
                    </div>

                    {/* CVV Row */}
                    <div className="flex flex-col gap-1 pt-1">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest">CVV / CVC</label>
                        <div className="flex items-center justify-between">
                            <p className="font-mono text-white tracking-widest">
                                {showCvv ? card.cvv : '•••'}
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleCopy(card.cvv)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    {copiedState.field === card.cvv ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setShowCvv(!showCvv)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats / Ledger Section */}
            <div className="w-full max-w-md bg-slate-900/50 rounded-3xl p-6 border border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold">Monthly Limit</h3>
                    <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
                        {(['1D', '1W', '1M'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setTimeFilter(filter)}
                                className={`text-[10px] px-2 py-0.5 rounded-md transition-all ${timeFilter === filter ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-white font-bold">${spent.toFixed(2)} <span className="text-slate-500 font-normal">spent</span></span>
                    <span className="text-slate-400">${limitAmount}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600"
                    />
                </div>
            </div>

            <div className="w-full max-w-md mt-6 pb-12">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold">Recent Activity</h3>
                    <button className="text-primary-400 text-sm">See All</button>
                </div>
                <div className="space-y-4">
                    {transactions.length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-sm">No transactions in this period</div>
                    ) : (
                        transactions.map((tx) => (
                            <TransactionItem
                                key={tx.id}
                                name={tx.recipientName || 'Merchant'}
                                time={tx.timestamp?.toDate().toLocaleDateString() || 'Unknown'}
                                amount={-tx.amount} // Ledger shows spends as negative for clarity
                                hidden={userAuth.privacyMode}
                            />
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const OptionButton = ({ icon: Icon, label, onClick, isActive, color }: { icon: any, label: string, onClick?: () => void, isActive?: boolean, color?: string }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-3 group"
    >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg group-hover:scale-110 ${isActive ? (color || 'bg-primary-500 text-white') : 'bg-slate-800 text-slate-300 group-hover:bg-primary-500 group-hover:text-white'
            }`}>
            <Icon className="w-6 h-6" />
        </div>
        <span className={`text-xs font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{label}</span>
    </button>
);

const TransactionItem = ({ name, time, amount, hidden }: { name: string, time: string, amount: number, hidden?: boolean }) => (
    <div className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <RotateCcw className="w-5 h-5" />
            </div>
            <div>
                <p className="text-white font-bold text-sm">{name}</p>
                <p className="text-slate-500 text-xs">{time}</p>
            </div>
        </div>
        <span className={`font-bold ${amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
            {hidden ? '••••••' : `${amount < 0 ? '-' : '+'}$${Math.abs(amount).toFixed(2)}`}
        </span>
    </div>
);

export default CardDetailView;
