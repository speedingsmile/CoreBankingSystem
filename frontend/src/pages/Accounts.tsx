import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

interface Account {
    id: string;
    name: string;
    type: string;
    currency: string;
    balance: number;
    account_category?: string | { String: string; Valid: boolean };
    ownership_type?: string | { String: string; Valid: boolean };
    client_id?: string | { String: string; Valid: boolean } | null;
    created_at: string;
}

const Accounts: React.FC = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Helper function to extract string from nullable backend fields
    const extractNullableString = (field: string | { String: string; Valid: boolean } | null | undefined): string => {
        if (!field) return '-';
        if (typeof field === 'string') return field;
        return field.String || '-';
    };

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'ASSET',
        currency: 'USD',
        account_category: 'CASH',
        ownership_type: 'INDIVIDUAL',
        client_id: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const fetchAccounts = async () => {
        try {
            if (!token) {
                navigate('/login');
                return;
            }
            const response = await fetch('http://localhost:8080/accounts', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setAccounts(data || []);
            } else if (response.status === 401) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setShowCreateModal(false);
                setFormData({
                    name: '',
                    type: 'ASSET',
                    currency: 'USD',
                    account_category: 'CASH',
                    ownership_type: 'INDIVIDUAL',
                    client_id: ''
                });
                fetchAccounts();
            }
        } catch (error) {
            console.error('Failed to create account', error);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Account Master File</h1>
                        <p className="text-gray-500 mt-1">Manage all client and internal accounts.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-600/30 hover:bg-brand-700 transition-all font-medium"
                    >
                        + Add Account
                    </button>
                </header>

                <div className="glass-card rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ownership</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading accounts...</td></tr>
                                ) : accounts.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No accounts found.</td></tr>
                                ) : (
                                    accounts.map((acc) => (
                                        <tr key={acc.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{acc.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${acc.type === 'ASSET' ? 'bg-green-100 text-green-800' :
                                                        acc.type === 'LIABILITY' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {acc.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{extractNullableString(acc.account_category)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{extractNullableString(acc.ownership_type)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{(acc.balance / 100).toFixed(2)} {acc.currency}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{extractNullableString(acc.client_id)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom glass-panel rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Account</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                                    <input type="text" name="name" required className="glass-input w-full rounded-xl px-4 py-2" value={formData.name} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select name="type" className="glass-input w-full rounded-xl px-4 py-2" value={formData.type} onChange={handleInputChange}>
                                        <option value="ASSET">Asset</option>
                                        <option value="LIABILITY">Liability</option>
                                        <option value="EQUITY">Equity</option>
                                        <option value="INCOME">Income</option>
                                        <option value="EXPENSE">Expense</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select name="account_category" className="glass-input w-full rounded-xl px-4 py-2" value={formData.account_category} onChange={handleInputChange}>
                                        <option value="CASH">Cash</option>
                                        <option value="CUSTODY">Custody</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ownership</label>
                                    <select name="ownership_type" className="glass-input w-full rounded-xl px-4 py-2" value={formData.ownership_type} onChange={handleInputChange}>
                                        <option value="INDIVIDUAL">Individual</option>
                                        <option value="JOINT">Joint</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Client ID (Optional)</label>
                                    <input type="text" name="client_id" className="glass-input w-full rounded-xl px-4 py-2" value={formData.client_id} onChange={handleInputChange} />
                                </div>
                                <div className="mt-8 flex justify-end space-x-3">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-medium shadow-lg shadow-brand-600/20">Create Account</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Accounts;
