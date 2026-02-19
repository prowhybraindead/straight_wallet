import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, ArrowDownLeft, Calendar, Tag, MessageSquare, CreditCard } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface TransactionDetailViewProps {
    transaction: any;
    onClose: () => void;
}

const TransactionDetailView: React.FC<TransactionDetailViewProps> = ({ transaction, onClose }) => {
    if (!transaction) return null;

    const isIn = transaction.direction === 'in';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header Background */}
                    <div className={`h-32 w-full bg-gradient-to-br ${isIn
                        ? 'from-emerald-500 to-teal-600'
                        : 'from-rose-500 to-orange-600'}`}
                    />

                    {/* Content */}
                    <div className="px-6 pb-8 -mt-12 relative">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full p-2 shadow-xl">
                                <div className={`w-full h-full rounded-full flex items-center justify-center border-4 ${isIn
                                    ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/50 text-emerald-500'
                                    : 'border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/50 text-rose-500'}`}>
                                    {isIn ? <ArrowDownLeft className="w-10 h-10" /> : <ArrowUpRight className="w-10 h-10" />}
                                </div>
                            </div>
                        </div>

                        {/* Amount & Title */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                                {isIn ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                {isIn ? 'Received from' : 'Sent to'} {isIn ? transaction.senderName : transaction.recipientName || 'External'}
                            </p>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-4">
                            {/* Message Bubble */}
                            {transaction.message && (
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 mb-6 relative">
                                    <div className="absolute -top-3 left-6 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700 flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3 text-primary-500" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Message</span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm italic">
                                        "{transaction.message}"
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Date
                                    </p>
                                    <p className="text-sm font-semibold dark:text-slate-200">
                                        {transaction.timestamp?.toDate ? transaction.timestamp.toDate().toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> Category
                                    </p>
                                    <p className="text-sm font-semibold dark:text-slate-200">
                                        {transaction.category || 'Transfer'}
                                    </p>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">
                                        <CreditCard className="w-3 h-3" /> Transaction ID
                                    </p>
                                    <p className="text-xs font-mono text-slate-500 truncate w-32">
                                        {transaction.id}
                                    </p>
                                </div>
                                <button className="text-xs text-primary-500 font-bold hover:underline">
                                    Copy
                                </button>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="mt-8 w-full py-4 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>

                    {/* Close Icon Top Right */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TransactionDetailView;
