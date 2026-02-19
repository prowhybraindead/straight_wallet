import React, { useState, useEffect } from 'react';
import {
    ArrowUpRight, ArrowDownLeft, Send, QrCode, CreditCard,
    LogOut, Moon, Sun, ArrowDownToLine, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import VirtualCard from '../components/VirtualCard';
import { formatCurrency } from '../utils/format';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Skeleton } from '../components/Skeleton';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { groupTransactionsByDate } from '../utils/transaction';

const Home: React.FC = () => {
    const { user, profile, logout, privacyMode, togglePrivacyMode } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    // const [showBalance, setShowBalance] = useState(true); // Moved to AuthContext
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingTx, setLoadingTx] = useState(true);

    useEffect(() => {
        if (!user) return;

        const qSent = query(
            collection(db, 'transactions'),
            where('senderId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(5)
        );
        const qReceived = query(
            collection(db, 'transactions'),
            where('recipientId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(5)
        );

        let sentTx: any[] = [];
        let recvTx: any[] = [];

        const unsubSent = onSnapshot(qSent, (snap) => {
            sentTx = snap.docs.map(d => ({ id: d.id, ...d.data(), direction: 'out' }));
            mergeTransactions();
        });

        const unsubRecv = onSnapshot(qReceived, (snap) => {
            recvTx = snap.docs.map(d => ({ id: d.id, ...d.data(), direction: 'in' }));
            mergeTransactions();
        });

        function mergeTransactions() {
            const all = [...sentTx, ...recvTx];
            const seen = new Set<string>();
            const unique = all.filter(t => {
                if (seen.has(t.id)) return false;
                seen.add(t.id);
                return true;
            });
            unique.sort((a, b) => {
                const aT = a.timestamp?.toDate?.()?.getTime?.() || 0;
                const bT = b.timestamp?.toDate?.()?.getTime?.() || 0;
                return bT - aT;
            });
            setTransactions(unique.slice(0, 10));
            setLoadingTx(false);
        }

        return () => { unsubSent(); unsubRecv(); };
    }, [user]);

    const quickActions = [
        { name: 'Send', icon: Send, color: 'from-primary-500 to-primary-600', path: '/transfer' },
        { name: 'Receive', icon: ArrowDownToLine, color: 'from-accent-500 to-accent-600', path: '/receive' },
        { name: 'Scan', icon: QrCode, color: 'from-emerald-500 to-teal-600', path: '/scan' },
        { name: 'Card', icon: CreditCard, color: 'from-orange-500 to-rose-500', path: '/card' },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="p-5 space-y-6 pt-8">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Welcome back</p>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                        {profile?.displayName || 'User'} ✨
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePrivacyMode}
                        className={`p-2.5 rounded-xl ${privacyMode ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'} hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors`}
                    >
                        {privacyMode ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9, rotate: 180 }}
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={logout}
                        className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                        <LogOut className="w-4.5 h-4.5" />
                    </motion.button>
                </div>
            </motion.header>

            {/* Virtual Card */}
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <VirtualCard showBalance={!privacyMode} onToggleBalance={togglePrivacyMode} />
            </motion.section>

            {/* Quick Actions */}
            <motion.section
                variants={container}
                initial="hidden"
                animate="show"
            >
                <div className="grid grid-cols-4 gap-3">
                    {quickActions.map((action) => (
                        <motion.button
                            key={action.name}
                            variants={item}
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ y: -3 }}
                            onClick={() => navigate(action.path)}
                            className="flex flex-col items-center gap-2 py-3"
                        >
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg`}>
                                <action.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{action.name}</span>
                        </motion.button>
                    ))}
                </div>
            </motion.section>

            {/* Recent Transactions */}
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold dark:text-white">Recent Activity</h3>
                    <button
                        onClick={() => navigate('/analysis')}
                        className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                    >
                        View All →
                    </button>
                </div>

                <div className="space-y-4">
                    {loadingTx ? (
                        [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
                    ) : transactions.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center"
                        >
                            <div className="text-4xl mb-3">💸</div>
                            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">No transactions yet</p>
                            <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">Send or receive money to get started</p>
                        </motion.div>
                    ) : (
                        groupTransactionsByDate(transactions).map((group, groupIndex) => (
                            <div key={group.date}>
                                <div className="sticky top-0 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm py-2 z-10 px-1">
                                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                        {group.date}
                                    </h4>
                                </div>
                                <div className="space-y-2.5">
                                    {group.transactions.map((tx, index) => (
                                        <motion.div
                                            key={tx.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: (groupIndex * 0.1) + (index * 0.05) }}
                                            className="bg-white dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center hover:shadow-md dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer"
                                            onClick={() => navigate('/analysis')}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.direction === 'in'
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                                                    }`}>
                                                    {tx.direction === 'in' ? <ArrowDownLeft className="w-4.5 h-4.5" /> : <ArrowUpRight className="w-4.5 h-4.5" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm dark:text-white line-clamp-1">
                                                        {tx.direction === 'in' ? (tx.senderName || 'Received') : (tx.recipientName || 'Sent')}
                                                        {tx.category && tx.category !== 'Transfer' && ` · ${tx.category}`}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                                        {tx.timestamp?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`font-bold text-sm ${tx.direction === 'in'
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-slate-900 dark:text-white'
                                                }`}>
                                                {privacyMode ? '••••••' : `${tx.direction === 'in' ? '+' : '-'}${formatCurrency(tx.amount)}`}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.section>
        </div>
    );
};

export default Home;
