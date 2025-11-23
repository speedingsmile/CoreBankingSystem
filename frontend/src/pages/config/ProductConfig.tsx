import React, { useState } from 'react';
import Layout from '../../components/Layout';

const ProductConfig: React.FC = () => {
    const [activeTab, setActiveTab] = useState('coa');

    // Mock Data for COA
    const [coa] = useState([
        { code: '1000', name: 'Assets', type: 'ASSET', parent: null },
        { code: '1001', name: 'Vault Cash', type: 'ASSET', parent: '1000' },
        { code: '2000', name: 'Liabilities', type: 'LIABILITY', parent: null },
        { code: '2001', name: 'Customer Savings Control', type: 'LIABILITY', parent: '2000' },
        { code: '5000', name: 'Expenses', type: 'EXPENSE', parent: null },
        { code: '5001', name: 'Interest Paid Expense', type: 'EXPENSE', parent: '5000' },
    ]);

    // Mock Data for Products
    const [products] = useState(['Gold Savings', 'Standard Checking']);
    const [selectedProduct, setSelectedProduct] = useState('Gold Savings');

    // Mock Data for Event Mappings
    const [mappings] = useState([
        { event: 'Cash Deposit', debitGL: '1001', creditGL: '2001' },
        { event: 'Cash Withdrawal', debitGL: '2001', creditGL: '1001' },
        { event: 'Interest Payout', debitGL: '5001', creditGL: '2001' },
    ]);

    return (
        <Layout>
            <div className="py-10">
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            Product Factory & Accounting Schema
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Define Chart of Accounts and Map Product Events to Ledger Entries.
                        </p>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-6">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex" aria-label="Tabs">
                                    <button
                                        onClick={() => setActiveTab('coa')}
                                        className={`${activeTab === 'coa'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Chart of Accounts (COA)
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('mapping')}
                                        className={`${activeTab === 'mapping'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Product Accounting Map
                                    </button>
                                </nav>
                            </div>
                            <div className="p-6">
                                {activeTab === 'coa' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Chart of Accounts Definition</h3>
                                            <button className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                                Add GL Account
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GL Code</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GL Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {coa.map((account) => (
                                                        <tr key={account.code}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.code}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${account.type === 'ASSET' ? 'bg-green-100 text-green-800' : account.type === 'LIABILITY' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                    {account.type}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.parent || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'mapping' && (
                                    <div>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700">Select Product to Configure</label>
                                            <select
                                                value={selectedProduct}
                                                onChange={(e) => setSelectedProduct(e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                            >
                                                {products.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>

                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Event-to-GL Mapping Matrix</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 border">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Business Event</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Debit GL (Dr)</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Credit GL (Cr)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {mappings.map((mapping, idx) => (
                                                        <tr key={idx}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mapping.event}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <select
                                                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                                    defaultValue={mapping.debitGL}
                                                                >
                                                                    {coa.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                                                                </select>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <select
                                                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                                    defaultValue={mapping.creditGL}
                                                                >
                                                                    {coa.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    {/* Heroicon name: solid/exclamation */}
                                                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-yellow-700">
                                                        Note: Account Closure events require the balance to be strictly zero. No GL mapping is needed as no funds are moved; the status is simply updated.
                                                    </p>
                                                </div>
                                            </div>
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

export default ProductConfig;
