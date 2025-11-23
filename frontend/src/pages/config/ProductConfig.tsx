import React, { useState } from 'react';
import Layout from '../../components/Layout';

const ProductConfig: React.FC = () => {
    const [activeTab, setActiveTab] = useState('coa');

    // Mock Data for COA
    const [coa, setCoa] = useState([
        { code: '1000', name: 'Assets', type: 'ASSET', parent: null },
        { code: '1001', name: 'Vault Cash', type: 'ASSET', parent: '1000' },
        { code: '2000', name: 'Liabilities', type: 'LIABILITY', parent: null },
        { code: '2001', name: 'Customer Savings Control', type: 'LIABILITY', parent: '2000' },
        { code: '4000', name: 'Income', type: 'INCOME', parent: null },
        { code: '4001', name: 'Fee Income', type: 'INCOME', parent: '4000' },
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

    // Mock Data for Fee Master
    const [fees] = useState([
        { id: 'F001', name: 'Standard Wire Fee', method: 'FLAT', value: '5.00', frequency: 'REALTIME', gl: '4001' },
        { id: 'F002', name: 'ATM Foreign Withdrawal', method: 'PERCENTAGE', value: '1.5%', frequency: 'REALTIME', gl: '4001' },
        { id: 'F003', name: 'Monthly Maintenance', method: 'FLAT', value: '10.00', frequency: 'PERIODIC', gl: '4001' },
    ]);

    // Mock Data for Fee Assignments
    const [feeAssignments] = useState([
        { product: 'Gold Savings', event: 'On_Transfer', feeId: 'F001', waiver: 'Avg Bal > $5,000' },
        { product: 'Standard Checking', event: 'On_Withdrawal', feeId: 'F002', waiver: 'None' },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newGL, setNewGL] = useState({ code: '', name: '', type: 'ASSET', parent: '' });

    // Fee Engine State
    const [feeSubTab, setFeeSubTab] = useState('master'); // 'master' or 'assignment'

    const handleAddGL = (e: React.FormEvent) => {
        e.preventDefault();
        // Update the mock state
        const parent = newGL.parent === '' ? null : newGL.parent;
        setCoa([...coa, { ...newGL, parent }]);
        setShowAddModal(false);
        setNewGL({ code: '', name: '', type: 'ASSET', parent: '' });
        alert("GL Account Added (Mock)");
    };

    return (
        <Layout>
            <div className="py-10">
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            Product Factory & Accounting Schema
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Define Chart of Accounts, Map Product Events, and Configure Fee Engines.
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
                                            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Chart of Accounts (COA)
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('mapping')}
                                        className={`${activeTab === 'mapping'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Product Accounting Map
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('fees')}
                                        className={`${activeTab === 'fees'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Fee & Commission Engine
                                    </button>
                                </nav>
                            </div>
                            <div className="p-6">
                                {activeTab === 'coa' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Chart of Accounts Definition</h3>
                                            <button
                                                onClick={() => setShowAddModal(true)}
                                                className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
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
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${account.type === 'ASSET' ? 'bg-green-100 text-green-800' : account.type === 'LIABILITY' ? 'bg-red-100 text-red-800' : account.type === 'INCOME' ? 'bg-blue-100 text-blue-800' : account.type === 'EXPENSE' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
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

                                {activeTab === 'fees' && (
                                    <div>
                                        <div className="sm:hidden">
                                            <label htmlFor="tabs" className="sr-only">Select a tab</label>
                                            <select
                                                id="tabs"
                                                name="tabs"
                                                className="block w-full focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                                                value={feeSubTab}
                                                onChange={(e) => setFeeSubTab(e.target.value)}
                                            >
                                                <option value="master">Fee Master Definition</option>
                                                <option value="assignment">Product Fee Attachment</option>
                                            </select>
                                        </div>
                                        <div className="hidden sm:block">
                                            <div className="border-b border-gray-200">
                                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                                    <button
                                                        onClick={() => setFeeSubTab('master')}
                                                        className={`${feeSubTab === 'master'
                                                            ? 'border-indigo-500 text-indigo-600'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                                    >
                                                        Fee Master Definition
                                                    </button>
                                                    <button
                                                        onClick={() => setFeeSubTab('assignment')}
                                                        className={`${feeSubTab === 'assignment'
                                                            ? 'border-indigo-500 text-indigo-600'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                                    >
                                                        Product Fee Attachment
                                                    </button>
                                                </nav>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            {feeSubTab === 'master' && (
                                                <div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="text-lg font-bold text-gray-900">Fee Master Rules</h4>
                                                        <button className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                                            Create New Fee
                                                        </button>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Name</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income GL</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {fees.map((fee) => (
                                                                    <tr key={fee.id}>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fee.name}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.method}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.value}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.frequency}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.gl}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {feeSubTab === 'assignment' && (
                                                <div>
                                                    <div className="mb-6">
                                                        <label className="block text-sm font-medium text-gray-700">Select Product</label>
                                                        <select
                                                            value={selectedProduct}
                                                            onChange={(e) => setSelectedProduct(e.target.value)}
                                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                        >
                                                            {products.map(p => <option key={p} value={p}>{p}</option>)}
                                                        </select>
                                                    </div>

                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="text-lg font-bold text-gray-900">Attached Fees for {selectedProduct}</h4>
                                                        <button className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                                            Attach Fee
                                                        </button>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Trigger</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Name</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waiver Condition</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {feeAssignments
                                                                    .filter(fa => fa.product === selectedProduct)
                                                                    .map((fa, idx) => (
                                                                        <tr key={idx}>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fa.event}</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                                {fees.find(f => f.id === fa.feeId)?.name || fa.feeId}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fa.waiver}</td>
                                                                        </tr>
                                                                    ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {showAddModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={handleAddGL}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add GL Account</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">GL Code</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newGL.code}
                                                    onChange={(e) => setNewGL({ ...newGL, code: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">GL Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newGL.name}
                                                    onChange={(e) => setNewGL({ ...newGL, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                                <select
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newGL.type}
                                                    onChange={(e) => setNewGL({ ...newGL, type: e.target.value })}
                                                >
                                                    <option value="ASSET">Asset</option>
                                                    <option value="LIABILITY">Liability</option>
                                                    <option value="EQUITY">Equity</option>
                                                    <option value="INCOME">Income</option>
                                                    <option value="EXPENSE">Expense</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Parent GL (Optional)</label>
                                                <input
                                                    type="text"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newGL.parent}
                                                    onChange={(e) => setNewGL({ ...newGL, parent: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
                                            Add
                                        </button>
                                        <button type="button" onClick={() => setShowAddModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ProductConfig;
