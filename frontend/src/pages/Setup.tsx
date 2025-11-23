import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Setup: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold text-indigo-600">Core Banking</h1>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <a onClick={() => navigate('/')} className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer">
                                    Dashboard
                                </a>
                                <a onClick={() => navigate('/securities')} className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer">
                                    Securities
                                </a>
                                <a className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer">
                                    System Setup
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={logout}
                                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-10">
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            System Setup
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Configure system-wide settings, types, and rules. Restricted to Administrators.
                        </p>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Securities Setup Card */}
                            <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Securities Configuration</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Define security types, asset classes, and market data sources.
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

                            {/* Accounts Setup Card */}
                            <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Accounts Configuration</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Configure account types, interest rate rules, and overdraft limits.
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

                            {/* Clients Setup Card */}
                            <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Clients Configuration</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Set up client segments, KYC requirements, and categorization rules.
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
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Setup;
