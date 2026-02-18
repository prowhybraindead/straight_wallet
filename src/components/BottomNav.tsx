import React from 'react';
import { Home, ArrowRightLeft, ScanLine, PieChart, PiggyBank } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { name: 'Home', icon: Home, path: '/' },
        { name: 'Transfer', icon: ArrowRightLeft, path: '/transfer' },
        { name: 'Scan', icon: ScanLine, path: '/scan', primary: true },
        { name: 'Analysis', icon: PieChart, path: '/analysis' },
        { name: 'Savings', icon: PiggyBank, path: '/savings' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <div className="glass dark:glass-dark border-t border-white/20 dark:border-white/5 px-4 py-2 pb-6 safe-area-bottom">
                <div className="flex justify-between items-center max-w-md mx-auto">
                    {tabs.map((tab) => {
                        const isActive = location.pathname === tab.path;
                        const Icon = tab.icon;

                        if (tab.primary) {
                            return (
                                <motion.button
                                    key={tab.path}
                                    onClick={() => navigate(tab.path)}
                                    whileTap={{ scale: 0.85 }}
                                    whileHover={{ scale: 1.1 }}
                                    className={cn(
                                        "relative -mt-8 p-4 rounded-2xl shadow-lg transition-all duration-300",
                                        "bg-gradient-to-br from-primary-500 to-accent-500",
                                        "text-white shadow-primary-500/30 dark:shadow-primary-500/50",
                                        "hover:shadow-xl hover:shadow-primary-500/40"
                                    )}
                                >
                                    <Icon className="w-7 h-7" />
                                    {/* Glow ring */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 opacity-0 hover:opacity-20 transition-opacity" />
                                </motion.button>
                            );
                        }

                        return (
                            <motion.button
                                key={tab.path}
                                onClick={() => navigate(tab.path)}
                                whileTap={{ scale: 0.9 }}
                                className={cn(
                                    "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300",
                                    isActive
                                        ? "text-primary-500 dark:text-primary-400"
                                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                )}
                            >
                                <div className="relative">
                                    <Icon className="w-5 h-5" />
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500"
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </div>
                                <span className="text-[10px] font-semibold">{tab.name}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BottomNav;
