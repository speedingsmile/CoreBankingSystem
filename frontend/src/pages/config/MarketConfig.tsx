import React, { useState } from 'react';
import Layout from '../../components/Layout';

const MarketConfig: React.FC = () => {
    const [activeTab, setActiveTab] = useState('asset_classes');

    // Mock Data for Asset Classes
    const [assetClasses, setAssetClasses] = useState([
        { id: 'AC001', name: 'Equity', type: 'Common Stock', settlement: 'T+2' },
        { id: 'AC002', name: 'Government Bond', type: 'Fixed Income', settlement: 'T+1' },
        { id: 'AC003', name: 'ETF', type: 'Exchange Traded Fund', settlement: 'T+2' },
    ]);

    // Mock Data for Markets
    const [markets, setMarkets] = useState([
        { id: 'MKT001', mic: 'XNYS', name: 'New York Stock Exchange', currency: 'USD', timezone: 'EST' },
        { id: 'MKT002', mic: 'XNAS', name: 'NASDAQ', currency: 'USD', timezone: 'EST' },
        { id: 'MKT003', mic: 'XLON', name: 'London Stock Exchange', currency: 'GBP', timezone: 'GMT' },
    ]);

    // Mock Data for Valuation Logic
    const [valuationRules, setValuationRules] = useState([
        { id: 'VR001', assetClass: 'Equity', method: 'Last Traded Price', source: 'Market Data Feed' },
        { id: 'VR002', assetClass: 'Government Bond', method: 'Mid Price', source: 'Bloomberg' },
        { id: 'VR003', assetClass: 'ETF', method: 'NAV', source: 'Fund Administrator' },
    ]);

    // Modal States
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [showMarketModal, setShowMarketModal] = useState(false);
    const [showValuationModal, setShowValuationModal] = useState(false);

    // Form States
    const [newAsset, setNewAsset] = useState({ name: '', type: '', settlement: 'T+2' });
    const [newMarket, setNewMarket] = useState({ mic: '', name: '', currency: 'USD', timezone: 'UTC' });
    const [newValuation, setNewValuation] = useState({ assetClass: '', method: '', source: '' });

    const [editingAsset, setEditingAsset] = useState<any>(null);
    const [editingMarket, setEditingMarket] = useState<any>(null);
    const [editingValuation, setEditingValuation] = useState<any>(null);

    const handleSaveAssetClass = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAsset) {
            setAssetClasses(assetClasses.map(ac => ac.id === editingAsset.id ? { ...ac, ...newAsset } : ac));
            setEditingAsset(null);
        } else {
            const newId = `AC00${assetClasses.length + 1}`;
            setAssetClasses([...assetClasses, { id: newId, ...newAsset }]);
        }
        setShowAssetModal(false);
        setNewAsset({ name: '', type: '', settlement: 'T+2' });
    };

    const handleSaveMarket = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMarket) {
            setMarkets(markets.map(m => m.id === editingMarket.id ? { ...m, ...newMarket } : m));
            setEditingMarket(null);
        } else {
            const newId = `MKT00${markets.length + 1}`;
            setMarkets([...markets, { id: newId, ...newMarket }]);
        }
        setShowMarketModal(false);
        setNewMarket({ mic: '', name: '', currency: 'USD', timezone: 'UTC' });
    };

    const handleSaveValuationRule = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingValuation) {
            setValuationRules(valuationRules.map(vr => vr.id === editingValuation.id ? { ...vr, ...newValuation } : vr));
            setEditingValuation(null);
        } else {
            const newId = `VR00${valuationRules.length + 1}`;
            setValuationRules([...valuationRules, { id: newId, ...newValuation }]);
        }
        setShowValuationModal(false);
        setNewValuation({ assetClass: '', method: '', source: '' });
    };

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
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Asset Classes</h3>
                                            <button
                                                onClick={() => {
                                                    setEditingAsset(null);
                                                    setNewAsset({ name: '', type: '', settlement: 'T+2' });
                                                    setShowAssetModal(true);
                                                }}
                                                className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Add Asset Class
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Settlement</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {assetClasses.map((ac) => (
                                                        <tr key={ac.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ac.id}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ac.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ac.type}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ac.settlement}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                                <button onClick={() => {
                                                                    setEditingAsset(ac);
                                                                    setNewAsset({ name: ac.name, type: ac.type, settlement: ac.settlement });
                                                                    setShowAssetModal(true);
                                                                }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                                <button onClick={() => {
                                                                    if (window.confirm("Delete this asset class?")) {
                                                                        setAssetClasses(assetClasses.filter(item => item.id !== ac.id));
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
                                {activeTab === 'markets' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Market Setup</h3>
                                            <button
                                                onClick={() => {
                                                    setEditingMarket(null);
                                                    setNewMarket({ mic: '', name: '', currency: 'USD', timezone: 'UTC' });
                                                    setShowMarketModal(true);
                                                }}
                                                className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Add Market
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MIC</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timezone</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {markets.map((mkt) => (
                                                        <tr key={mkt.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mkt.mic}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mkt.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mkt.currency}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mkt.timezone}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                                <button onClick={() => {
                                                                    setEditingMarket(mkt);
                                                                    setNewMarket({ mic: mkt.mic, name: mkt.name, currency: mkt.currency, timezone: mkt.timezone });
                                                                    setShowMarketModal(true);
                                                                }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                                <button onClick={() => {
                                                                    if (window.confirm("Delete this market?")) {
                                                                        setMarkets(markets.filter(item => item.id !== mkt.id));
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
                                {activeTab === 'valuation' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Valuation Logic</h3>
                                            <button
                                                onClick={() => {
                                                    setEditingValuation(null);
                                                    setNewValuation({ assetClass: '', method: '', source: '' });
                                                    setShowValuationModal(true);
                                                }}
                                                className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Add Valuation Rule
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Class</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valuation Method</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Source</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {valuationRules.map((rule) => (
                                                        <tr key={rule.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rule.assetClass}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.method}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.source}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                                <button onClick={() => {
                                                                    setEditingValuation(rule);
                                                                    setNewValuation({ assetClass: rule.assetClass, method: rule.method, source: rule.source });
                                                                    setShowValuationModal(true);
                                                                }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                                <button onClick={() => {
                                                                    if (window.confirm("Delete this valuation rule?")) {
                                                                        setValuationRules(valuationRules.filter(item => item.id !== rule.id));
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
                            </div>
                        </div>
                    </div>
                </main>

                {/* Asset Class Modal */}
                {showAssetModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={handleSaveAssetClass}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{editingAsset ? 'Edit Asset Class' : 'Add Asset Class'}</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newAsset.name}
                                                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newAsset.type}
                                                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Settlement Cycle</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newAsset.settlement}
                                                    onChange={(e) => setNewAsset({ ...newAsset, settlement: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
                                            Save
                                        </button>
                                        <button type="button" onClick={() => setShowAssetModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Market Modal */}
                {showMarketModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={handleSaveMarket}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{editingMarket ? 'Edit Market' : 'Add Market'}</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Market Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newMarket.name}
                                                    onChange={(e) => setNewMarket({ ...newMarket, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">MIC Code</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newMarket.mic}
                                                    onChange={(e) => setNewMarket({ ...newMarket, mic: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Currency</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newMarket.currency}
                                                    onChange={(e) => setNewMarket({ ...newMarket, currency: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Timezone</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newMarket.timezone}
                                                    onChange={(e) => setNewMarket({ ...newMarket, timezone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
                                            Save
                                        </button>
                                        <button type="button" onClick={() => setShowMarketModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Valuation Rule Modal */}
                {showValuationModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={handleSaveValuationRule}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{editingValuation ? 'Edit Valuation Rule' : 'Add Valuation Rule'}</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Asset Class</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newValuation.assetClass}
                                                    onChange={(e) => setNewValuation({ ...newValuation, assetClass: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Valuation Method</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newValuation.method}
                                                    onChange={(e) => setNewValuation({ ...newValuation, method: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Data Source</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newValuation.source}
                                                    onChange={(e) => setNewValuation({ ...newValuation, source: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
                                            Save
                                        </button>
                                        <button type="button" onClick={() => setShowValuationModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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


export default MarketConfig;
