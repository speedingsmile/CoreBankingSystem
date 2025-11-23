import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

interface Security {
    id: string;
    symbol: string;
    name: string;
    type: string;
    currency: string;
    isin?: string;
    cusip?: string;
    sedol?: string;
    bloom_reuters_code?: string;
    asset_class?: string;
    country_of_issue?: string;
    quotational_basis?: string;
    coupon_rate?: number;
    coupon_type?: string;
    frequency?: string;
    day_count_convention?: string;
    issue_date?: string;
    maturity_date?: string;
    primary_exchange?: string;
    trading_lot_size?: number;
    price_source?: string;
    latest_price?: {
        price: number;
        currency?: string;
        timestamp: string;
        source: string;
    };
}

const Securities: React.FC = () => {
    const { token } = useAuth();
    const [securities, setSecurities] = useState<Security[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState('identification');

    // Form State
    const [formData, setFormData] = useState<Partial<Security>>({
        symbol: '',
        name: '',
        type: 'STOCK',
        currency: 'USD',
        asset_class: 'Equity',
        quotational_basis: 'Per Unit',
        coupon_type: 'Fixed',
        frequency: 'Annual',
        day_count_convention: '30/360',
        price_source: 'Manual'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'coupon_rate' || name === 'trading_lot_size' ? Number(value) : value
        }));
    };

    const fetchSecurities = async () => {
        try {
            const response = await fetch('http://localhost:8080/securities', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                const detailedSecurities = await Promise.all(data.map(async (sec: Security) => {
                    const detailRes = await fetch(`http://localhost:8080/securities?symbol=${sec.symbol}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (detailRes.ok) {
                        return await detailRes.json();
                    }
                    return sec;
                }));
                setSecurities(detailedSecurities);
            }
        } catch (error) {
            console.error('Failed to fetch securities', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSecurities();
    }, [token]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/securities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setShowCreateModal(false);
                setFormData({
                    symbol: '',
                    name: '',
                    type: 'STOCK',
                    currency: 'USD',
                    asset_class: 'Equity',
                    quotational_basis: 'Per Unit',
                    coupon_type: 'Fixed',
                    frequency: 'Annual',
                    day_count_convention: '30/360',
                    price_source: 'Manual'
                });
                fetchSecurities();
            }
        } catch (error) {
            console.error('Failed to create security', error);
        }
    };

    const handleSync = async (symbol: string) => {
        try {
            const response = await fetch(`http://localhost:8080/securities/sync?symbol=${symbol}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                fetchSecurities();
            }
        } catch (error) {
            console.error('Failed to sync price', error);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'identification':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Symbol</label>
                                <input type="text" name="symbol" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.symbol} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" name="name" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.name} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ISIN</label>
                                <input type="text" name="isin" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.isin || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">CUSIP</label>
                                <input type="text" name="cusip" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.cusip || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">SEDOL</label>
                                <input type="text" name="sedol" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.sedol || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Bloomberg/Reuters Code</label>
                                <input type="text" name="bloom_reuters_code" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.bloom_reuters_code || ''} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                );
            case 'classification':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Asset Class</label>
                                <select name="asset_class" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.asset_class} onChange={handleInputChange}>
                                    <option value="Equity">Equity</option>
                                    <option value="Fixed Income">Fixed Income</option>
                                    <option value="Derivative">Derivative</option>
                                    <option value="Fund">Fund</option>
                                    <option value="FX">FX</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Security Type</label>
                                <select name="type" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.type} onChange={handleInputChange}>
                                    <option value="STOCK">Common Stock</option>
                                    <option value="BOND">Corporate Bond</option>
                                    <option value="GOVT_BOND">Govt Bond</option>
                                    <option value="ETF">ETF</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Currency</label>
                                <input type="text" name="currency" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.currency} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Country of Issue</label>
                                <input type="text" name="country_of_issue" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.country_of_issue || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Quotational Basis</label>
                                <select name="quotational_basis" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.quotational_basis} onChange={handleInputChange}>
                                    <option value="Per Unit">Per Unit</option>
                                    <option value="Percentage of Par">Percentage of Par</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
            case 'fixed_income':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Coupon Rate</label>
                                <input type="number" step="0.000001" name="coupon_rate" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.coupon_rate || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Coupon Type</label>
                                <select name="coupon_type" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.coupon_type} onChange={handleInputChange}>
                                    <option value="Fixed">Fixed</option>
                                    <option value="Floating">Floating</option>
                                    <option value="Zero Coupon">Zero Coupon</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                                <select name="frequency" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.frequency} onChange={handleInputChange}>
                                    <option value="Annual">Annual</option>
                                    <option value="Semi-Annual">Semi-Annual</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Monthly">Monthly</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Day Count Convention</label>
                                <select name="day_count_convention" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.day_count_convention} onChange={handleInputChange}>
                                    <option value="30/360">30/360</option>
                                    <option value="Actual/360">Actual/360</option>
                                    <option value="Actual/Actual">Actual/Actual</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                                <input type="date" name="issue_date" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.issue_date ? new Date(formData.issue_date).toISOString().split('T')[0] : ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Maturity Date</label>
                                <input type="date" name="maturity_date" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.maturity_date ? new Date(formData.maturity_date).toISOString().split('T')[0] : ''} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                );
            case 'market':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Primary Exchange</label>
                                <input type="text" name="primary_exchange" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.primary_exchange || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Trading Lot Size</label>
                                <input type="number" name="trading_lot_size" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.trading_lot_size || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price Source</label>
                                <select name="price_source" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.price_source} onChange={handleInputChange}>
                                    <option value="Bloomberg">Bloomberg</option>
                                    <option value="Reuters">Reuters</option>
                                    <option value="Manual">Manual</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Layout>
            <div className="py-10">
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">Securities Master File</h1>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                        >
                            Add Security
                        </button>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-6">
                        {loading ? (
                            <p>Loading securities...</p>
                        ) : (
                            <div className="flex flex-col">
                                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISIN</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Price</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {securities.map((sec) => (
                                                        <tr key={sec.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sec.symbol}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sec.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sec.isin || '-'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sec.type}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                                                {sec.latest_price ? `${sec.latest_price.price.toFixed(2)} ${sec.latest_price.currency || sec.currency}` : '-'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <button
                                                                    onClick={() => handleSync(sec.symbol)}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    Sync Price
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {securities.length === 0 && (
                                                        <tr>
                                                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No securities found.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {showCreateModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <form onSubmit={handleCreate}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Security</h3>

                                    <div className="mb-4 border-b border-gray-200">
                                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                            {['identification', 'classification', 'fixed_income', 'market'].map((tab) => (
                                                <a
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`${activeTab === tab
                                                        ? 'border-indigo-500 text-indigo-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize cursor-pointer`}
                                                >
                                                    {tab.replace('_', ' ')}
                                                </a>
                                            ))}
                                        </nav>
                                    </div>

                                    <div className="mt-4">
                                        {renderTabContent()}
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">Create</button>
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Securities;
