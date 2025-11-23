import React, { useState } from 'react';
import Layout from '../../components/Layout';

const ClientConfig: React.FC = () => {
    const [activeTab, setActiveTab] = useState('types');

    // Mock Data for Customer Types
    const [customerTypes, setCustomerTypes] = useState([
        { id: 'CT001', name: 'Retail', description: 'Individual customers' },
        { id: 'CT002', name: 'Corporate', description: 'Business entities' },
        { id: 'CT003', name: 'SME', description: 'Small and Medium Enterprises' },
    ]);

    // Mock Data for Documentation Rules
    const [docRules, setDocRules] = useState([
        { id: 'DR001', typeId: 'CT001', docName: 'Passport / ID', mandatory: true },
        { id: 'DR002', typeId: 'CT001', docName: 'Utility Bill', mandatory: true },
        { id: 'DR003', typeId: 'CT002', docName: 'Certificate of Incorporation', mandatory: true },
        { id: 'DR004', typeId: 'CT002', docName: 'Tax ID', mandatory: true },
    ]);

    // Mock Data for Data Constraints
    const [constraints, setConstraints] = useState([
        { id: 'DC001', typeId: 'CT001', field: 'Date of Birth', requirement: 'MANDATORY' },
        { id: 'DC002', typeId: 'CT002', field: 'Date of Incorporation', requirement: 'MANDATORY' },
        { id: 'DC003', typeId: 'CT001', field: 'Employer Name', requirement: 'OPTIONAL' },
    ]);

    const [selectedType, setSelectedType] = useState('CT001');

    // Modal States
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showDocModal, setShowDocModal] = useState(false);
    const [showConstraintModal, setShowConstraintModal] = useState(false);

    // Form States
    const [newType, setNewType] = useState({ name: '', description: '' });
    const [newDocRule, setNewDocRule] = useState({ docName: '', mandatory: true });
    const [newConstraint, setNewConstraint] = useState({ field: '', requirement: 'OPTIONAL' });

    const handleSaveCustomerType = (e: React.FormEvent) => {
        e.preventDefault();
        const newId = `CT00${customerTypes.length + 1}`;
        setCustomerTypes([...customerTypes, { id: newId, ...newType }]);
        setShowTypeModal(false);
        setNewType({ name: '', description: '' });
    };

    const handleSaveDocRule = (e: React.FormEvent) => {
        e.preventDefault();
        const newId = `DR00${docRules.length + 1}`;
        setDocRules([...docRules, { id: newId, typeId: selectedType, ...newDocRule }]);
        setShowDocModal(false);
        setNewDocRule({ docName: '', mandatory: true });
    };

    const handleSaveConstraint = (e: React.FormEvent) => {
        e.preventDefault();
        const newId = `DC00${constraints.length + 1}`;
        setConstraints([...constraints, { id: newId, typeId: selectedType, ...newConstraint }]);
        setShowConstraintModal(false);
        setNewConstraint({ field: '', requirement: 'OPTIONAL' });
    };

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
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Types</h3>
                                            <button
                                                onClick={() => setShowTypeModal(true)}
                                                className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Add Customer Type
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type ID</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {customerTypes.map((type) => (
                                                        <tr key={type.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{type.id}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type.description}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'docs' && (
                                    <div>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700">Select Customer Type</label>
                                            <select
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                            >
                                                {customerTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Required Documents</h3>
                                            <button
                                                onClick={() => setShowDocModal(true)}
                                                className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Add Document Rule
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {docRules
                                                        .filter(rule => rule.typeId === selectedType)
                                                        .map((rule) => (
                                                            <tr key={rule.id}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rule.docName}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rule.mandatory ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                                        {rule.mandatory ? 'Mandatory' : 'Optional'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'constraints' && (
                                    <div>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700">Select Customer Type</label>
                                            <select
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                            >
                                                {customerTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Field Constraints</h3>
                                            <button
                                                onClick={() => setShowConstraintModal(true)}
                                                className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Add Constraint
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {constraints
                                                        .filter(c => c.typeId === selectedType)
                                                        .map((c) => (
                                                            <tr key={c.id}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.field}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.requirement === 'MANDATORY' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                                        {c.requirement}
                                                                    </span>
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

                {/* Customer Type Modal */}
                {showTypeModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={handleSaveCustomerType}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add Customer Type</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newType.name}
                                                    onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newType.description}
                                                    onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
                                            Save
                                        </button>
                                        <button type="button" onClick={() => setShowTypeModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Document Rule Modal */}
                {showDocModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={handleSaveDocRule}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add Document Rule</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Document Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newDocRule.docName}
                                                    onChange={(e) => setNewDocRule({ ...newDocRule, docName: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    id="mandatory"
                                                    name="mandatory"
                                                    type="checkbox"
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    checked={newDocRule.mandatory}
                                                    onChange={(e) => setNewDocRule({ ...newDocRule, mandatory: e.target.checked })}
                                                />
                                                <label htmlFor="mandatory" className="ml-2 block text-sm text-gray-900">
                                                    Mandatory
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
                                            Save
                                        </button>
                                        <button type="button" onClick={() => setShowDocModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Constraint Modal */}
                {showConstraintModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={handleSaveConstraint}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add Field Constraint</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Field Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newConstraint.field}
                                                    onChange={(e) => setNewConstraint({ ...newConstraint, field: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Requirement</label>
                                                <select
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newConstraint.requirement}
                                                    onChange={(e) => setNewConstraint({ ...newConstraint, requirement: e.target.value })}
                                                >
                                                    <option value="MANDATORY">Mandatory</option>
                                                    <option value="OPTIONAL">Optional</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
                                            Save
                                        </button>
                                        <button type="button" onClick={() => setShowConstraintModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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


export default ClientConfig;
