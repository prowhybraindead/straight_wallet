import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Filter, Calendar } from 'lucide-react';
import { useTransaction, type Transaction } from '../hooks/useTransaction';
import { formatCurrency } from '../utils/format';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';
import TransactionDetailView from '../components/TransactionDetailView';

const Analysis: React.FC = () => {
    const { getTransactionsByUser, CATEGORIES } = useTransaction();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [filterDirection, setFilterDirection] = useState<'all' | 'in' | 'out'>('all');
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    const loadTx = useCallback(async () => {
        try {
            const data = await getTransactionsByUser(100);
            setTransactions(data);
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false);
        }
    }, [getTransactionsByUser]);

    useEffect(() => {
        loadTx();
    }, [loadTx]);

    const filtered = transactions.filter(tx => {
        if (filterDirection !== 'all' && tx.direction !== filterDirection) return false;
        if (filterCategory !== 'All' && tx.category !== filterCategory) return false;
        return true;
    });

    const totalIn = transactions.filter(t => t.direction === 'in').reduce((s, t) => s + t.amount, 0);
    const totalOut = transactions.filter(t => t.direction === 'out').reduce((s, t) => s + t.amount, 0);

    // Spending by category
    const catSpend: Record<string, number> = {};
    transactions.filter(t => t.direction === 'out').forEach(t => {
        const cat = t.category || 'Other';
        catSpend[cat] = (catSpend[cat] || 0) + t.amount;
    });
    const sortedCategories = Object.entries(catSpend).sort((a, b) => b[1] - a[1]);
    const maxCatAmount = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

    const catColors: Record<string, string> = {
        'Transfer': 'from-primary-500 to-primary-600',
        'Food & Drink': 'from-orange-500 to-amber-500',
        'Transport': 'from-blue-500 to-cyan-500',
        'Shopping': 'from-pink-500 to-rose-500',
        'Bills': 'from-red-500 to-rose-600',
        'Entertainment': 'from-purple-500 to-violet-500',
        'Other': 'from-slate-500 to-slate-600',
        'Savings': 'from-emerald-500 to-teal-500',
    };

    return (
        <div className="p-5 pt-8">
            <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-black dark:text-white mb-6"
            >
                Analytics
            </motion.h1>

            {/* Summary cards */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 gap-3 mb-6"
            >
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Income</span>
                    </div>
                    <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                        {loading ? '...' : formatCurrency(totalIn)}
                    </p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-4 border border-rose-100 dark:border-rose-800/30">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowUpRight className="w-4 h-4 text-rose-500" />
                        <span className="text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold">Spent</span>
                    </div>
                    <p className="text-xl font-black text-rose-700 dark:text-rose-300">
                        {loading ? '...' : formatCurrency(totalOut)}
                    </p>
                </div>
            </motion.div>

            {/* Category breakdown */}
            {sortedCategories.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <h3 className="text-sm font-bold dark:text-white mb-3 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-primary-500" /> Spending Breakdown
                    </h3>
                    <div className="space-y-2.5">
                        {sortedCategories.map(([cat, amount], i) => (
                            <motion.div
                                key={cat}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="flex items-center gap-3"
                            >
                                <span className="text-sm font-semibold w-28 truncate dark:text-slate-300">{cat}</span>
                                <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full bg-gradient-to-r ${catColors[cat] || 'from-slate-400 to-slate-500'} rounded-full`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(amount / maxCatAmount) * 100}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: "easeOut" }}
                                    />
                                </div>
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-16 text-right">
                                    {formatCurrency(amount)}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 mb-4"
            >
                {/* Direction filter */}
                <div className="flex gap-2">
                    {(['all', 'in', 'out'] as const).map(dir => (
                        <button
                            key={dir}
                            onClick={() => setFilterDirection(dir)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterDirection === dir
                                ? 'bg-primary-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                }`}
                        >
                            {dir === 'all' ? 'All' : dir === 'in' ? '↓ In' : '↑ Out'}
                        </button>
                    ))}
                </div>

                {/* Category filter */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                        onClick={() => setFilterCategory('All')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filterCategory === 'All'
                            ? 'bg-accent-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                    >
                        All
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filterCategory === cat
                                ? 'bg-accent-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Transaction list */}
            <h3 className="text-sm font-bold dark:text-white mb-3 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" /> History ({filtered.length})
            </h3>

            <div className="space-y-2">
                {loading ? (
                    [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <Filter className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">No transactions found</p>
                    </div>
                ) : (
                    filtered.map((tx, index) => (
                        <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}

                            onClick={() => setSelectedTx(tx)}
                            className="flex justify-between items-center bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:shadow-sm transition-all cursor-pointer active:scale-95"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tx.direction === 'in'
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500'
                                    : 'bg-rose-100 dark:bg-rose-900/30 text-rose-500'
                                    }`}>
                                    {tx.direction === 'in' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-xs dark:text-white">
                                        {tx.direction === 'in'
                                            ? (tx.senderName || 'Received')
                                            : (tx.recipientName || 'Sent')
                                        }
                                    </p>
                                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                        {tx.category && <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{tx.category}</span>}
                                        {tx.timestamp?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <span className={`font-bold text-xs ${tx.direction === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'
                                }`}>
                                {tx.direction === 'in' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>
                        </motion.div>
                    ))
                )}

            </div>

            {/* Detail View Modal */}
            <TransactionDetailView
                transaction={selectedTx}
                onClose={() => setSelectedTx(null)}
            />
        </div>
    );
};

export default Analysis;
