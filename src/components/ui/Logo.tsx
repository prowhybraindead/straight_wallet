import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
    className?: string;
    variant?: 'full' | 'icon';
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', variant = 'full', size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-6',
        md: 'h-8',
        lg: 'h-10',
        xl: 'h-16'
    };

    const textSizes = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl',
        xl: 'text-5xl'
    };

    return (
        <div className={`flex items-center gap-2 select-none ${className}`}>
            <motion.div
                className={`relative aspect-square ${sizeClasses[size]} flex items-center justify-center`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Abstract Wallet/Speed Icon */}
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg overflow-visible">
                    <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" /> {/* Indigo/Violet */}
                            <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan */}
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Main Shape: Stylized 'S' / Wallet Fold */}
                    <motion.path
                        d="M20,30 Q50,5 80,30 T80,70 Q50,95 20,70 T20,30"
                        fill="none"
                        stroke="url(#logoGradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        filter="url(#glow)"
                    />

                    {/* Inner Accent: Speed Line / Coin Slot */}
                    <motion.path
                        d="M35,50 L65,50"
                        stroke="white"
                        strokeWidth="6"
                        strokeLinecap="round"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    />

                    {/* Floating Dot */}
                    <motion.circle
                        cx="70"
                        cy="30"
                        r="6"
                        fill="#fbbf24" // Amber/Gold
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.2, type: "spring" }}
                    />
                </svg>
            </motion.div>

            {variant === 'full' && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className={`font-black tracking-tighter ${textSizes[size]}`}
                >
                    <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
                        STRAIGHT
                    </span>
                </motion.div>
            )}
        </div>
    );
};

export default Logo;
