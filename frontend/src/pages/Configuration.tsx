import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Configuration: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-gray-900">
                        System Configuration & Product Factory
                    </h1>
                    <p className="mt-2 text-gray-500 text-lg">
                        Define system-wide rules, product blueprints, and compliance frameworks. Restricted to System Administrators.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Client Administration */}
                    <div className="glass-card p-8 rounded-3xl hover:scale-[1.02] transition-transform duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Client Administration</h3>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Customer Types</h4>
                                <p className="text-sm text-gray-500 mt-1">Define types (e.g., Retail, Corporate) and their attributes.</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Documentation Rules</h4>
                                <p className="text-sm text-gray-500 mt-1">Define mandatory documents per Customer Type.</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Data Constraints</h4>
                                <p className="text-sm text-gray-500 mt-1">Define mandatory vs. optional fields based on type.</p>
                            </div>
                        </div>
                        <div className="mt-8">
                            <button
                                onClick={() => navigate('/configuration/clients')}
                                className="w-full py-3 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-brand-50 hover:text-brand-600 transition-colors"
                            >
                                Configure Clients
                            </button>
                        </div>
                    </div>

                    {/* Product Factory */}
                    <div className="glass-card p-8 rounded-3xl hover:scale-[1.02] transition-transform duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Product Factory</h3>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Product Blueprinting</h4>
                                <p className="text-sm text-gray-500 mt-1">Create new Product Codes (e.g., SAV-001).</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider">GL Mapping</h4>
                                <p className="text-sm text-gray-500 mt-1">Map accounting events to General Ledger accounts.</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Interest Parameters</h4>
                                <p className="text-sm text-gray-500 mt-1">Configure Rate Types and Day Count Conventions.</p>
                            </div>
                        </div>
                        <div className="mt-8">
                            <button
                                onClick={() => navigate('/configuration/products')}
                                className="w-full py-3 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-brand-50 hover:text-brand-600 transition-colors"
                            >
                                Configure Products
                            </button>
                        </div>
                    </div>

                    {/* Securities Configuration */}
                    <div className="glass-card p-8 rounded-3xl hover:scale-[1.02] transition-transform duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Securities Configuration</h3>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Asset Classes</h4>
                                <p className="text-sm text-gray-500 mt-1">Define broad categories (Equity, Bond, ETF) and behaviors.</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Market Setup</h4>
                                <p className="text-sm text-gray-500 mt-1">Define Markets (NYSE, NASDAQ) and settlement cycles.</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Valuation Logic</h4>
                                <p className="text-sm text-gray-500 mt-1">Define price processing logic (e.g., Last Traded vs Bid/Ask).</p>
                            </div>
                        </div>
                        <div className="mt-8">
                            <button
                                onClick={() => navigate('/configuration/markets')}
                                className="w-full py-3 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-brand-50 hover:text-brand-600 transition-colors"
                            >
                                Configure Securities
                            </button>
                        </div>
                    </div>

                    {/* Security & Access Control */}
                    <div className="glass-card p-8 rounded-3xl hover:scale-[1.02] transition-transform duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Security & Access Control</h3>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Role Builder</h4>
                                <p className="text-sm text-gray-500 mt-1">Define abstract roles and map permissions.</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Approval Limits</h4>
                                <p className="text-sm text-gray-500 mt-1">Set transaction limits and maker/checker rules.</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider">User Management</h4>
                                <p className="text-sm text-gray-500 mt-1">Onboard staff and assign roles/branches.</p>
                            </div>
                        </div>
                        <div className="mt-8">
                            <button
                                onClick={() => navigate('/configuration/security')}
                                className="w-full py-3 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-brand-50 hover:text-brand-600 transition-colors"
                            >
                                Configure Security
                            </button>
                        </div>
                    </div>

                    {/* Batch Operations */}
                    <div className="glass-card p-8 rounded-3xl hover:scale-[1.02] transition-transform duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Batch Operations</h3>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Job Scheduler</h4>
                                <p className="text-sm text-gray-500 mt-1">Monitor and trigger End-of-Day jobs.</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-brand-600 uppercase tracking-wider">Execution History</h4>
                                <p className="text-sm text-gray-500 mt-1">View logs of past batch runs and errors.</p>
                            </div>
                        </div>
                        <div className="mt-8">
                            <button
                                onClick={() => navigate('/admin/batch-monitor')}
                                className="w-full py-3 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-brand-50 hover:text-brand-600 transition-colors"
                            >
                                Open Batch Monitor
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Configuration;
