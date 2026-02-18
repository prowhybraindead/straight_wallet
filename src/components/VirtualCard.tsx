import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, CreditCard, Eye, EyeOff, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/format';
import { toast } from 'sonner';

interface VirtualCardProps {
    showBalance: boolean;
    onToggleBalance?: () => void;
}

const VirtualCard: React.FC<VirtualCardProps> = ({ showBalance, onToggleBalance }) => {
    const { profile } = useAuth();
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handleCopyAccount = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (profile?.accountNumber) {
            navigator.clipboard.writeText(profile.accountNumber);
            toast.success('Account number copied!');
        }
    };

    const cardNumber = profile?.accountNumber
        ? `${profile.accountNumber.slice(0, 4)} ${profile.accountNumber.slice(4, 7)} ${profile.accountNumber.slice(7)}`
        : '•••• ••• •••';

    return (
        <div className="w-full h-56 perspective-1000 cursor-pointer select-none" onClick={handleFlip}>
            <motion.div
                className="relative w-full h-full text-white"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* === FRONT === */}
                <div className="absolute w-full h-full backface-hidden rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/30 dark:shadow-primary-500/20">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-accent-500 to-primary-800 animated-bg" />
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-sm" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10 blur-sm" />
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 shimmer opacity-30" />

                    <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm tracking-[0.2em] uppercase">Straight</span>
                            </div>
                            <Wifi className="w-6 h-6 opacity-70 rotate-90" />
                        </div>

                        {/* Chip */}
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-8 rounded-md bg-gradient-to-br from-yellow-300/90 to-yellow-500/70 border border-yellow-400/30" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <p className="text-xs uppercase tracking-wider opacity-70">Balance</p>
                                {onToggleBalance && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleBalance(); }}
                                        className="opacity-70 hover:opacity-100 transition-opacity"
                                    >
                                        {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                )}
                            </div>
                            <motion.h2
                                className="text-3xl font-black tracking-tight"
                                key={showBalance ? 'show' : 'hide'}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {showBalance ? formatCurrency(profile?.balance || 0) : '••••••'}
                            </motion.h2>
                        </div>
                    </div>
                </div>

                {/* === BACK === */}
                <div
                    className="absolute w-full h-full backface-hidden rounded-3xl overflow-hidden shadow-2xl"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-bl from-slate-800 via-slate-900 to-slate-950" />
                    <div className="absolute inset-0 shimmer opacity-10" />

                    <div className="relative z-10 flex flex-col h-full">
                        {/* Magnetic strip */}
                        <div className="w-full h-12 bg-black/60 mt-6" />

                        <div className="p-6 flex flex-col flex-1 justify-between">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-slate-400">Card Number</label>
                                    <div className="flex items-center gap-2">
                                        <p className="font-mono text-lg tracking-[0.15em] text-white">{cardNumber}</p>
                                        <button
                                            onClick={handleCopyAccount}
                                            className="text-slate-400 hover:text-white transition-colors"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-[10px] uppercase tracking-wider text-slate-400">Name</label>
                                    <p className="font-medium text-sm text-white">{profile?.displayName || 'CARD HOLDER'}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-[9px] uppercase tracking-wider text-slate-400">Valid Thru</span>
                                    <p className="font-mono text-sm text-white">12/30</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] uppercase tracking-wider text-slate-400">CVV</span>
                                    <p className="font-mono text-sm bg-white text-black px-3 py-0.5 rounded-md">***</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VirtualCard;
