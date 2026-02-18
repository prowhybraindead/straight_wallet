import React, { type ReactNode } from 'react';
import BottomNav from './BottomNav';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans transition-colors duration-300">
            <main className="pb-24">{children}</main>
            <BottomNav />
        </div>
    );
};

export default Layout;
