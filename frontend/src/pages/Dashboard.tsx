import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

import TransactionModal from '../components/TransactionModal';
import TransactionHistoryModal from '../components/TransactionHistoryModal';
import TransferModal from '../components/TransferModal';
import Layout from '../components/Layout';

interface Account {
    id: string;
    name: string;
    type: string;
    currency: string;
    balance: number;
    created_at: string;
}

const Dashboard: React.FC = () => {
    const { token } = useAuth();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountType, setNewAccountType] = useState('ASSET');
    const [newAccountCategory, setNewAccountCategory] = useState('CASH');
    const [newOwnershipType, setNewOwnershipType] = useState('INDIVIDUAL');
    const [newClientID, setNewClientID] = useState('');

    const [transactionModalOpen, setTransactionModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [transactionType, setTransactionType] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');

    const fetchAccounts = async () => {
        try {
            const response = await fetch('http://localhost:8080/accounts', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setAccounts(data || []);
            }
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [token]);

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newAccountName,
                    type: newAccountType,
                    currency: 'USD',
                    account_category: newAccountCategory,
                    ownership_type: newOwnershipType,
                    client_id: newClientID,
                }),
            });

            if (response.ok) {
                setShowCreateModal(false);
                setNewAccountName('');
                setNewClientID('');
                fetchAccounts();
            }
        } catch (error) {
            console.error('Failed to create account', error);
        }
    };

    const openTransactionModal = (accountId: string, type: 'DEPOSIT' | 'WITHDRAW') => {
        setSelectedAccountId(accountId);
        setTransactionType(type);
        setTransactionModalOpen(true);
    };

    const openHistoryModal = (accountId: string) => {
        setSelectedAccountId(accountId);
        setHistoryModalOpen(true);
    };

    const openTransferModal = (accountId: string) => {
        setSelectedAccountId(accountId);
        setTransferModalOpen(true);
    };

    return (
        <Layout>
            <div className="py-10">
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            Dashboard
                        </h1>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                        >
                            Create Account
                        </button>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-6">
                        {loading ? (
                            <p>Loading accounts...</p>
                        ) : (
                            <div className="flex flex-col">
                                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Name
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Type
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Currency
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Balance
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Created At
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {accounts.map((account) => (
                                                        <tr key={account.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {account.name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {account.type}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {account.currency}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                                                {(account.balance / 100).toFixed(2)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {new Date(account.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <button
                                                                    onClick={() => openTransactionModal(account.id, 'DEPOSIT')}
                                                                    className="text-green-600 hover:text-green-900 mr-4"
                                                                >
                                                                    Deposit
                                                                </button>
                                                                <button
                                                                    onClick={() => openTransactionModal(account.id, 'WITHDRAW')}
                                                                    className="text-red-600 hover:text-red-900 mr-4"
                                                                >
                                                                    Withdraw
                                                                </button>
                                                                <button
                                                                    onClick={() => openHistoryModal(account.id)}
                                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                                >
                                                                    History
                                                                </button>
                                                                <button
                                                                    onClick={() => openTransferModal(account.id)}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    Transfer
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {accounts.length === 0 && (
                                                        <tr>
                                                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                                                No accounts found.
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
                </main>
            </div>

            {showCreateModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleCreateAccount}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                Create New Account
                                            </h3>
                                            <div className="mt-2">
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                                        Account Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        value={newAccountName}
                                                        onChange={(e) => setNewAccountName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                                        Account Type
                                                    </label>
                                                    <select
                                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        value={newAccountType}
                                                        onChange={(e) => setNewAccountType(e.target.value)}
                                                    >
                                                        <option value="ASSET">Asset</option>
                                                        <option value="LIABILITY">Liability</option>
                                                        <option value="EQUITY">Equity</option>
                                                        <option value="INCOME">Income</option>
                                                        <option value="EXPENSE">Expense</option>
                                                    </select>
                                                </div>
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                                        Category
                                                    </label>
                                                    <select
                                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        value={newAccountCategory}
                                                        onChange={(e) => setNewAccountCategory(e.target.value)}
                                                    >
                                                        <option value="CASH">Cash</option>
                                                        <option value="CUSTODY">Custody</option>
                                                    </select>
                                                </div>
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                                        Ownership
                                                    </label>
                                                    <select
                                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        value={newOwnershipType}
                                                        onChange={(e) => setNewOwnershipType(e.target.value)}
                                                    >
                                                        <option value="INDIVIDUAL">Individual</option>
                                                        <option value="JOINT">Joint</option>
                                                    </select>
                                                </div>
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                                        Client ID (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        value={newClientID}
                                                        onChange={(e) => setNewClientID(e.target.value)}
                                                        placeholder="UUID"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Create
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <TransactionModal
                isOpen={transactionModalOpen}
                onClose={() => setTransactionModalOpen(false)}
                onSuccess={fetchAccounts}
                accountId={selectedAccountId}
                type={transactionType}
            />
            <TransactionHistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                accountId={selectedAccountId}
            />
            <TransferModal
                isOpen={transferModalOpen}
                onClose={() => setTransferModalOpen(false)}
                onSuccess={fetchAccounts}
                fromAccountId={selectedAccountId}
            />
        </Layout>
    );
};

export default Dashboard;
