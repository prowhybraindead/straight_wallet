import React from 'react';
import QRCode from "react-qr-code";
import { useAuth } from '../contexts/AuthContext';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

const Receive: React.FC = () => {
    const { profile } = useAuth();
    const qrValue = `P2P:${profile?.accountNumber}`;

    const handleCopy = () => {
        if (profile?.accountNumber) {
            navigator.clipboard.writeText(profile.accountNumber);
            toast.success("Account Number Copied!");
        }
    };

    return (
        <div className="p-6 flex flex-col items-center justify-center min-h-[80vh] space-y-8">
            <h1 className="text-2xl font-bold">Receive Money</h1>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                {profile?.accountNumber ? (
                    <QRCode
                        size={200}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={qrValue}
                        viewBox={`0 0 256 256`}
                    />
                ) : (
                    <div className="w-[200px] h-[200px] bg-slate-100 animate-pulse rounded-lg"></div>
                )}
            </div>

            <div className="text-center space-y-2">
                <p className="text-slate-500">Your Account Number</p>
                <div
                    onClick={handleCopy}
                    className="flex items-center gap-2 bg-slate-100 px-6 py-3 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors"
                >
                    <span className="font-mono text-xl font-bold tracking-widest">{profile?.accountNumber}</span>
                    <Copy className="w-5 h-5 text-slate-400" />
                </div>
            </div>

            <p className="text-sm text-slate-400 max-w-xs text-center">
                Scan this code to receive P2P transfers directly to your wallet.
            </p>
        </div>
    );
};

export default Receive;
