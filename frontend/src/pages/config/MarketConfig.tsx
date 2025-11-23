import React, { useState } from 'react';
import Layout from '../../components/Layout';

const MarketConfig: React.FC = () => {
    const [activeTab, setActiveTab] = useState('asset_classes');

    return (
        <Layout>
            <div className="py-10">
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            Securities Configuration
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Define Asset Classes, Markets, and Valuation Logic.
                        </p>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-6">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex" aria-label="Tabs">
                                    <button
                                        onClick={() => setActiveTab('asset_classes')}
                                        className={`${activeTab === 'asset_classes'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Asset Classes
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('markets')}
                                        className={`${activeTab === 'markets'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Market Setup
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('valuation')}
                                        className={`${activeTab === 'valuation'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Valuation Logic
                                    </button>
                                </nav>
                            </div>
                            <div className="p-6">
                                {activeTab === 'asset_classes' && (
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Asset Classes</h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Define broad categories (Equity, Bond, ETF) and their behaviors.
                                        </p>
                                        <div className="mt-4 border-4 border-dashed border-gray-200 rounded-lg h-48 flex items-center justify-center">
                                            <span className="text-gray-400">Asset Classes UI</span>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'markets' && (
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Market Setup</h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Define Markets (NYSE, NASDAQ) and their settlement cycles.
                                        </p>
                                        <div className="mt-4 border-4 border-dashed border-gray-200 rounded-lg h-48 flex items-center justify-center">
                                            <span className="text-gray-400">Market Setup UI</span>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'valuation' && (
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Valuation Logic</h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Define how the sync endpoint processes data (e.g., Last Traded Price vs. Bid/Ask).
                                        </p>
                                        <div className="mt-4 border-4 border-dashed border-gray-200 rounded-lg h-48 flex items-center justify-center">
                                            <span className="text-gray-400">Valuation Logic UI</span>
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

export default MarketConfig;
