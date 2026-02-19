

export interface TransactionGroup {
    date: string;
    transactions: any[];
}

export const groupTransactionsByDate = (transactions: any[]): TransactionGroup[] => {
    const groups: { [key: string]: any[] } = {};

    transactions.forEach(tx => {
        let dateKey = 'Unknown Date';
        if (tx.timestamp) {
            const date = tx.timestamp.toDate ? tx.timestamp.toDate() : new Date(tx.timestamp);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (date.toDateString() === today.toDateString()) {
                dateKey = 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                dateKey = 'Yesterday';
            } else {
                dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
        }

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(tx);
    });

    // Sort groups? Keys are strings, simpler to return array and map order if needed.
    // However, if input is sorted by time desc, groups will be roughly created in order if we iterate.
    // Ideally we want purely chronological keys.
    // Let's rely on the input being sorted (which it is from Firestore).

    return Object.keys(groups).map(date => ({
        date,
        transactions: groups[date]
    }));
};
