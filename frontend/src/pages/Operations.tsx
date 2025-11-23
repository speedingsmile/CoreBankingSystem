import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Operations: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="py-10">
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            Operations / Front Office
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Manage day-to-day operations, client onboarding, and master data maintenance.
                        </p>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Clients Setup Card */}
                            <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Client Master File</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage client profiles, KYC status, and segment assignments.
                                    </p>
                                    <div className="mt-4">
                                        <button
                                            onClick={() => navigate('/clients')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Manage Client Master File
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Accounts Setup Card */}
                            <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Account Master File</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage customer accounts, balances, and product assignments.
                                    </p>
                                    <div className="mt-4">
                                        <button
                                            onClick={() => navigate('/accounts')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Manage Accounts Master File
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Securities Setup Card */}
                            <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Security Master File</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage tradable securities, prices, and market data.
                                    </p>
                                    <div className="mt-4">
                                        <button
                                            onClick={() => navigate('/securities')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Manage Securities Master File
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

export default Operations;
