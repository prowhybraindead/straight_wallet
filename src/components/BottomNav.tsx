import React from 'react';
import { Home, Scan, ArrowRightLeft, PieChart, PiggyBank } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { name: 'Home', icon: Home, path: '/' },
        { name: 'Transfer', icon: ArrowRightLeft, path: '/transfer' },
        { name: 'Scan', icon: Scan, path: '/scan', primary: true },
        { name: 'Analysis', icon: PieChart, path: '/analysis' },
        { name: 'Savings', icon: PiggyBank, path: '/savings' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 py-2 pb-6 safe-area-bottom z-50">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-colors duration-200",
                                isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600",
                                tab.primary && "bg-indigo-600 text-white rounded-full p-3 -mt-8 shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:text-white"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", tab.primary ? "w-7 h-7" : "")} />
                            {!tab.primary && <span className="text-[10px] font-medium">{tab.name}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
