import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard, Shield, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { createNewCard } from '../utils/cardGenerator';
import type { Card as CardType, CardScheme } from '../types/user';
import CardDetailView from '../components/CardDetailView';
import CardIssuerLogo from '../components/ui/CardIssuerLogo';
import { getContrastTheme } from '../utils/colorUtils';

const SCHEMES: { id: CardScheme; name: string; gradient: string }[] = [
    { id: 'VISA', name: 'Visa Signature', gradient: 'bg-gradient-to-br from-blue-600 to-indigo-900' },
    { id: 'MASTERCARD', name: 'Mastercard World', gradient: 'bg-gradient-to-br from-slate-900 to-red-900' },
    { id: 'AMEX', name: 'American Express', gradient: 'bg-gradient-to-br from-slate-300 to-slate-500' },
    { id: 'DISCOVER', name: 'Discover It', gradient: 'bg-gradient-to-br from-orange-500 to-red-600' },
    { id: 'JCB', name: 'JCB Platinum', gradient: 'bg-gradient-to-br from-emerald-600 to-teal-900' },
    { id: 'UNIONPAY', name: 'UnionPay Diamond', gradient: 'bg-gradient-to-br from-rose-600 to-red-900' },
];

const CardPage = () => {
    const { user, profile } = useAuth();
    const [isIssuing, setIsIssuing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

    const handleIssueCard = async (scheme: CardScheme) => {
        if (!user || !profile) return;
        setLoading(true);
        try {
            const newCard = createNewCard(scheme, profile.displayName || 'VALUED MEMBER');

            await updateDoc(doc(db, 'users', user.uid), {
                cards: arrayUnion(newCard)
            });

            toast.success(`${scheme} Card Issued!`);
            setIsIssuing(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to issue card');
        } finally {
            setLoading(false);
        }
    };

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 relative">
                <CreditCard className="w-10 h-10 text-slate-400" />
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -right-2 -top-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-950"
                >
                    <Plus className="w-5 h-5 text-white" />
                </motion.div>
            </div>
            <h2 className="text-2xl font-bold dark:text-white mb-2">No Cards Yet</h2>
            <p className="text-slate-500 text-sm max-w-xs mb-8">
                Issue your first virtual card instantly to start spending worldwide.
            </p>
            <button
                onClick={() => setIsIssuing(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary-500/20 transition-all active:scale-95"
            >
                Issue Virtual Card
            </button>
        </div>
    );

    const CardItem = ({ card }: { card: CardType }) => {
        const getBgClass = (theme: string) => {
            switch (theme) {
                case 'gradient-blue': return 'bg-gradient-to-br from-blue-600 to-indigo-900';
                case 'gradient-black': return 'bg-gradient-to-br from-slate-800 to-black';
                case 'metallic-silver': return 'bg-gradient-to-br from-gray-300 via-gray-100 to-gray-400 text-slate-800';
                case 'gradient-green': return 'bg-gradient-to-br from-emerald-600 to-teal-900';
                default: return 'bg-slate-800';
            }
        };

        const bgClass = getBgClass(card.colorTheme);

        // SMART CONTRAST: Evaluate the background class
        const theme = getContrastTheme(bgClass);
        const textColor = theme === 'dark' ? 'text-slate-900' : 'text-white';
        const labelColor = theme === 'dark' ? 'text-slate-600' : 'text-white/60';

        return (
            <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCard(card)}
                className="relative w-full aspect-[1.586] cursor-pointer mb-4 drop-shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className={`absolute inset-0 rounded-2xl p-6 shadow-xl ${bgClass} ${textColor} flex flex-col justify-between overflow-hidden border border-white/10`}>
                    {/* Shine effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex justify-between items-start">
                        <CardIssuerLogo issuer={card.scheme} className="h-8 w-auto text-white drop-shadow-md opacity-90" theme={theme} />
                        <div className="flex items-center gap-1">
                            {card.status === 'LOCKED' && <Shield className="w-4 h-4 text-red-400" />}
                            <div className="w-8 h-5 bg-yellow-200/80 rounded" /> {/* Chip */}
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <p className="font-mono text-xl tracking-[0.15em] drop-shadow-md">
                            {card.number.match(/.{1,4}/g)?.join(' ') || card.number}
                        </p>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className={`text-[10px] uppercase tracking-widest ${labelColor} mb-0.5`}>Card Holder</p>
                                <p className="font-medium tracking-wide truncate max-w-[180px]">{card.holderName}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-[10px] uppercase tracking-widest ${labelColor} mb-0.5`}>Expires</p>
                                <p className="font-medium tracking-wide">{card.expiry}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="p-5 pt-8 min-h-screen pb-24">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black dark:text-white">Cards</h1>
                {profile?.cards && profile.cards.length > 0 && (
                    <button
                        onClick={() => setIsIssuing(true)}
                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary-500 hover:text-white transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </div>

            {!profile?.cards || profile.cards.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-6">
                    {profile.cards.map((card) => (
                        <CardItem key={card.id} card={card} />
                    ))}
                </div>
            )}

            {/* Issuance Sheet/Modal */}
            <AnimatePresence>
                {isIssuing && (
                    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                            onClick={() => setIsIssuing(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 relative pointer-events-auto max-h-[90vh] overflow-y-auto"
                        >
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />

                            <h3 className="text-xl font-bold dark:text-white mb-2">Select Card Scheme</h3>
                            <p className="text-slate-500 text-sm mb-6">Choose a provider for your new virtual card.</p>

                            <div className="space-y-3">
                                {SCHEMES.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleIssueCard(s.id)}
                                        disabled={loading}
                                        className={`w-full p-4 rounded-xl flex items-center justify-between group overflow-hidden relative border border-slate-100 dark:border-slate-800 hover:border-primary-500/50 transition-all ${loading ? 'opacity-50' : ''}`}
                                    >
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${s.gradient}`} />

                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={`w-12 h-8 rounded-md shadow-sm ${s.gradient} flex items-center justify-center text-[10px] font-bold text-white tracking-tighter border border-white/20`}>
                                                {s.id}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold dark:text-white text-sm">{s.name}</p>
                                                <p className="text-xs text-slate-400">International Debit</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Card Detail View Modal */}
            <AnimatePresence>
                {selectedCard && (
                    <CardDetailView card={selectedCard} onClose={() => setSelectedCard(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CardPage;
