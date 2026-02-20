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
        xl: 'h-14'
    };

    const textSizes = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-4xl'
    };

    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            <motion.div
                className={`relative aspect-square ${sizeClasses[size]} flex items-center justify-center`}
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Premium Geometric 'S' Logo */}
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
                    <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" /> {/* Blue 500 */}
                            <stop offset="100%" stopColor="#a855f7" /> {/* Purple 500 */}
                        </linearGradient>
                        <linearGradient id="logoGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1e3a8a" /> {/* Blue 900 */}
                            <stop offset="100%" stopColor="#581c87" /> {/* Purple 900 */}
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Outer hexagon frame (optional, removed for cleaner look, sticking to pure monogram) */}

                    {/* The Stylized S */}
                    <motion.path
                        d="M 75 30 C 75 10, 25 10, 25 30 C 25 50, 75 50, 75 70 C 75 90, 25 90, 25 70"
                        fill="none"
                        stroke="url(#logoGradient)"
                        strokeWidth="18"
                        strokeLinecap="round"
                        filter="url(#glow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                    />

                    {/* Inner accent line to make it pop and look 3D/folded */}
                    <motion.path
                        d="M 75 30 C 75 10, 25 10, 25 30 C 25 50, 75 50, 75 70 C 75 90, 25 90, 25 70"
                        fill="none"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.2, ease: "easeInOut", delay: 0.1 }}
                    />

                    {/* Small dynamic triangle / arrow indicating forward progress */}
                    <motion.path
                        d="M 45 40 L 65 50 L 45 60 Z"
                        fill="white"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.9 }}
                        transition={{ delay: 1, type: "spring", stiffness: 200 }}
                    />
                </svg>
            </motion.div>

            {variant === 'full' && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className={`font-black tracking-tight ${textSizes[size]} text-white`}
                    style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}
                >
                    STRAIGHT
                </motion.div>
            )}
        </div>
    );
};

export default Logo;
