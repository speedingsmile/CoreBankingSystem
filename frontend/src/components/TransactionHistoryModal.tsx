import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Transaction {
    id: string;
    reference: string;
    description: string;
    posted_at: string;
    entries: {
        id: string;
        account_id: string;
        direction: 'DEBIT' | 'CREDIT';
        amount: number;
    }[];
}

interface TransactionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    accountId: string;
}

const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({ isOpen, onClose, accountId }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && accountId) {
            fetchTransactions();
        }
    }, [isOpen, accountId]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/transactions?account_id=${accountId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setTransactions(data || []);
            }
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Transaction History
                                </h3>
                                <div className="mt-2">
                                    {loading ? (
                                        <p>Loading transactions...</p>
                                    ) : (
                                        <div className="flex flex-col">
                                            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Date
                                                                    </th>
                                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Description
                                                                    </th>
                                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Reference
                                                                    </th>
                                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Amount
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {transactions.map((tx) => {
                                                                    // Find the entry for this account to determine amount and direction
                                                                    const entry = tx.entries.find(e => e.account_id === accountId);
                                                                    const amount = entry ? entry.amount : 0;
                                                                    // For Asset accounts: Debit is Increase (+), Credit is Decrease (-)
                                                                    // For Liability accounts: Credit is Increase (+), Debit is Decrease (-)
                                                                    // BUT, usually in a statement:
                                                                    // Money coming in (Deposit) -> Credit (for Liability/Bank view) or Debit (for Asset view)
                                                                    // Let's simplify: Show + for money added to balance, - for money removed.
                                                                    // Since we don't know account type here easily without passing it, let's just show Direction.

                                                                    return (
                                                                        <tr key={tx.id}>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                                {new Date(tx.posted_at).toLocaleString()}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                                {tx.description}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                                {tx.reference}
                                                                            </td>
                                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${entry?.direction === 'DEBIT' ? 'text-green-600' : 'text-red-600'}`}>
                                                                                {entry?.direction === 'DEBIT' ? '+' : '-'}{(amount / 100).toFixed(2)} ({entry?.direction})
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                                {transactions.length === 0 && (
                                                                    <tr>
                                                                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                                                            No transactions found.
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistoryModal;
