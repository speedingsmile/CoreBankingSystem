import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Rule {
    id: string;
    name: string;
    description: string;
    condition_json: string;
    action_json: string;
    status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
    version: number;
    parent_rule_id?: string;
    created_at: string;
}

const RuleConfig: React.FC = () => {
    const { token } = useAuth();
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRule, setEditingRule] = useState<Rule | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        condition_json: '{}',
        action_json: '{}',
        status: 'DRAFT'
    });

    const fetchRules = async () => {
        try {
            const response = await fetch('http://localhost:8080/rules', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setRules(data || []);
            }
        } catch (error) {
            console.error('Failed to fetch rules', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, [token]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingRule
                ? `http://localhost:8080/rules?id=${editingRule.id}`
                : 'http://localhost:8080/rules';
            const method = editingRule ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setShowModal(false);
                setEditingRule(null);
                setFormData({
                    name: '',
                    description: '',
                    condition_json: '{}',
                    action_json: '{}',
                    status: 'DRAFT'
                });
                fetchRules();
            } else {
                const err = await response.text();
                alert(`Error: ${err}`);
            }
        } catch (error) {
            console.error('Failed to save rule', error);
        }
    };

    const handleClone = async (rule: Rule) => {
        if (!window.confirm(`Clone rule "${rule.name}" as a new version?`)) return;
        try {
            const response = await fetch(`http://localhost:8080/rules/clone?id=${rule.id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                fetchRules();
            } else {
                const err = await response.text();
                alert(`Error cloning rule: ${err}`);
            }
        } catch (error) {
            console.error('Failed to clone rule', error);
        }
    };

    const openEditModal = (rule: Rule) => {
        setEditingRule(rule);
        setFormData({
            name: rule.name,
            description: rule.description,
            condition_json: rule.condition_json,
            action_json: rule.action_json,
            status: rule.status as string
        });
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditingRule(null);
        setFormData({
            name: '',
            description: '',
            condition_json: '{}',
            action_json: '{}',
            status: 'DRAFT'
        });
        setShowModal(true);
    };

    // Safe Edit Logic for Frontend
    const isFieldDisabled = (fieldName: string) => {
        if (!editingRule) return false; // Creating new
        if (editingRule.status === 'DRAFT') return false; // Drafts are fully editable
        if (editingRule.status === 'ARCHIVED') return true; // Archived is read-only

        // Active Rules:
        // Critical fields are locked
        if (['condition_json', 'action_json'].includes(fieldName)) return true;

        return false;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Business Rules Engine</h3>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Create Rule
                </button>
            </div>

            {loading ? (
                <p>Loading rules...</p>
            ) : (
                <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ver</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {rules.map((rule) => (
                                <tr key={rule.id}>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{rule.name}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">v{rule.version}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${rule.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                            rule.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {rule.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">{rule.description}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 space-x-2">
                                        <button
                                            onClick={() => openEditModal(rule)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            {rule.status === 'ARCHIVED' ? 'View' : 'Edit'}
                                        </button>
                                        <button
                                            onClick={() => handleClone(rule)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Clone
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        {editingRule ? 'Edit Rule' : 'Create Rule'}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                disabled={isFieldDisabled('name')}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Description</label>
                                            <input
                                                type="text"
                                                name="description"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                disabled={isFieldDisabled('description')}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Condition (JSON)</label>
                                            <textarea
                                                name="condition_json"
                                                rows={3}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
                                                value={formData.condition_json}
                                                onChange={handleInputChange}
                                                disabled={isFieldDisabled('condition_json')}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Action (JSON)</label>
                                            <textarea
                                                name="action_json"
                                                rows={3}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
                                                value={formData.action_json}
                                                onChange={handleInputChange}
                                                disabled={isFieldDisabled('action_json')}
                                            />
                                        </div>
                                        {editingRule && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                                <select
                                                    name="status"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                    disabled={editingRule.status === 'ARCHIVED'}
                                                >
                                                    <option value="DRAFT">Draft</option>
                                                    <option value="ACTIVE">Active</option>
                                                    <option value="ARCHIVED">Archived</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    {(!editingRule || editingRule.status !== 'ARCHIVED') && (
                                        <button
                                            type="submit"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            Save
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
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

export default RuleConfig;
