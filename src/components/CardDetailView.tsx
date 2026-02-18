import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Smartphone, Settings, Lock, RotateCcw, CreditCard } from 'lucide-react';
import type { Card as CardType } from '../types/user';

interface CardDetailViewProps {
    card: CardType;
    onClose: () => void;
}

const CardDetailView: React.FC<CardDetailViewProps> = ({ card, onClose }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isRotating, setIsRotating] = useState(true);

    // Initial 360 rotation effect
    useEffect(() => {
        const timer = setTimeout(() => setIsRotating(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Theme mapping (Must match Card.tsx / generator)
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
    const textColor = card.colorTheme === 'metallic-silver' ? 'text-slate-800' : 'text-white';
    const labelColor = card.colorTheme === 'metallic-silver' ? 'text-slate-600' : 'text-white/60';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[60] bg-slate-50 dark:bg-slate-950 flex flex-col"
        >
            {/* Header */}
            <div className="flex justify-between items-center p-6">
                <button onClick={onClose} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    <X className="w-6 h-6" />
                </button>
                <span className="font-bold text-lg dark:text-white">{card.scheme}</span>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Main Content Scrollable */}
            <div className="flex-1 overflow-y-auto pb-10">

                {/* 3D Card Container */}
                <div className="flex justify-center py-8 perspective-1000">
                    <motion.div
                        className="relative w-80 h-[200px] cursor-pointer preserve-3d"
                        animate={{
                            rotateY: isRotating ? 360 : isFlipped ? 180 : 0,
                            y: isRotating ? [0, -20, 0] : 0
                        }}
                        transition={{
                            rotateY: { duration: isRotating ? 1 : 0.6, ease: "easeInOut" },
                            y: { duration: 1, ease: "easeInOut" }
                        }}
                        onClick={() => !isRotating && setIsFlipped(!isFlipped)}
                    >
                        {/* FRONT FACE */}
                        <div className={`absolute inset-0 backface-hidden rounded-2xl p-6 shadow-2xl ${bgClass} ${textColor} flex flex-col justify-between overflow-hidden border border-white/10`}>
                            {/* Shine */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <div className="flex justify-between items-start">
                                <CreditCard className="w-8 h-8 opacity-80" />
                                <span className="font-bold tracking-wider opacity-80">{card.scheme}</span>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <p className="font-mono text-xl tracking-[0.15em] drop-shadow-md">
                                    {card.number.match(/.{1,4}/g)?.join(' ') || card.number}
                                </p>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className={`text-[10px] uppercase tracking-widest ${labelColor} mb-0.5`}>Card Holder</p>
                                        <p className="font-medium tracking-wide truncate max-w-[150px]">{card.holderName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-[10px] uppercase tracking-widest ${labelColor} mb-0.5`}>Expires</p>
                                        <p className="font-medium tracking-wide">{card.expiry}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BACK FACE */}
                        <div
                            className={`absolute inset-0 backface-hidden rounded-2xl shadow-2xl ${bgClass} flex flex-col justify-center overflow-hidden border border-white/10`}
                            style={{ transform: 'rotateY(180deg)' }}
                        >
                            <div className="w-full h-12 bg-black/80 mt-4 mb-4" />
                            <div className="px-6 relative">
                                <div className="w-[80%] h-10 bg-white/20 flex items-center justify-end px-3 rounded-sm">
                                    <p className="font-mono text-black font-bold italic tracking-widest text-lg">{card.cvv}</p>
                                </div>
                                <p className={`text-[10px] mt-2 ${labelColor}`}>
                                    CVV / CVC Security Code
                                </p>
                            </div>

                            <div className="flex-1" />
                            <div className="p-4 flex items-center justify-center bg-black/10">
                                <p className={`text-[10px] ${labelColor} text-center`}>
                                    Authorized Signature Not Required • For Electronic Use Only
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <p className="text-center text-xs text-slate-400 mb-8 animate-pulse">Tap card to flip</p>

                {/* Actions Grid */}
                <div className="flex justify-center gap-6 mb-10 px-4">
                    <button className="flex flex-col items-center gap-2 group">
                        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-active:scale-95 transition-all">
                            <Lock className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Lock Card</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 group">
                        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-active:scale-95 transition-all">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Mobile Pay</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 group">
                        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-active:scale-95 transition-all">
                            <Settings className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Settings</span>
                    </button>
                </div>

                {/* Stats Section */}
                <div className="px-6 space-y-6">
                    {/* Spending Limit */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-sm dark:text-white">Monthly Limit</h3>
                            <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">Good</span>
                        </div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400">$1,240 spent</span>
                            <span className="font-bold dark:text-white">$5,000</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '25%' }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                            />
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-sm dark:text-white">Recent Activity</h3>
                            <button className="text-primary-500 text-xs font-bold hover:underline">See All</button>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <RotateCcw className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm dark:text-white">Apple Store</p>
                                            <p className="text-xs text-slate-400">Today, 10:23 AM</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-sm dark:text-white">-$129.00</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CardDetailView;
