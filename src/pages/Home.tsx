import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import VirtualCard from '../components/VirtualCard';
// import Layout from '../components/Layout'; // Need to create layout!
import { formatCurrency } from '../utils/format';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Skeleton } from '../components/Skeleton';
// import { Transaction } from '../types'; // Define types later

const Home: React.FC = () => {
    const { user, profile } = useAuth();
    const [showBalance, setShowBalance] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingTx, setLoadingTx] = useState(true);

    useEffect(() => {
        if (!user) return;



        // Actually, let's just show recent activity. 
        // For production app, use Cloud Functions to fan out or 'participants' array.
        // I will use a composite query if rules allow, or just 'senderId' for MVP simulation.
        // Let's assume we want to see both. 
        // Workaround: Two listeners.

        const qSent = query(collection(db, 'transactions'), where('senderId', '==', user.uid), orderBy('timestamp', 'desc'), limit(5));
        const qReceived = query(collection(db, 'transactions'), where('recipientId', '==', user.uid), orderBy('timestamp', 'desc'), limit(5));

        const unsubSent = onSnapshot(qSent, (snap) => {
            const sent = snap.docs.map(d => ({ id: d.id, ...d.data(), direction: 'out' }));
            setTransactions(prev => [...sent, ...prev.filter(t => t.direction === 'in')].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10));
            setLoadingTx(false);
        });

        const unsubRecv = onSnapshot(qReceived, (snap) => {
            const received = snap.docs.map(d => ({ id: d.id, ...d.data(), direction: 'in' }));
            setTransactions(prev => [...prev.filter(t => t.direction === 'out'), ...received].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10));
            setLoadingTx(false);
        });

        return () => { unsubSent(); unsubRecv(); };
    }, [user]);

    return (
        <div className="p-6 space-y-6 pb-24">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Hello, {profile?.displayName || 'User'}</h1>
                    <p className="text-slate-500">Welcome back</p>
                </div>
                <button onClick={() => setShowBalance(!showBalance)} className="p-2 bg-slate-100 rounded-full">
                    {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </header>

            <section>
                <VirtualCard showBalance={showBalance} />
            </section>

            <section>
                <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
                <div className="space-y-3">
                    {loadingTx ? (
                        [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)
                    ) : transactions.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">No recent activity</p>
                    ) : (
                        transactions.map(tx => (
                            <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${tx.direction === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {tx.direction === 'in' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{tx.direction === 'in' ? 'Received' : 'Sent'}</p>
                                        <p className="text-xs text-slate-400">{tx.timestamp?.toDate().toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${tx.direction === 'in' ? 'text-green-600' : 'text-slate-900'}`}>
                                    {tx.direction === 'in' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
