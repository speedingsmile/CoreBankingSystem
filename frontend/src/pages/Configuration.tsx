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

                            {/* Client & Party Configuration */}
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">Client & Party</h3>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Customer Taxonomies</h4>
                                            <p className="text-xs text-gray-500">Define abstract classes (Retail, Corporate, SME, Trust).</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">KYC & Compliance</h4>
                                            <p className="text-xs text-gray-500">Define required document sets per Customer Type.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Relationship Matrix</h4>
                                            <p className="text-xs text-gray-500">Configure valid link types and constraints.</p>
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

                            {/* Accounts & Product Factory */}
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">Accounts & Product Factory</h3>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Product Builder</h4>
                                            <p className="text-xs text-gray-500">Define Product Codes and parameters.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Numbering Logic</h4>
                                            <p className="text-xs text-gray-500">Configure account number generation masks.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">GL Mapping</h4>
                                            <p className="text-xs text-gray-500">Map product events to Chart of Accounts.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Interest & Fee Engine</h4>
                                            <p className="text-xs text-gray-500">Define calculation logic and frequency.</p>
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

                            {/* Securities & Investment */}
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">Securities & Investment</h3>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Instrument Definitions</h4>
                                            <p className="text-xs text-gray-500">Define Asset Classes and processing behaviors.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Market Setup</h4>
                                            <p className="text-xs text-gray-500">Define Markets, settlement rules, and calendars.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700">Corporate Action Rules</h4>
                                            <p className="text-xs text-gray-500">Define calculation logic for splits/dividends.</p>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => navigate('/configuration/markets')}
                                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                        >
                                            Configure Markets
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
