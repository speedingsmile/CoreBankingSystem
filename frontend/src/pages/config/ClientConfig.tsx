import React, { useState } from 'react';
import Layout from '../../components/Layout';

const ClientConfig: React.FC = () => {
    const [activeTab, setActiveTab] = useState('types');

    return (
        <Layout>
            <div className="py-10">
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            Client Administration
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Define the KYC Framework and Client definitions.
                        </p>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-6">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex" aria-label="Tabs">
                                    <button
                                        onClick={() => setActiveTab('types')}
                                        className={`${activeTab === 'types'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Customer Types
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('docs')}
                                        className={`${activeTab === 'docs'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Documentation Rules
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('constraints')}
                                        className={`${activeTab === 'constraints'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Data Constraints
                                    </button>
                                </nav>
                            </div>
                            <div className="p-6">
                                {activeTab === 'types' && (
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Types</h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Create and manage customer types (e.g., Retail, Corporate).
                                        </p>
                                        {/* Placeholder for Customer Types Form/List */}
                                        <div className="mt-4 border-4 border-dashed border-gray-200 rounded-lg h-48 flex items-center justify-center">
                                            <span className="text-gray-400">Customer Types Configuration UI</span>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'docs' && (
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Documentation Rules</h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Define mandatory documents for each customer type.
                                        </p>
                                        {/* Placeholder for Documentation Rules Form/List */}
                                        <div className="mt-4 border-4 border-dashed border-gray-200 rounded-lg h-48 flex items-center justify-center">
                                            <span className="text-gray-400">Documentation Rules UI</span>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'constraints' && (
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Data Constraints</h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Define mandatory and optional fields for client profiles.
                                        </p>
                                        {/* Placeholder for Data Constraints Form/List */}
                                        <div className="mt-4 border-4 border-dashed border-gray-200 rounded-lg h-48 flex items-center justify-center">
                                            <span className="text-gray-400">Data Constraints UI</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default ClientConfig;
