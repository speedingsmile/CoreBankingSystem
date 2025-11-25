import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BatchRecord } from '../../types/automation';
import Layout from '../../components/Layout';

const AVAILABLE_JOBS = [
    { name: 'Daily Accrual', description: 'Calculates daily interest for all active accounts.' },
    { name: 'Capitalization', description: 'Posts accrued interest to account balances (Monthly).' },
    { name: 'Fee Sweeper', description: 'Collects periodic fees from accounts.' },
];

const BatchMonitor: React.FC = () => {
    const [history, setHistory] = useState<BatchRecord[]>([]);
    const [triggering, setTriggering] = useState<string | null>(null);

    const navigate = useNavigate();

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const response = await fetch('http://localhost:8080/admin/batches', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setHistory(data || []);
            } else if (response.status === 401) {
                navigate('/login');
            }
        } catch (error) {
            console.error("Failed to fetch batch history", error);
        }
    };

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleTriggerJob = async (jobName: string) => {
        setTriggering(jobName);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const response = await fetch(`http://localhost:8080/admin/batches/trigger?job=${encodeURIComponent(jobName)}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                // Immediate refresh
                fetchHistory();
            } else {
                const errText = await response.text();
                alert(`Failed to trigger job: ${response.status} ${response.statusText} - ${errText}`);
                if (response.status === 401) navigate('/login');
            }
        } catch (error) {
            console.error(error);
            alert('Error triggering job');
        } finally {
            setTriggering(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'RUNNING':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">RUNNING</span>;
            case 'COMPLETED':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">SUCCESS</span>;
            case 'FAILED':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">FAILED</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Batch Monitor</h1>

                {/* Job Control Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {AVAILABLE_JOBS.map((job) => (
                        <div key={job.name} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900">{job.name}</h3>
                            <p className="text-sm text-slate-500 mt-2 mb-4">{job.description}</p>
                            <button
                                onClick={() => handleTriggerJob(job.name)}
                                disabled={triggering === job.name}
                                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex justify-center items-center"
                            >
                                {triggering === job.name ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Run Now'
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Execution History */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-slate-800">Execution History</h2>
                        <button onClick={fetchHistory} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                            Refresh
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">Job Name</th>
                                    <th className="px-6 py-3">Start Time</th>
                                    <th className="px-6 py-3">End Time</th>
                                    <th className="px-6 py-3">Duration</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Message</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                            No batch history found.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((record) => {
                                        const start = new Date(record.StartTime);
                                        const end = record.EndTime ? new Date(record.EndTime) : null;
                                        const duration = end ? ((end.getTime() - start.getTime()) / 1000).toFixed(2) + 's' : '-';

                                        return (
                                            <tr key={record.ID} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">{record.JobName}</td>
                                                <td className="px-6 py-4">{start.toLocaleString()}</td>
                                                <td className="px-6 py-4">{end ? end.toLocaleString() : '-'}</td>
                                                <td className="px-6 py-4 font-mono">{duration}</td>
                                                <td className="px-6 py-4">{getStatusBadge(record.Status)}</td>
                                                <td className="px-6 py-4 text-slate-500 truncate max-w-xs" title={record.ErrorLog}>
                                                    {record.ErrorLog || '-'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BatchMonitor;
