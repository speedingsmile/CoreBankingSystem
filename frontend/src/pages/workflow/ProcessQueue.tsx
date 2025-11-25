import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { WorkflowInstance } from '../../types/automation';

import Layout from '../../components/Layout';

const ProcessQueue: React.FC = () => {
    const [approvals, setApprovals] = useState<WorkflowInstance[]>([]);
    const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
    const [comment, setComment] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const fetchApprovals = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const response = await fetch('http://localhost:8080/workflow/approvals', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setApprovals(data || []);
            } else if (response.status === 401) {
                navigate('/login');
            }
        } catch (error) {
            console.error("Failed to fetch approvals", error);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!selectedInstance) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const endpoint = action === 'approve' ? 'approve' : 'reject';
            const body = action === 'reject' ? { instance_id: selectedInstance.ID, reason: comment } : { instance_id: selectedInstance.ID };

            const response = await fetch(`http://localhost:8080/workflow/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                setSelectedInstance(null);
                setComment('');
                fetchApprovals(); // Refresh list
            } else {
                const errText = await response.text();
                alert(`Failed to ${action} workflow: ${response.status} ${response.statusText} - ${errText}`);
                if (response.status === 401) navigate('/login');
            }
        } catch (error) {
            console.error(error);
            alert(`Error processing ${action}`);
        } finally {
            setLoading(false);
        }
    };

    const renderPayload = (jsonString: string) => {
        try {
            const data = JSON.parse(jsonString);
            return (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono overflow-auto max-h-60">
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            );
        } catch (e) {
            return <div className="text-red-500">Invalid Payload JSON</div>;
        }
    };

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">My Approvals</h1>

                {/* Inbox List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-slate-800">Pending Tasks</h2>
                        <button onClick={fetchApprovals} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                            Refresh
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">Created Date</th>
                                    <th className="px-6 py-3">Workflow ID</th>
                                    <th className="px-6 py-3">Role Required</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {approvals.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                            No pending approvals found.
                                        </td>
                                    </tr>
                                ) : (
                                    approvals.map((inst) => (
                                        <tr key={inst.ID} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">{new Date(inst.CreatedAt).toLocaleString()}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{inst.ID}</td>
                                            <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{inst.RoleRequired || 'MANAGER'}</span></td>
                                            <td className="px-6 py-4"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">{inst.Status}</span></td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedInstance(inst)}
                                                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                                                >
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Details Modal */}
                {selectedInstance && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                <h3 className="text-lg font-bold text-slate-900">Review Request</h3>
                                <button onClick={() => setSelectedInstance(null)} className="text-slate-400 hover:text-slate-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Transaction Details</label>
                                    {renderPayload(selectedInstance.Payload)}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Review Comments (Optional)</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        rows={3}
                                        placeholder="Add a note..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                                <button
                                    onClick={() => handleAction('reject')}
                                    disabled={loading}
                                    className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium transition-colors disabled:opacity-50"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleAction('approve')}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-colors disabled:opacity-50 flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        'Approve Request'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ProcessQueue;
