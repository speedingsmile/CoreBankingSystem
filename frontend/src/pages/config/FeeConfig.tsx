import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Fee {
    id: string;
    name: string;
    method: 'FLAT' | 'PERCENTAGE';
    value: number;
    frequency: 'REALTIME' | 'PERIODIC';
    gl_account_id: string;
    status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
    version: number;
    created_at: string;
}

const FeeConfig: React.FC = () => {
    const { token } = useAuth();
    const [fees, setFees] = useState<Fee[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingFee, setEditingFee] = useState<Fee | null>(null);
    const [form, setForm] = useState({
        name: '',
        method: 'FLAT',
        value: 0,
        frequency: 'REALTIME',
        gl_account_id: '00000000-0000-0000-0000-000000000000', // Placeholder
        status: 'DRAFT'
    });

    useEffect(() => {
        fetchFees();
    }, [token]);

    const fetchFees = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/fees', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setFees(data || []);
            }
        } catch (error) {
            console.error("Failed to fetch fees", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingFee(null);
        setForm({
            name: '',
            method: 'FLAT',
            value: 0,
            frequency: 'REALTIME',
            gl_account_id: '00000000-0000-0000-0000-000000000000',
            status: 'DRAFT'
        });
        setShowModal(true);
    };

    const handleEdit = (fee: Fee) => {
        setEditingFee(fee);
        setForm({
            name: fee.name,
            method: fee.method,
            value: fee.value,
            frequency: fee.frequency,
            gl_account_id: fee.gl_account_id,
            status: fee.status as any
        });
        setShowModal(true);
    };

    const handleClone = async (id: string) => {
        if (!window.confirm("Clone this fee to a new Draft version?")) return;
        try {
            const response = await fetch(`http://localhost:8080/fees/clone?id=${id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                fetchFees();
                alert("Fee Cloned Successfully");
            } else {
                alert("Failed to clone fee");
            }
        } catch (error) {
            console.error("Failed to clone fee", error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let url = 'http://localhost:8080/fees';
            let method = 'POST';

            if (editingFee) {
                url = `http://localhost:8080/fees?id=${editingFee.id}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                setShowModal(false);
                fetchFees();
            } else {
                const err = await response.text();
                alert("Operation failed: " + err);
            }
        } catch (error) {
            console.error("Failed to save fee", error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Fee Master Definitions</h3>
                <button
                    onClick={handleCreate}
                    className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Create New Fee
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={7} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : fees.map((fee) => (
                            <tr key={fee.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fee.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.method}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.value}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.frequency}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${fee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                            fee.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                        {fee.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">v{fee.version}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onClick={() => handleEdit(fee)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    {fee.status === 'ACTIVE' && (
                                        <button onClick={() => handleClone(fee.id)} className="text-blue-600 hover:text-blue-900">Clone</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Fee Modal */}
            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSave}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        {editingFee ? 'Edit Fee' : 'Create Fee'}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Fee Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Method</label>
                                            <select
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={form.method}
                                                onChange={(e) => setForm({ ...form, method: e.target.value })}
                                                disabled={!!editingFee} // Cannot change method after creation
                                            >
                                                <option value="FLAT">Flat Amount</option>
                                                <option value="PERCENTAGE">Percentage</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Value</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={form.value}
                                                onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) })}
                                                disabled={editingFee?.status === 'ACTIVE'}
                                            />
                                            {editingFee?.status === 'ACTIVE' && (
                                                <p className="text-xs text-yellow-600 mt-1">Value cannot be changed for Active fees. Clone to create a new version.</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Frequency</label>
                                            <select
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={form.frequency}
                                                onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}
                                                disabled={!!editingFee}
                                            >
                                                <option value="REALTIME">Real-time (Per Transaction)</option>
                                                <option value="PERIODIC">Periodic (Monthly/Yearly)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Status</label>
                                            <select
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={form.status}
                                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                            >
                                                <option value="DRAFT">Draft</option>
                                                <option value="ACTIVE">Active</option>
                                                <option value="ARCHIVED">Archived</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
                                        Save
                                    </button>
                                    <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeeConfig;
