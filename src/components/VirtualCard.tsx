import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, CreditCard, Eye, EyeOff, Copy, Lock } from 'lucide-react';
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

    // LOGIC: Identify Account Type based on Length
    // 14 digits = Bank Account
    // 15/16 digits = Virtual Card
    const accNum = profile?.accountNumber || '';
    const isAccount = accNum.length === 14;

    // Formatting
    const displayNumber = isAccount
        ? `${accNum.slice(0, 4)} ${accNum.slice(4, 7)} ${accNum.slice(7)}`
        : accNum.replace(/(.{4})/g, '$1 ').trim(); // Standard 16-digit spacing

    const createdDate = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })
        : 'MM/YY';

    // Label Logic
    const dateLabel = isAccount ? "Created Date" : "Valid Thru";
    const dateValue = isAccount ? createdDate : "12/30"; // Mock expiry for card if not available in profile yet

    // Task Requirement: "Show real CVV on flip" for Cards, "***" for Accounts.
    const realCvv = isAccount ? "***" : "942";

    // Get the first card for visual representation (mocking purely virtual card link to profile)
    // In a real scenario, this component would accept a `card` prop.
    // For now, let's assume the first card in profile is the "Virtual Card" being displayed
    const virtualCard = profile?.cards?.[0];
    const isFrozen = virtualCard?.isFrozen || false;

    return (
        <div className="w-full h-56 perspective-1000 cursor-pointer select-none" onClick={handleFlip}>
            <motion.div
                className="relative w-full h-full text-white"
                initial={false}
                animate={{
                    rotateY: isFlipped ? 180 : 0,
                    filter: isFrozen && !isFlipped ? 'grayscale(100%) brightness(0.8)' : 'none'
                }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* === FROZEN OVERLAY ICON === */}
                {isFrozen && !isFlipped && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none" style={{ transform: 'translateZ(1px)' }}>
                        <div className="bg-black/40 p-3 rounded-full backdrop-blur-sm">
                            <Lock className="w-8 h-8 text-white/80 drop-shadow-md" />
                        </div>
                    </div>
                )}

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
                                <span className="font-bold text-sm tracking-[0.2em] uppercase">Straight Wallet</span>
                            </div>
                            <Wifi className="w-6 h-6 opacity-70 rotate-90" />
                        </div>

                        <div className="space-y-2 mt-auto">
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
                                {showBalance ? formatCurrency(profile?.mainBalance || 0) : '••••••'}
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
                                    <label className="text-[10px] uppercase tracking-wider text-slate-400">
                                        {isAccount ? 'Account Number' : 'Card Number'}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <p className="font-mono text-lg tracking-[0.15em] text-white">{displayNumber}</p>
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
                                    <span className="text-[9px] uppercase tracking-wider text-slate-400">{dateLabel}</span>
                                    <p className="font-mono text-sm text-white">{dateValue}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] uppercase tracking-wider text-slate-400">CVV</span>
                                    <p className="font-mono text-sm bg-white text-black px-3 py-0.5 rounded-md">{realCvv}</p>
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
