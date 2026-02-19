import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Copy, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';


const Receive: React.FC = () => {
    const { profile } = useAuth();
    const [qrType, setQrType] = useState<'P2P_RECEIVE' | 'PAYMENT'>('P2P_RECEIVE');
    const [amount, setAmount] = useState('');

    const qrData = JSON.stringify({
        type: qrType,
        target: profile?.accountNumber || '',
        name: profile?.displayName || profile?.email || '',
        ...(amount ? { amount: parseFloat(amount) } : {}),
    });

    const handleCopy = () => {
        if (profile?.accountNumber) {
            navigator.clipboard.writeText(profile.accountNumber);
            toast.success('Account number copied!');
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Straight Wallet',
                    text: `Send money to ${profile?.displayName}`,
                    url: `straight://transfer?to=${profile?.accountNumber}&name=${encodeURIComponent(profile?.displayName || '')}`,
                });
            } catch {
                handleCopy();
            }
        } else {
            handleCopy();
        }
    };

    return (
        <div className="p-5 pt-8">
            <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-black dark:text-white mb-6"
            >
                Receive Money
            </motion.h1>

            {/* QR Code */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 20 }}
                className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 flex flex-col items-center border border-slate-100 dark:border-slate-700/50 shadow-lg mb-6"
            >
                {/* QR type toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-5 w-full max-w-xs">
                    <button
                        onClick={() => setQrType('P2P_RECEIVE')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${qrType === 'P2P_RECEIVE' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-400'
                            }`}
                    >
                        Receive
                    </button>
                    <button
                        onClick={() => setQrType('PAYMENT')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${qrType === 'PAYMENT' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400'
                            }`}
                    >
                        Merchant
                    </button>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-inner mb-4">
                    <QRCode
                        value={qrData}
                        size={180}
                        bgColor="#ffffff"
                        fgColor="#1e1b4b"
                        level="H"
                    />
                </div>

                {/* Account info */}
                <div className="text-center">
                    <p className="text-sm font-bold dark:text-white">{profile?.displayName}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">{profile?.accountNumber}</p>
                        <button onClick={handleCopy} className="text-primary-500 hover:text-primary-600">
                            <Copy className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Optional amount */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 mb-4"
            >
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Request Specific Amount (Optional)
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-300 dark:text-slate-600">$</span>
                    <input
                        type="number"
                        className="w-full p-3 pl-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-primary-400 transition-all"
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-3"
            >
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="py-3 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2"
                >
                    <Copy className="w-4 h-4" /> Copy ID
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-primary-500 to-accent-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
                >
                    <Share2 className="w-4 h-4" /> Share
                </motion.button>
            </motion.div>
        </div>
    );
};

export default Receive;
