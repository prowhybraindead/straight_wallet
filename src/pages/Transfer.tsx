import React, { useState } from 'react';
import { useTransaction } from '../hooks/useTransaction';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
// import { Loader2 } from 'lucide-react'; // If needed for spinner

const Transfer: React.FC = () => {
    const { sendMoney, getUserByAccount, loading } = useTransaction();
    const { verifyPin } = useAuth();

    const [step, setStep] = useState(1);
    const [accountNum, setAccountNum] = useState('');
    const [recipient, setRecipient] = useState<any>(null);
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');

    const handleLookup = async () => {
        if (!accountNum) return;
        try {
            const user = await getUserByAccount(accountNum);
            if (user) {
                setRecipient(user);
                setStep(2);
            } else {
                toast.error("User not found");
            }
        } catch (e) {
            toast.error("Error looking up user");
        }
    };

    const handleTransfer = async () => {
        if (!pin || pin.length !== 6) {
            toast.error("Enter valid 6-digit PIN");
            return;
        }

        const isValid = await verifyPin(pin);
        if (!isValid) {
            toast.error("Incorrect PIN");
            return;
        }

        try {
            await sendMoney(accountNum, parseFloat(amount));
            toast.success("Transfer successful!");
            setStep(1);
            setAccountNum('');
            setAmount('');
            setPin('');
            setRecipient(null);
        } catch (e: any) {
            toast.error(e.message || "Transfer failed");
        }
    };

    return (
        <div className="p-6 pb-24">
            <h1 className="text-2xl font-bold mb-6">Transfer Money</h1>

            {step === 1 && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Recipient Account Number (10 digits)</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-lg"
                            placeholder="Enter account number"
                            value={accountNum}
                            onChange={e => setAccountNum(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleLookup}
                        disabled={!accountNum}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {step === 2 && recipient && (
                <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-500">Sending to</p>
                        <p className="font-bold text-lg">{recipient.email}</p>
                        <p className="font-mono text-sm">{recipient.accountNumber}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-400">$</span>
                            <input
                                type="number"
                                className="w-full p-3 pl-8 border rounded-lg"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Enter PIN to confirm</label>
                        <input
                            type="password"
                            maxLength={6}
                            className="w-full p-3 border rounded-lg tracking-widest text-center text-xl"
                            placeholder="••••••"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 bg-slate-200 text-slate-800 py-3 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleTransfer}
                            disabled={loading}
                            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Send Money'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transfer;
