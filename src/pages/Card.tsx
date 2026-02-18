import React, { useState } from 'react';
import VirtualCard from '../components/VirtualCard';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/format';
import { motion } from 'framer-motion';
import { Copy, Shield, Smartphone, Snowflake, Settings } from 'lucide-react';
import { toast } from 'sonner';

const Card: React.FC = () => {
    const { profile } = useAuth();
    const [showBalance, setShowBalance] = useState(true);
    const [cardFrozen, setCardFrozen] = useState(false);

    const handleCopy = () => {
        if (profile?.accountNumber) {
            navigator.clipboard.writeText(profile.accountNumber);
            toast.success('Copied!');
        }
    };

    const quickInfo = [
        { label: 'Account Number', value: profile?.accountNumber || '—', copyable: true },
        { label: 'Account Type', value: 'Virtual Debit' },
        { label: 'Status', value: cardFrozen ? '❄️ Frozen' : '✅ Active' },
        { label: 'Available Balance', value: formatCurrency(profile?.balance || 0) },
    ];

    const controls = [
        {
            icon: Snowflake,
            label: cardFrozen ? 'Unfreeze Card' : 'Freeze Card',
            color: cardFrozen ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-500 bg-slate-100 dark:bg-slate-800',
            action: () => {
                setCardFrozen(!cardFrozen);
                toast.success(cardFrozen ? 'Card unfrozen' : 'Card frozen');
            }
        },
        {
            icon: Smartphone,
            label: 'Mobile Pay',
            color: 'text-green-500 bg-green-50 dark:bg-green-900/20',
            action: () => toast.info('Coming soon!')
        },
        {
            icon: Shield,
            label: 'Security',
            color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20',
            action: () => toast.info('Settings coming soon!')
        },
        {
            icon: Settings,
            label: 'Settings',
            color: 'text-slate-500 bg-slate-100 dark:bg-slate-800',
            action: () => toast.info('Settings coming soon!')
        },
    ];

    return (
        <div className="p-5 pt-8">
            <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-black dark:text-white mb-6"
            >
                My Card
            </motion.h1>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                <VirtualCard showBalance={showBalance} onToggleBalance={() => setShowBalance(!showBalance)} />
                <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 mt-2">Tap to flip</p>
            </motion.div>

            {/* Controls */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-4 gap-3 mb-6"
            >
                {controls.map((ctrl) => (
                    <motion.button
                        key={ctrl.label}
                        whileTap={{ scale: 0.9 }}
                        onClick={ctrl.action}
                        className="flex flex-col items-center gap-2"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ctrl.color} transition-colors`}>
                            <ctrl.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{ctrl.label}</span>
                    </motion.button>
                ))}
            </motion.div>

            {/* Card info */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50"
            >
                <h3 className="text-sm font-bold dark:text-white mb-3">Card Details</h3>
                <div className="space-y-3">
                    {quickInfo.map((info) => (
                        <div key={info.label} className="flex justify-between items-center">
                            <span className="text-xs text-slate-400 dark:text-slate-500">{info.label}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold dark:text-white">{info.value}</span>
                                {info.copyable && (
                                    <button onClick={handleCopy} className="text-slate-300 hover:text-primary-500 transition-colors">
                                        <Copy className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Spending limits */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 mt-3"
            >
                <h3 className="text-sm font-bold dark:text-white mb-3">Spending Limits</h3>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Daily Limit</span>
                            <span className="font-semibold dark:text-white">$2,000 / $5,000</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full w-[40%] bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Monthly Limit</span>
                            <span className="font-semibold dark:text-white">$12,500 / $50,000</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full w-[25%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Card;
