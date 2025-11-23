import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import FeeConfig from './FeeConfig';
import RuleConfig from './RuleConfig';

interface Product {
    id: string;
    name: string;
    interest_rate_bps: number;
    status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
    version: number;
    parent_product_id?: string;
    created_at: string;
}

const ProductConfig: React.FC = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('products'); // Default to products

    // Real Data for Products
    const [productsList, setProductsList] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    // Mock Data for COA (Keep existing mock for now)
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

    // Mock Data for Event Mappings
    const [showAddModal, setShowAddModal] = useState(false);
    const [newGL, setNewGL] = useState({ code: '', name: '', type: 'ASSET', parent: '' });
    const [editingGL, setEditingGL] = useState<any>(null);
    const [mappings] = useState([
        { event: 'Account Creation', debitGL: '', creditGL: '' },
        { event: 'Deposit', debitGL: '', creditGL: '' },
        { event: 'Withdrawal', debitGL: '', creditGL: '' },
        { event: 'Interest Accrual', debitGL: '', creditGL: '' },
        { event: 'Fee Charge', debitGL: '', creditGL: '' },
    ]);

    // Mock Data for Fee Master


    // Mock Data for Fee Assignments
    const [feeAssignments] = useState([
        { product: 'Gold Savings', event: 'On_Transfer', feeId: 'F001', waiver: 'Avg Bal > $5,000' },
        { product: 'Standard Checking', event: 'On_Withdrawal', feeId: 'F002', waiver: 'None' },
    ]);

    // Product Modal State
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState({ name: '', interest_rate_bps: 0, status: 'DRAFT' });

    // Fee Engine State
    const [feeSubTab, setFeeSubTab] = useState('master'); // 'master' or 'assignment'
    const [selectedProduct, setSelectedProduct] = useState('');

    useEffect(() => {
        fetchProducts();
    }, [token]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/products', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setProductsList(data || []);
                if (data && data.length > 0 && !selectedProduct) {
                    setSelectedProduct(data[0].name);
                }
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGL = (e: React.FormEvent) => {
        e.preventDefault();
        const parent = newGL.parent === '' ? null : newGL.parent;
        if (editingGL) {
            setCoa(coa.map(c => c.code === editingGL.code ? { ...newGL, parent } : c));
            setEditingGL(null);
            alert("GL Account Updated (Mock)");
        } else {
            setCoa([...coa, { ...newGL, parent }]);
            alert("GL Account Added (Mock)");
        }
        setShowAddModal(false);
        setNewGL({ code: '', name: '', type: 'ASSET', parent: '' });
    };

    const handleCreateProduct = () => {
        setEditingProduct(null);
        setProductForm({ name: '', interest_rate_bps: 0, status: 'DRAFT' });
        setShowProductModal(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            interest_rate_bps: product.interest_rate_bps,
            status: product.status as any
        });
        setShowProductModal(true);
    };

    const handleCloneProduct = async (id: string) => {
        if (!window.confirm("Are you sure you want to clone this product to a new Draft version?")) return;
        try {
            const response = await fetch(`http://localhost:8080/products/clone?id=${id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                fetchProducts();
                alert("Product Cloned Successfully");
            } else {
                const err = await response.text();
                alert("Failed to clone: " + err);
            }
        } catch (error) {
            console.error("Failed to clone product", error);
        }
    };

    const handleArchiveProduct = async (product: Product) => {
        if (!window.confirm("Are you sure you want to archive this product? It will no longer be available for new accounts.")) return;
        try {
            const response = await fetch(`http://localhost:8080/products?id=${product.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: product.name,
                    interest_rate_bps: product.interest_rate_bps,
                    status: 'ARCHIVED'
                })
            });
            if (response.ok) {
                fetchProducts();
            } else {
                const err = await response.text();
                alert("Failed to archive: " + err);
            }
        } catch (error) {
            console.error("Failed to archive product", error);
        }
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let url = 'http://localhost:8080/products';
            let method = 'POST';

            if (editingProduct) {
                url = `http://localhost:8080/products?id=${editingProduct.id}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(productForm)
            });

            if (response.ok) {
                setShowProductModal(false);
                fetchProducts();
            } else {
                const err = await response.text();
                alert("Operation failed: " + err);
            }
        } catch (error) {
            console.error("Failed to save product", error);
        }
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
                            Manage Product Lifecycle, Chart of Accounts, and Fee Engines.
                        </p>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-6">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex" aria-label="Tabs">
                                    <button
                                        onClick={() => setActiveTab('products')}
                                        className={`${activeTab === 'products'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Product Lifecycle
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('coa')}
                                        className={`${activeTab === 'coa'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Chart of Accounts
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('mapping')}
                                        className={`${activeTab === 'mapping'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Accounting Map
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('fees')}
                                        className={`${activeTab === 'fees'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Fee Engine
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('rules')}
                                        className={`${activeTab === 'rules'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Rules Engine
                                    </button>
                                </nav>
                            </div>
                            <div className="p-6">
                                {activeTab === 'products' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Product Definitions</h3>
                                            <button
                                                onClick={handleCreateProduct}
                                                className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Create New Product
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Rate</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {loading ? (
                                                        <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
                                                    ) : productsList.map((product) => (
                                                        <tr key={product.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(product.interest_rate_bps / 100).toFixed(2)}%</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                    ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                                        product.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-gray-100 text-gray-800'}`}>
                                                                    {product.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">v{product.version}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                                <button onClick={() => handleEditProduct(product)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                                {product.status === 'ACTIVE' && (
                                                                    <>
                                                                        <button onClick={() => handleCloneProduct(product.id)} className="text-blue-600 hover:text-blue-900">Clone</button>
                                                                        <button onClick={() => handleArchiveProduct(product)} className="text-red-600 hover:text-red-900">Archive</button>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'coa' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Chart of Accounts Definition</h3>
                                            <button
                                                onClick={() => {
                                                    setEditingGL(null);
                                                    setNewGL({ code: '', name: '', type: 'ASSET', parent: '' });
                                                    setShowAddModal(true);
                                                }}
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
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                                <button onClick={() => {
                                                                    setEditingGL(account);
                                                                    setNewGL({ code: account.code, name: account.name, type: account.type, parent: account.parent || '' });
                                                                    setShowAddModal(true);
                                                                }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                                <button onClick={() => {
                                                                    if (window.confirm("Delete this GL account?")) {
                                                                        setCoa(coa.filter(item => item.code !== account.code));
                                                                    }
                                                                }} className="text-red-600 hover:text-red-900">Delete</button>
                                                            </td>
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
                                                {productsList.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
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
                                                <FeeConfig />
                                            )}

                                            {feeSubTab === 'assignment' && (
                                                <div>
                                                    {/* ... existing assignment UI ... */}
                                                    <div className="mb-6">
                                                        <label className="block text-sm font-medium text-gray-700">Select Product</label>
                                                        <select
                                                            value={selectedProduct}
                                                            onChange={(e) => setSelectedProduct(e.target.value)}
                                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                        >
                                                            {productsList.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
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
                                                                                {/* Placeholder lookup since we don't have full fee list here anymore */}
                                                                                {fa.feeId}
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
                                {activeTab === 'rules' && (
                                    <RuleConfig />
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* GL Modal */}
                {showAddModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={handleSaveGL}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{editingGL ? 'Edit GL Account' : 'Add GL Account'}</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">GL Code</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newGL.code}
                                                    onChange={(e) => setNewGL({ ...newGL, code: e.target.value })}
                                                    disabled={!!editingGL}
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
                                            Save
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

                {/* Product Modal */}
                {showProductModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={handleSaveProduct}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                            {editingProduct ? 'Edit Product' : 'Create Product'}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={productForm.name}
                                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Interest Rate (Basis Points)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={productForm.interest_rate_bps}
                                                    onChange={(e) => setProductForm({ ...productForm, interest_rate_bps: parseInt(e.target.value) })}
                                                    disabled={editingProduct?.status === 'ACTIVE'}
                                                />
                                                {editingProduct?.status === 'ACTIVE' && (
                                                    <p className="text-xs text-yellow-600 mt-1">Interest rate cannot be changed for Active products. Clone to create a new version.</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                                <select
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={productForm.status}
                                                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                                                >
                                                    <option value="DRAFT">Draft</option>
                                                    <option value="ACTIVE">Active</option>
                                                    <option value="ARCHIVED">Archived</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
                                            Save
                                        </button>
                                        <button type="button" onClick={() => setShowProductModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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
