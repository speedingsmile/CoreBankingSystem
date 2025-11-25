import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const [securities, setSecurities] = useState<Security[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState('identification');

    // Helper function to extract string from nullable backend fields
    const extractNullableString = (field: any): string => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        if (field.String) return field.String;
        return '';
    };

    // Helper to normalize security data from backend
    const normalizeSecurity = (sec: any): Security => {
        return {
            ...sec,
            isin: extractNullableString(sec.isin),
            cusip: extractNullableString(sec.cusip),
            sedol: extractNullableString(sec.sedol),
            bloom_reuters_code: extractNullableString(sec.bloom_reuters_code),
            asset_class: extractNullableString(sec.asset_class),
            country_of_issue: extractNullableString(sec.country_of_issue),
            quotational_basis: extractNullableString(sec.quotational_basis),
            coupon_type: extractNullableString(sec.coupon_type),
            frequency: extractNullableString(sec.frequency),
            day_count_convention: extractNullableString(sec.day_count_convention),
            issue_date: extractNullableString(sec.issue_date),
            maturity_date: extractNullableString(sec.maturity_date),
            primary_exchange: extractNullableString(sec.primary_exchange),
            price_source: extractNullableString(sec.price_source),
        };
    };

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
            if (!token) {
                navigate('/login');
                return;
            }
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
                        const detail = await detailRes.json();
                        return normalizeSecurity(detail);
                    }
                    return normalizeSecurity(sec);
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                                <input type="text" name="symbol" required className="glass-input w-full rounded-xl px-4 py-2" value={formData.symbol} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input type="text" name="name" required className="glass-input w-full rounded-xl px-4 py-2" value={formData.name} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ISIN</label>
                                <input type="text" name="isin" className="glass-input w-full rounded-xl px-4 py-2" value={formData.isin || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CUSIP</label>
                                <input type="text" name="cusip" className="glass-input w-full rounded-xl px-4 py-2" value={formData.cusip || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SEDOL</label>
                                <input type="text" name="sedol" className="glass-input w-full rounded-xl px-4 py-2" value={formData.sedol || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bloomberg/Reuters Code</label>
                                <input type="text" name="bloom_reuters_code" className="glass-input w-full rounded-xl px-4 py-2" value={formData.bloom_reuters_code || ''} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                );
            case 'classification':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Class</label>
                                <select name="asset_class" className="glass-input w-full rounded-xl px-4 py-2" value={formData.asset_class} onChange={handleInputChange}>
                                    <option value="Equity">Equity</option>
                                    <option value="Fixed Income">Fixed Income</option>
                                    <option value="Derivative">Derivative</option>
                                    <option value="Fund">Fund</option>
                                    <option value="FX">FX</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Security Type</label>
                                <select name="type" className="glass-input w-full rounded-xl px-4 py-2" value={formData.type} onChange={handleInputChange}>
                                    <option value="STOCK">Common Stock</option>
                                    <option value="BOND">Corporate Bond</option>
                                    <option value="GOVT_BOND">Govt Bond</option>
                                    <option value="ETF">ETF</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                <input type="text" name="currency" className="glass-input w-full rounded-xl px-4 py-2" value={formData.currency} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country of Issue</label>
                                <input type="text" name="country_of_issue" className="glass-input w-full rounded-xl px-4 py-2" value={formData.country_of_issue || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quotational Basis</label>
                                <select name="quotational_basis" className="glass-input w-full rounded-xl px-4 py-2" value={formData.quotational_basis} onChange={handleInputChange}>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Rate</label>
                                <input type="number" step="0.000001" name="coupon_rate" className="glass-input w-full rounded-xl px-4 py-2" value={formData.coupon_rate || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Type</label>
                                <select name="coupon_type" className="glass-input w-full rounded-xl px-4 py-2" value={formData.coupon_type} onChange={handleInputChange}>
                                    <option value="Fixed">Fixed</option>
                                    <option value="Floating">Floating</option>
                                    <option value="Zero Coupon">Zero Coupon</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                                <select name="frequency" className="glass-input w-full rounded-xl px-4 py-2" value={formData.frequency} onChange={handleInputChange}>
                                    <option value="Annual">Annual</option>
                                    <option value="Semi-Annual">Semi-Annual</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Monthly">Monthly</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Day Count Convention</label>
                                <select name="day_count_convention" className="glass-input w-full rounded-xl px-4 py-2" value={formData.day_count_convention} onChange={handleInputChange}>
                                    <option value="30/360">30/360</option>
                                    <option value="Actual/360">Actual/360</option>
                                    <option value="Actual/Actual">Actual/Actual</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                                <input type="date" name="issue_date" className="glass-input w-full rounded-xl px-4 py-2" value={formData.issue_date ? new Date(formData.issue_date).toISOString().split('T')[0] : ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Maturity Date</label>
                                <input type="date" name="maturity_date" className="glass-input w-full rounded-xl px-4 py-2" value={formData.maturity_date ? new Date(formData.maturity_date).toISOString().split('T')[0] : ''} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                );
            case 'market':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Exchange</label>
                                <input type="text" name="primary_exchange" className="glass-input w-full rounded-xl px-4 py-2" value={formData.primary_exchange || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trading Lot Size</label>
                                <input type="number" name="trading_lot_size" className="glass-input w-full rounded-xl px-4 py-2" value={formData.trading_lot_size || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price Source</label>
                                <select name="price_source" className="glass-input w-full rounded-xl px-4 py-2" value={formData.price_source} onChange={handleInputChange}>
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
            <div className="space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Securities Master File</h1>
                        <p className="text-gray-500 mt-1">Manage global security definitions and pricing.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-600/30 hover:bg-brand-700 transition-all font-medium"
                    >
                        + Add Security
                    </button>
                </header>

                <div className="glass-card rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Symbol</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ISIN</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Latest Price</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading securities...</td></tr>
                                ) : securities.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No securities found.</td></tr>
                                ) : (
                                    securities.map((sec) => (
                                        <tr key={sec.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{sec.symbol}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sec.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{sec.isin || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    {sec.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                                                {sec.latest_price ? `${sec.latest_price.price.toFixed(2)} ${sec.latest_price.currency || sec.currency}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleSync(sec.symbol)}
                                                    className="text-brand-600 hover:text-brand-900 font-medium hover:underline"
                                                >
                                                    Sync Price
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom glass-panel rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Security</h3>

                            <form onSubmit={handleCreate}>
                                <div className="mb-6 border-b border-gray-200">
                                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                        {['identification', 'classification', 'fixed_income', 'market'].map((tab) => (
                                            <a
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`${activeTab === tab
                                                    ? 'border-brand-500 text-brand-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize cursor-pointer transition-colors`}
                                            >
                                                {tab.replace('_', ' ')}
                                            </a>
                                        ))}
                                    </nav>
                                </div>

                                <div className="mt-6 min-h-[300px]">
                                    {renderTabContent()}
                                </div>

                                <div className="mt-8 flex justify-end space-x-3">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-medium shadow-lg shadow-brand-600/20">Create Security</button>
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
