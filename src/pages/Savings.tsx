import React, { useState, useEffect, useCallback } from 'react';
import { Plus, PiggyBank, ArrowDownToLine, ArrowUpFromLine, Trash2, Loader2, X } from 'lucide-react';
import { useTransaction, type SavingsJar } from '../hooks/useTransaction';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../utils/format';

const JAR_COLORS = [
    'from-blue-500 to-cyan-400',
    'from-purple-500 to-pink-400',
    'from-emerald-500 to-teal-400',
    'from-orange-500 to-rose-400',
    'from-indigo-500 to-violet-400',
    'from-rose-500 to-red-400',
];

const JAR_ICONS = ['🎯', '✈️', '💻', '🏠', '🎓', '🎮', '🚗', '💍', '🎵', '📱'];

const Savings: React.FC = () => {
    const { profile } = useAuth();
    const { getSavingsJars, createSavingsJar, depositToJar, withdrawFromJar, deleteJar, loading } = useTransaction();

    const [jars, setJars] = useState<SavingsJar[]>([]);
    const [loadingJars, setLoadingJars] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [activeJar, setActiveJar] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'deposit' | 'withdraw' | null>(null);
    const [actionAmount, setActionAmount] = useState('');

    // New jar form
    const [newName, setNewName] = useState('');
    const [newGoal, setNewGoal] = useState('');
    const [newColor, setNewColor] = useState(JAR_COLORS[0]);
    const [newIcon, setNewIcon] = useState('🎯');

    const loadJars = useCallback(async () => {
        try {
            const data = await getSavingsJars();
            setJars(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingJars(false);
        }
    }, [getSavingsJars]);

    useEffect(() => {
        loadJars();
    }, [loadJars]);

    const handleCreate = async () => {
        if (!newName.trim() || !newGoal || parseFloat(newGoal) <= 0) {
            toast.error('Fill in all fields');
            return;
        }
        try {
            await createSavingsJar(newName, parseFloat(newGoal), newColor, newIcon);
            toast.success('Jar created! 🎉');
            setShowCreate(false);
            setNewName('');
            setNewGoal('');
            loadJars();
        } catch (err: any) {
            toast.error(err.message || 'Failed to create jar');
        }
    };

    const handleAction = async () => {
        if (!activeJar || !actionAmount || parseFloat(actionAmount) <= 0) return;
        try {
            if (actionType === 'deposit') {
                await depositToJar(activeJar, parseFloat(actionAmount));
                toast.success('Deposited! 💰');
            } else {
                await withdrawFromJar(activeJar, parseFloat(actionAmount));
                toast.success('Withdrawn! 💸');
            }
            setActionType(null);
            setActiveJar(null);
            setActionAmount('');
            loadJars();
        } catch (err: any) {
            toast.error(err.message || 'Action failed');
        }
    };

    const handleDelete = async (jarId: string) => {
        if (!confirm('Delete this jar? Any remaining balance will be returned to your wallet.')) return;
        try {
            await deleteJar(jarId);
            toast.success('Jar deleted');
            loadJars();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete');
        }
    };

    const totalSaved = jars.reduce((sum, jar) => sum + (jar.current || 0), 0);

    return (
        <div className="p-5 pt-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center mb-6"
            >
                <div>
                    <h1 className="text-2xl font-black dark:text-white">Savings Jars</h1>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        Total saved: <span className="font-bold text-primary-500">{formatCurrency(totalSaved)}</span>
                    </p>
                </div>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCreate(true)}
                    className="p-2.5 bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-xl shadow-lg shadow-primary-500/20"
                >
                    <Plus className="w-5 h-5" />
                </motion.button>
            </motion.div>

            {/* Jars grid */}
            {loadingJars ? (
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2].map(i => (
                        <div key={i} className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    ))}
                </div>
            ) : jars.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                >
                    <div className="text-5xl mb-4">🏦</div>
                    <h3 className="text-lg font-bold dark:text-white mb-1">No Savings Jars</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mb-4 max-w-xs">
                        Create your first jar to start saving towards your goals!
                    </p>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreate(true)}
                        className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg"
                    >
                        Create a Jar
                    </motion.button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {jars.map((jar, index) => {
                        const progress = jar.goal > 0 ? Math.min((jar.current / jar.goal) * 100, 100) : 0;
                        return (
                            <motion.div
                                key={jar.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col gap-3 relative group"
                            >
                                {/* Delete button */}
                                <button
                                    onClick={() => handleDelete(jar.id)}
                                    className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>

                                <div className="flex items-center gap-2">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${jar.color || JAR_COLORS[0]} flex items-center justify-center text-lg shadow-sm`}>
                                        {jar.icon || '🎯'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm dark:text-white truncate">{jar.name}</h3>
                                        <p className="text-[10px] text-slate-400">Goal: {formatCurrency(jar.goal)}</p>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div>
                                    <div className="flex justify-between text-[10px] mb-1">
                                        <span className="font-bold text-primary-500">{formatCurrency(jar.current)}</span>
                                        <span className="text-slate-400">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full bg-gradient-to-r ${jar.color || JAR_COLORS[0]} rounded-full`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1.5">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => { setActiveJar(jar.id); setActionType('deposit'); }}
                                        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1"
                                    >
                                        <ArrowDownToLine className="w-3 h-3" /> Add
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => { setActiveJar(jar.id); setActionType('withdraw'); }}
                                        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 flex items-center justify-center gap-1"
                                    >
                                        <ArrowUpFromLine className="w-3 h-3" /> Take
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* ═══ CREATE JAR MODAL ═══ */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end justify-center p-4"
                        onClick={() => setShowCreate(false)}
                    >
                        <motion.div
                            initial={{ y: 200, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 200, opacity: 0 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md space-y-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-black dark:text-white">New Savings Jar</h3>
                                <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Name</label>
                                <input
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    placeholder="e.g. Vacation Fund"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Goal Amount ($)</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    placeholder="2000"
                                    value={newGoal}
                                    onChange={e => setNewGoal(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Icon</label>
                                <div className="flex flex-wrap gap-2">
                                    {JAR_ICONS.map(icon => (
                                        <button
                                            key={icon}
                                            onClick={() => setNewIcon(icon)}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${newIcon === icon ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-400 scale-110' : 'bg-slate-100 dark:bg-slate-800'
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Color</label>
                                <div className="flex gap-2">
                                    {JAR_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setNewColor(c)}
                                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${c} transition-all ${newColor === c ? 'ring-2 ring-offset-2 ring-primary-400 scale-110' : ''
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleCreate}
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><PiggyBank className="w-5 h-5" /> Create Jar</>}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ DEPOSIT/WITHDRAW MODAL ═══ */}
            <AnimatePresence>
                {actionType && activeJar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end justify-center p-4"
                        onClick={() => { setActionType(null); setActiveJar(null); }}
                    >
                        <motion.div
                            initial={{ y: 200, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 200, opacity: 0 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md space-y-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-black dark:text-white">
                                    {actionType === 'deposit' ? '💰 Deposit' : '💸 Withdraw'}
                                </h3>
                                <button onClick={() => { setActionType(null); setActiveJar(null); }} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {actionType === 'deposit'
                                    ? `Available balance: ${formatCurrency(profile?.mainBalance || 0)}`
                                    : `Jar balance: ${formatCurrency(jars.find(j => j.id === activeJar)?.current || 0)}`
                                }
                            </p>

                            <input
                                type="number"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-2xl font-bold text-center"
                                placeholder="0.00"
                                value={actionAmount}
                                onChange={e => setActionAmount(e.target.value)}
                            />

                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleAction}
                                disabled={loading || !actionAmount}
                                className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 ${actionType === 'deposit'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                    : 'bg-gradient-to-r from-rose-500 to-pink-500'
                                    }`}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (actionType === 'deposit' ? 'Deposit' : 'Withdraw')}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Savings;
