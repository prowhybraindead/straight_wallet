import React, { type ReactNode } from 'react';
import BottomNav from './BottomNav';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans transition-colors duration-300 flex justify-center">
            <div className="w-full max-w-md relative pb-24">
                <main>{children}</main>
                <BottomNav />
            </div>
        </div>
    );
};

export default Layout;
