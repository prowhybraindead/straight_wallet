import React, { useState } from 'react';
import { QrCode, X, Zap, Smartphone, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const Scan: React.FC = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleScan = (data: string) => {
        if (!data || processing) return;
        setProcessing(true);
        setResult(data);

        try {
            // Try JSON format first
            const parsed = JSON.parse(data);

            if (parsed.type === 'P2P') {
                toast.success(`Found: ${parsed.name || 'User'}`);
                setTimeout(() => {
                    navigate(`/transfer?to=${parsed.account}&name=${encodeURIComponent(parsed.name || '')}`);
                }, 800);
            } else if (parsed.type === 'TRAIN_PAY') {
                toast.info('Redirecting to payment...');
                const coreUrl = import.meta.env.VITE_CORE_API_URL || 'http://localhost:3000/api';
                const baseUrl = coreUrl.replace(/\/api\/?$/, '');
                setTimeout(() => {
                    window.location.href = `${baseUrl}/pay/${parsed.trxId}`;
                }, 800);
            } else {
                toast.error('Unknown QR type');
            }
        } catch {
            // Legacy format fallback
            if (data.startsWith('P2P:')) {
                const account = data.split(':')[1];
                toast.success(`Found account: ${account}`);
                setTimeout(() => navigate(`/transfer?to=${account}`), 800);
            } else if (data.startsWith('TRAIN_PAY:')) {
                const id = data.split(':')[1];
                const coreUrl = import.meta.env.VITE_CORE_API_URL || 'http://localhost:3000/api';
                const baseUrl = coreUrl.replace(/\/api\/?$/, '');
                toast.info('Redirecting to payment...');
                setTimeout(() => { window.location.href = `${baseUrl}/pay/${id}`; }, 800);
            } else {
                toast.error('Unknown QR Format');
            }
        }

        setTimeout(() => setProcessing(false), 1500);
    };

    // Simulation data
    const simulateP2P = () => handleScan(JSON.stringify({
        type: 'P2P',
        account: '1234567890',
        name: 'Sakura Tanaka'
    }));

    const simulateTrainPay = () => handleScan(JSON.stringify({
        type: 'TRAIN_PAY',
        trxId: 'checkout_demo_123'
    }));

    return (
        <div className="h-full min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient glow effects */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl" />

            {/* Close button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => navigate('/')}
                className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-xl z-20 backdrop-blur-sm transition-colors"
            >
                <X className="w-5 h-5" />
            </motion.button>

            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8 z-10"
            >
                <h1 className="text-white text-xl font-bold mb-1">Scan QR Code</h1>
                <p className="text-slate-400 text-sm">Point your camera at a QR code</p>
            </motion.div>

            {/* Scanner viewport */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 20 }}
                className="relative w-64 h-64 z-10"
            >
                {/* Corner brackets */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-3 border-l-3 border-primary-400 rounded-tl-2xl" />
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-3 border-r-3 border-primary-400 rounded-tr-2xl" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-3 border-l-3 border-accent-400 rounded-bl-2xl" />
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-3 border-r-3 border-accent-400 rounded-br-2xl" />
                </div>

                {/* Scanner line */}
                <motion.div
                    className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent shadow-[0_0_15px_rgba(124,58,237,0.8)]"
                    animate={{ top: ['5%', '95%', '5%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Mock camera feed */}
                <div className="w-full h-full rounded-2xl bg-slate-900/60 backdrop-blur-sm flex items-center justify-center border border-white/5">
                    <div className="flex flex-col items-center gap-3 text-slate-600">
                        <QrCode className="w-12 h-12 opacity-30" />
                        <div className="flex items-center gap-1.5">
                            <Smartphone className="w-3 h-3" />
                            <p className="text-[10px] uppercase tracking-widest">Camera Feed</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Simulation buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-10 space-y-3 w-64 z-10"
            >
                <p className="text-center text-slate-500 text-[10px] uppercase tracking-widest mb-2">Simulation Mode</p>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={simulateP2P}
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all disabled:opacity-50"
                >
                    <Zap className="w-4 h-4" />
                    Simulate P2P Transfer
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={simulateTrainPay}
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-5 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                >
                    <CreditCard className="w-4 h-4" />
                    Simulate TrainPay
                </motion.button>
            </motion.div>

            {/* Scanned result */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-6 z-10"
                    >
                        <p className="text-slate-500 text-[10px] font-mono text-center max-w-[250px] truncate">
                            Scanned: {result}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Scan;
