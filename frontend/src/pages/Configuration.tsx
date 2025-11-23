import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Configuration: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="py-10">
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            System Configuration & Product Factory
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Define system-wide rules, product blueprints, and compliance frameworks. Restricted to System Administrators.
                        </p>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                            {/* Client Administration */}
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">Client Administration</h3>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Customer Types</h4>
                                            <p className="text-xs text-gray-500">Define types (e.g., Retail, Corporate) and their attributes.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Documentation Rules</h4>
                                            <p className="text-xs text-gray-500">Define mandatory documents per Customer Type.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Data Constraints</h4>
                                            <p className="text-xs text-gray-500">Define mandatory vs. optional fields based on type.</p>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => navigate('/configuration/clients')}
                                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                        >
                                            Configure Clients
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Product Factory */}
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">Product Factory</h3>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Product Blueprinting</h4>
                                            <p className="text-xs text-gray-500">Create new Product Codes (e.g., SAV-001).</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">GL Mapping</h4>
                                            <p className="text-xs text-gray-500">Map accounting events to General Ledger accounts.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Interest Parameters</h4>
                                            <p className="text-xs text-gray-500">Configure Rate Types and Day Count Conventions.</p>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => navigate('/configuration/products')}
                                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                        >
                                            Configure Products
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Securities Configuration */}
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">Securities Configuration</h3>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Asset Classes</h4>
                                            <p className="text-xs text-gray-500">Define broad categories (Equity, Bond, ETF) and behaviors.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Market Setup</h4>
                                            <p className="text-xs text-gray-500">Define Markets (NYSE, NASDAQ) and settlement cycles.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Valuation Logic</h4>
                                            <p className="text-xs text-gray-500">Define price processing logic (e.g., Last Traded vs Bid/Ask).</p>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => navigate('/configuration/markets')}
                                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                        >
                                            Configure Securities
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default Configuration;
