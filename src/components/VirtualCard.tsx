import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { History, Wifi } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/format';

interface VirtualCardProps {
    showBalance: boolean;
}

const VirtualCard: React.FC<VirtualCardProps> = ({ showBalance }) => {
    const { profile } = useAuth();
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="w-full h-56 perspective-1000 cursor-pointer" onClick={handleFlip}>
            <motion.div
                className="relative w-full h-full text-white"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 shadow-xl flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-2 rounded-full">
                                <History className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-bold text-lg tracking-wider">TRAIN CREDIT</span>
                        </div>
                        <Wifi className="w-8 h-8 opacity-70 rotate-90" />
                    </div>

                    <div className="my-4">
                        <div className="flex gap-4">
                            <div className="w-12 h-8 bg-yellow-400/80 rounded-md"></div>
                            {/* Chip simulation */}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <p className="text-sm opacity-80 mb-1">Current Balance</p>
                        <h2 className="text-3xl font-bold tracking-tight">
                            {showBalance ? formatCurrency(profile?.balance || 0) : '••••••••'}
                        </h2>
                    </div>
                </div>

                {/* Back */}
                <div
                    className="absolute w-full h-full backface-hidden rounded-2xl bg-gradient-to-bl from-slate-800 to-slate-900 p-6 shadow-xl flex flex-col justify-between rotate-y-180"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <div className="w-full h-10 bg-black/40 -mx-6 mt-4"></div>

                    <div className="flex flex-col gap-2 mt-4 px-2">
                        <label className="text-xs uppercase opacity-70">Account Number</label>
                        <p className="font-mono text-xl tracking-widest">{profile?.accountNumber || '0000 0000 0000'}</p>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] opacity-70">VALID THRU</span>
                            <span className="font-mono">12/30</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] opacity-70">CVV</span>
                            <span className="font-mono bg-white text-black px-2 py-1 rounded">***</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VirtualCard;
