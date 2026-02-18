import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
    { name: 'Food & Drink', value: 400, color: '#6366f1' },
    { name: 'Transport', value: 300, color: '#8b5cf6' },
    { name: 'Shopping', value: 300, color: '#ec4899' },
    { name: 'Bills', value: 200, color: '#fb923c' },
];

const Analysis: React.FC = () => {
    return (
        <div className="p-6 pb-24">
            <h1 className="text-2xl font-bold mb-6">Spending Analysis</h1>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80">
                <h3 className="text-lg font-semibold mb-4">Monthly Expenses</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    {data.map(item => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-sm text-slate-600">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analysis;
