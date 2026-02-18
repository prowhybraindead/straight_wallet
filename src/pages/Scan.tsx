import React, { useState } from 'react';
import { QrCode, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Scan: React.FC = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState('');

    const handleScan = (data: string) => {
        if (!data) return;
        setResult(data);

        // Logic to handle P2P vs TRAIN_PAY
        // Format: "P2P:1234567890" or "TRAIN_PAY:uuid"

        if (data.startsWith('P2P:')) {
            const account = data.split(':')[1];
            // Navigate to Transfer with pre-filled account (need to implementing query param or state passing)
            // For now, simple toast
            toast.success(`Found P2P Account: ${account}`);
            // In real app: navigate(`/transfer?to=${account}`)
        } else if (data.startsWith('TRAIN_PAY:')) {
            const id = data.split(':')[1];
            // Navigate to gateway check
            window.location.href = `${import.meta.env.VITE_CORE_API_URL.replace('/api', '')}/pay/${id}`;
            // Assuming Core URL is http://localhost:3000/api -> http://localhost:3000/pay/id
        } else {
            toast.error("Unknown QR Format");
        }
    };

    return (
        <div className="h-screen bg-black flex flex-col items-center justify-center relative">
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 right-6 text-white bg-white/20 p-2 rounded-full z-10"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="relative w-72 h-72 border-2 border-white/30 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-transparent z-10">
                    {/* Overlay Scanner Line */}
                    <div className="w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] animate-[scan_2s_infinite]"></div>
                </div>

                {/* Mock Camera Feed */}
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                    <QrCode className="w-16 h-16 opacity-20" />
                    <p className="absolute bottom-4 text-xs">Camera Permission Required</p>
                </div>
            </div>

            <div className="mt-8 space-y-4">
                <button
                    onClick={() => handleScan('P2P:1234567890')}
                    className="block w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium"
                >
                    Simulate P2P Scan
                </button>
                <button
                    onClick={() => handleScan('TRAIN_PAY:checkout_123')}
                    className="block w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium"
                >
                    Simulate TrainPay Scan
                </button>
                {result && <p className="text-white text-xs text-center mt-4 opacity-50 font-mono">Scanned: {result}</p>}
            </div>
        </div>
    );
};

export default Scan;
