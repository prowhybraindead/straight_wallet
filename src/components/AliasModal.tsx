import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const AliasModal = () => {
    const { user, profile, refreshProfile } = useAuth();
    const [alias, setAlias] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // If no user or alias already exists, don't show
    if (!user || !profile || profile.alias) return null;

    const validateAlias = (value: string) => {
        const regex = /^[a-zA-Z0-9_]{3,20}$/;
        return regex.test(value);
    };

    const checkAvailability = async (value: string) => {
        const q = query(collection(db, 'users'), where('alias', '==', value));
        const snapshot = await getDocs(q);
        return snapshot.empty;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const cleanedAlias = alias.trim().toLowerCase();

        if (!validateAlias(cleanedAlias)) {
            setError('3-20 characters. Letters, numbers, underscore only.');
            return;
        }

        setLoading(true);
        try {
            const isAvailable = await checkAvailability(cleanedAlias);
            if (!isAvailable) {
                setError('This alias is already taken.');
                setLoading(false);
                return;
            }

            // Save
            await updateDoc(doc(db, 'users', user.uid), { alias: cleanedAlias });
            setSuccess(true);
            toast.success(`Welcome, @${cleanedAlias}!`);

            // Wait a sec then refresh
            setTimeout(async () => {
                await refreshProfile();
            }, 1000);

        } catch (err: any) {
            console.error(err);
            setError('Failed to set alias. Try again.');
            setLoading(false);
        }
    };

    const usePhone = () => {
        if (profile.phone) {
            setAlias(profile.phone.replace(/\D/g, ''));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
                {/* Background effects */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl rounded-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-500/10 blur-3xl rounded-full" />

                <div className="relative z-10">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4 shadow-lg shadow-primary-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Claim Your Identity</h2>
                        <p className="text-slate-400 text-sm">
                            Choose a unique <span className="text-primary-400 font-mono">@alias</span> to send and receive money.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-lg">@</span>
                                <input
                                    value={alias}
                                    onChange={(e) => {
                                        setAlias(e.target.value.toLowerCase());
                                        setError('');
                                    }}
                                    disabled={loading || success}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors font-mono text-lg"
                                    placeholder="your_name"
                                    autoFocus
                                />
                            </div>
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                                    <AlertCircle className="w-3 h-3" />
                                    {error}
                                </motion.div>
                            )}
                        </div>

                        {profile.phone && !success && (
                            <button
                                type="button"
                                onClick={usePhone}
                                className="text-xs text-slate-500 hover:text-white transition-colors underline"
                            >
                                Use my phone number as alias
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={loading || alias.length < 3 || success}
                            className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all mt-4
                                ${success
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white text-slate-900 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : success ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    All Set!
                                </>
                            ) : (
                                'Claim Alias'
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default AliasModal;
