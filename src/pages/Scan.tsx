import React, { useState } from 'react';
import { X, Zap, CreditCard, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';

const Scan: React.FC = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState('');
    const [processing, setProcessing] = useState(false);
    const [cameraActive, setCameraActive] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleError = (err: any) => {
        console.error(err);
        const msg = err?.message || 'Unknown camera error';
        setError(msg);
        toast.error('Camera error: ' + msg);
    };

    const retryCamera = () => {
        setError(null);
        setCameraActive(false);
        setTimeout(() => setCameraActive(true), 100);
    };

    const handleScan = (detectedCodes: any[]) => {
        if (processing || !detectedCodes.length) return;
        const data = detectedCodes[0].rawValue;
        if (!data) return;

        setProcessing(true);
        setResult(data);
        setCameraActive(false); // Pause camera

        try {
            // Try JSON format first
            const parsed = JSON.parse(data);

            // Handle P2P Transfers (Standardized & Legacy)
            if (parsed.type === 'P2P' || parsed.type === 'P2P_RECEIVE') {
                const target = parsed.account || parsed.target;
                toast.success(`Found User: ${parsed.name || target}`);
                setTimeout(() => {
                    navigate(`/transfer?to=${target}&name=${encodeURIComponent(parsed.name || '')}`);
                }, 800);

                // Handle Payment Gateway (Standardized & Legacy)
            } else if (parsed.type === 'TRAIN_PAY' || parsed.type === 'PAYMENT') {
                const id = parsed.trxId || parsed.trId;
                if (!id) throw new Error("Missing Transaction ID");

                // toast.info('Redirecting to Secure Gateway...');
                // const coreUrl = import.meta.env.VITE_CORE_API_URL || 'http://localhost:3000/api';
                // const baseUrl = coreUrl.replace(/\/api\/?$/, '');

                setTimeout(() => {
                    navigate(`/payment?transactionId=${id}`);
                }, 800);
            } else {
                toast.error('Unknown QR type: ' + parsed.type);
                setProcessing(false);
                setCameraActive(true);
            }
        } catch {
            // Legacy format fallback
            if (data.startsWith('P2P:')) {
                const account = data.split(':')[1];
                toast.success(`Found account: ${account}`);
                setTimeout(() => navigate(`/transfer?to=${account}`), 800);
                const id = data.split(':')[1];
                // toast.info('Redirecting to payment...');
                setTimeout(() => { navigate(`/payment?transactionId=${id}`); }, 800);
            } else {
                toast.error('Unknown QR Format');
                setProcessing(false);
                setCameraActive(true);
            }
        }
    };



    // Simulation logic (kept for fallback/testing)
    const simulateP2P = () => handleScan([{
        rawValue: JSON.stringify({
            type: 'P2P',
            account: '1234567890',
            name: 'Sakura Tanaka'
        })
    }]);

    const simulateTrainPay = () => handleScan([{
        rawValue: JSON.stringify({
            type: 'TRAIN_PAY',
            trxId: 'checkout_demo_123'
        })
    }]);

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
                style={{ pointerEvents: 'auto' }} // Ensure clickable over layers
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
                className="relative w-72 h-72 z-10 overflow-hidden rounded-3xl border-2 border-white/10 shadow-2xl bg-black"
            >
                {cameraActive && !error ? (
                    <div className="w-full h-full relative">
                        <Scanner
                            onScan={handleScan}
                            onError={handleError}
                            components={{
                                onOff: false,
                                torch: false,
                                zoom: false,
                                finder: false,
                            }}
                            styles={{
                                container: { width: '100%', height: '100%' },
                                video: { width: '100%', height: '100%', objectFit: 'cover' }
                            }}
                        />
                        {/* Scanner line overlay */}
                        <motion.div
                            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent shadow-[0_0_15px_rgba(124,58,237,0.8)] z-20 pointer-events-none"
                            animate={{ top: ['10%', '90%', '10%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                        {/* Corner markers */}
                        <div className="absolute inset-4 pointer-events-none z-20">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-lg" />
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white/50 p-4 text-center">
                        {error ? (
                            <>
                                <X className="w-12 h-12 text-red-500 mb-2" />
                                <p className="text-red-400 text-xs mb-4">{error}</p>
                                <button
                                    onClick={retryCamera}
                                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white text-xs font-bold transition"
                                >
                                    Retry Camera
                                </button>
                            </>
                        ) : (
                            // Loading/Processing state
                            processing ? (
                                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <button
                                    onClick={() => setCameraActive(true)}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <Camera className="w-12 h-12 opacity-20 group-hover:opacity-100 transition" />
                                    <span className="text-xs">Tap to Start Camera</span>
                                </button>
                            )
                        )}
                    </div>
                )}
            </motion.div>

            {/* Simulation buttons (Fallback) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-10 space-y-3 w-64 z-10"
            >
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-px bg-white/10 flex-1" />
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest">Or Simulate</p>
                    <div className="h-px bg-white/10 flex-1" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={simulateP2P}
                        disabled={processing}
                        className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-2 transition-all disabled:opacity-50"
                    >
                        <Zap className="w-4 h-4 text-primary-400" />
                        Ref P2P
                    </button>

                    <button
                        onClick={simulateTrainPay}
                        disabled={processing}
                        className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl text-xs font-semibold flex flex-col items-center gap-2 transition-all disabled:opacity-50"
                    >
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        TrainPay
                    </button>
                </div>
            </motion.div>

            {/* Scanned result toast (redundant with sonner but good for debug) */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none"
                    >
                        <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                            <p className="text-primary-300 text-xs font-mono">
                                Processing...
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Scan;
