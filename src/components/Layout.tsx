import React, { type ReactNode } from 'react';
import BottomNav from './BottomNav';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
            <main>{children}</main>
            <BottomNav />
        </div>
    );
};

export default Layout;
