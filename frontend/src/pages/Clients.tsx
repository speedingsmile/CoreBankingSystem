import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

interface Client {
    id: string;
    external_id: string;
    name: string;
    type: string;
    status: string;
    risk_rating: string;
    tax_domicile: string;
    classification: string;
}

const Clients: React.FC = () => {
    const { token } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Client>>({
        external_id: '',
        name: '',
        type: 'INDIVIDUAL',
        status: 'PENDING',
        risk_rating: 'MEDIUM',
        tax_domicile: 'US',
        classification: 'RETAIL'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const fetchClients = async () => {
        try {
            const response = await fetch('http://localhost:8080/clients', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setClients(data || []);
            }
        } catch (error) {
            console.error('Failed to fetch clients', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [token]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/clients', {
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
                    external_id: '',
                    name: '',
                    type: 'INDIVIDUAL',
                    status: 'PENDING',
                    risk_rating: 'MEDIUM',
                    tax_domicile: 'US',
                    classification: 'RETAIL'
                });
                fetchClients();
            }
        } catch (error) {
            console.error('Failed to create client', error);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Client Master File</h1>
                        <p className="text-gray-500 mt-1">Manage client profiles and KYC status.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-600/30 hover:bg-brand-700 transition-all font-medium"
                    >
                        + Add Client
                    </button>
                </header>

                <div className="glass-card rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">External ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Rating</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Classification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading clients...</td></tr>
                                ) : clients.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No clients found.</td></tr>
                                ) : (
                                    clients.map((client) => (
                                        <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.external_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${client.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                        client.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {client.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.risk_rating}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.classification}</td>
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
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Client</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">External ID (CRM)</label>
                                    <input type="text" name="external_id" required className="glass-input w-full rounded-xl px-4 py-2" value={formData.external_id} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name</label>
                                    <input type="text" name="name" required className="glass-input w-full rounded-xl px-4 py-2" value={formData.name} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select name="type" className="glass-input w-full rounded-xl px-4 py-2" value={formData.type} onChange={handleInputChange}>
                                        <option value="INDIVIDUAL">Individual</option>
                                        <option value="CORPORATE">Corporate</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" className="glass-input w-full rounded-xl px-4 py-2" value={formData.status} onChange={handleInputChange}>
                                        <option value="PENDING">Pending</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="SUSPENDED">Suspended</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Rating</label>
                                    <select name="risk_rating" className="glass-input w-full rounded-xl px-4 py-2" value={formData.risk_rating} onChange={handleInputChange}>
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Domicile (ISO)</label>
                                    <input type="text" name="tax_domicile" maxLength={2} className="glass-input w-full rounded-xl px-4 py-2" value={formData.tax_domicile} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
                                    <select name="classification" className="glass-input w-full rounded-xl px-4 py-2" value={formData.classification} onChange={handleInputChange}>
                                        <option value="RETAIL">Retail</option>
                                        <option value="PROFESSIONAL">Professional</option>
                                        <option value="INSTITUTIONAL">Institutional</option>
                                    </select>
                                </div>
                                <div className="mt-8 flex justify-end space-x-3">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-medium shadow-lg shadow-brand-600/20">Create Client</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Clients;
