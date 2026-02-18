import React, { useState } from 'react';
import { Plus, PiggyBank } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext'; // Use for real data

const Savings: React.FC = () => {
    // const { profile } = useAuth();
    const [jars, setJars] = useState([
        { id: 1, name: 'Vacation Fund', goal: 2000, current: 450, color: 'bg-blue-500' },
        { id: 2, name: 'New Laptop', goal: 1500, current: 800, color: 'bg-purple-500' },
    ]);

    const handleAddJar = () => {
        const name = prompt("Jar Name:");
        if (name) {
            setJars([...jars, { id: Date.now(), name, goal: 1000, current: 0, color: 'bg-indigo-500' }]);
        }
    };

    return (
        <div className="p-6 pb-24">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Savings Jars</h1>
                <button onClick={handleAddJar} className="p-2 bg-indigo-100 text-indigo-600 rounded-full">
                    <Plus className="w-5 h-5" />
                </button>
            </header>

            <div className="grid grid-cols-2 gap-4">
                {jars.map(jar => (
                    <div key={jar.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
                        <div className={`w-10 h-10 ${jar.color} rounded-full flex items-center justify-center text-white`}>
                            <PiggyBank className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{jar.name}</h3>
                            <p className="text-xs text-slate-400">Goal: ${jar.goal}</p>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-bold">${jar.current}</span>
                                <span className="text-slate-400">{Math.round((jar.current / jar.goal) * 100)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${jar.color}`}
                                    style={{ width: `${(jar.current / jar.goal) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Savings;
