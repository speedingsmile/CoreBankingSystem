import React, { useState } from 'react';
import Layout from '../../components/Layout';

const SecurityConfig: React.FC = () => {
    const [activeTab, setActiveTab] = useState('roles');

    // Mock Data
    const [roles, setRoles] = useState([
        { id: 'R001', name: 'Teller', description: 'Front desk staff' },
        { id: 'R002', name: 'Branch Manager', description: 'Branch operations oversight' },
        { id: 'R003', name: 'Compliance Officer', description: 'Risk and compliance monitoring' },
    ]);

    const [permissions] = useState([
        { id: 'P001', name: 'Can_Create_Customer', category: 'Customer' },
        { id: 'P002', name: 'Can_Post_Deposit', category: 'Transaction' },
        { id: 'P003', name: 'Can_Post_Withdrawal', category: 'Transaction' },
        { id: 'P004', name: 'Can_Approve_High_Value', category: 'Approval' },
        { id: 'P005', name: 'Can_View_GL', category: 'Reporting' },
    ]);

    const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
        'R001': ['P001', 'P002', 'P003'],
        'R002': ['P001', 'P002', 'P003', 'P004', 'P005'],
    });

    const [limits, setLimits] = useState([
        { id: 'L001', roleId: 'R001', type: 'Withdrawal', amount: 10000, currency: 'USD' },
        { id: 'L002', roleId: 'R002', type: 'Withdrawal', amount: 100000, currency: 'USD' },
    ]);

    const [users, setUsers] = useState([
        { id: 'U001', username: 'jdoe', empId: 'E1001', branch: 'Main Branch', roleId: 'R001', status: 'Active' },
        { id: 'U002', username: 'asmith', empId: 'E1002', branch: 'Main Branch', roleId: 'R002', status: 'Active' },
    ]);

    // Modal States
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPermModal, setShowPermModal] = useState(false);
    const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<string | null>(null);

    // Form States
    const [newRole, setNewRole] = useState({ name: '', description: '' });
    const [newLimit, setNewLimit] = useState({ roleId: '', type: 'Withdrawal', amount: 0, currency: 'USD' });
    const [newUser, setNewUser] = useState({ username: '', empId: '', branch: '', roleId: '', status: 'Active' });

    // Edit States
    const [editingRole, setEditingRole] = useState<any>(null);
    const [editingLimit, setEditingLimit] = useState<any>(null);
    const [editingUser, setEditingUser] = useState<any>(null);

    // Handlers
    const handleSaveRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRole) {
            setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...newRole } : r));
            setEditingRole(null);
        } else {
            const newId = `R00${roles.length + 1}`;
            setRoles([...roles, { id: newId, ...newRole }]);
        }
        setShowRoleModal(false);
        setNewRole({ name: '', description: '' });
    };

    const handleSaveLimit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLimit) {
            setLimits(limits.map(l => l.id === editingLimit.id ? { ...l, ...newLimit } : l));
            setEditingLimit(null);
        } else {
            const newId = `L00${limits.length + 1}`;
            setLimits([...limits, { id: newId, ...newLimit }]);
        }
        setShowLimitModal(false);
        setNewLimit({ roleId: '', type: 'Withdrawal', amount: 0, currency: 'USD' });
    };

    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...newUser } : u));
            setEditingUser(null);
        } else {
            const newId = `U00${users.length + 1}`;
            setUsers([...users, { id: newId, ...newUser }]);
        }
        setShowUserModal(false);
        setNewUser({ username: '', empId: '', branch: '', roleId: '', status: 'Active' });
    };

    const togglePermission = (permId: string) => {
        if (!selectedRoleForPerms) return;
        const currentPerms = rolePermissions[selectedRoleForPerms] || [];
        if (currentPerms.includes(permId)) {
            setRolePermissions({
                ...rolePermissions,
                [selectedRoleForPerms]: currentPerms.filter(id => id !== permId)
            });
        } else {
            setRolePermissions({
                ...rolePermissions,
                [selectedRoleForPerms]: [...currentPerms, permId]
            });
        }
    };

    const openPermModal = (roleId: string) => {
        setSelectedRoleForPerms(roleId);
        setShowPermModal(true);
    };

    return (
        <Layout>
            <div className="py-10">
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            Security & Access Control
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Manage Roles, Permissions, Approval Limits, and User Access.
                        </p>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-6">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex" aria-label="Tabs">
                                    <button
                                        onClick={() => setActiveTab('roles')}
                                        className={`${activeTab === 'roles'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Permission Registry & Role Builder
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('limits')}
                                        className={`${activeTab === 'limits'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        Approval Limits
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('users')}
                                        className={`${activeTab === 'users'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                    >
                                        User Management
                                    </button>
                                </nav>
                            </div>
                            <div className="p-6">
                                {activeTab === 'roles' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Role Definitions</h3>
                                            <button
                                                onClick={() => {
                                                    setEditingRole(null);
                                                    setNewRole({ name: '', description: '' });
                                                    setShowRoleModal(true);
                                                }}
                                                className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Create Role
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {roles.map((role) => (
                                                        <tr key={role.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.description}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                                                                <button
                                                                    onClick={() => openPermModal(role.id)}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    Permissions
                                                                </button>
                                                                <button onClick={() => {
                                                                    setEditingRole(role);
                                                                    setNewRole({ name: role.name, description: role.description });
                                                                    setShowRoleModal(true);
                                                                }} className="text-blue-600 hover:text-blue-900">Edit</button>
                                                                <button onClick={() => {
                                                                    if (window.confirm("Delete this role?")) {
                                                                        setRoles(roles.filter(item => item.id !== role.id));
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

                                {activeTab === 'limits' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Transaction Approval Limits</h3>
                                            <button
                                                onClick={() => {
                                                    setEditingLimit(null);
                                                    setNewLimit({ roleId: '', type: 'Withdrawal', amount: 0, currency: 'USD' });
                                                    setShowLimitModal(true);
                                                }}
                                                className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Set New Limit
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Type</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limit Amount</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {limits.map((limit) => (
                                                        <tr key={limit.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {roles.find(r => r.id === limit.roleId)?.name || limit.roleId}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{limit.type}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{limit.amount.toLocaleString()}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{limit.currency}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                                <button onClick={() => {
                                                                    setEditingLimit(limit);
                                                                    setNewLimit({ roleId: limit.roleId, type: limit.type, amount: limit.amount, currency: limit.currency });
                                                                    setShowLimitModal(true);
                                                                }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                                <button onClick={() => {
                                                                    if (window.confirm("Delete this limit?")) {
                                                                        setLimits(limits.filter(item => item.id !== limit.id));
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

                                {activeTab === 'users' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Staff Onboarding</h3>
                                            <button
                                                onClick={() => {
                                                    setEditingUser(null);
                                                    setNewUser({ username: '', empId: '', branch: '', roleId: '', status: 'Active' });
                                                    setShowUserModal(true);
                                                }}
                                                className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Add User
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {users.map((user) => (
                                                        <tr key={user.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.empId}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.branch}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {roles.find(r => r.id === user.roleId)?.name || user.roleId}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                    {user.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                                <button onClick={() => {
                                                                    setEditingUser(user);
                                                                    setNewUser({ username: user.username, empId: user.empId, branch: user.branch, roleId: user.roleId, status: user.status });
                                                                    setShowUserModal(true);
                                                                }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                                <button onClick={() => {
                                                                    if (window.confirm("Delete this user?")) {
                                                                        setUsers(users.filter(item => item.id !== user.id));
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

                {/* Role Modal */}
                {showRoleModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={handleSaveRole}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{editingRole ? 'Edit Role' : 'Create New Role'}</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Role Name</label>
                                                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                                        <button type="button" onClick={() => setShowRoleModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Permission Modal */}
                {showPermModal && selectedRoleForPerms && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        Assign Permissions to {roles.find(r => r.id === selectedRoleForPerms)?.name}
                                    </h3>
                                    <div className="mt-2 max-h-60 overflow-y-auto">
                                        {permissions.map(perm => (
                                            <div key={perm.id} className="flex items-start mb-2">
                                                <div className="flex items-center h-5">
                                                    <input
                                                        id={`perm-${perm.id}`}
                                                        name={`perm-${perm.id}`}
                                                        type="checkbox"
                                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                                        checked={(rolePermissions[selectedRoleForPerms] || []).includes(perm.id)}
                                                        onChange={() => togglePermission(perm.id)}
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm">
                                                    <label htmlFor={`perm-${perm.id}`} className="font-medium text-gray-700">{perm.name}</label>
                                                    <p className="text-gray-500">{perm.category}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="button" onClick={() => setShowPermModal(false)} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">Done</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Limit Modal */}
                {showLimitModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={handleSaveLimit}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{editingLimit ? 'Edit Approval Limit' : 'Set Approval Limit'}</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                                <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newLimit.roleId} onChange={(e) => setNewLimit({ ...newLimit, roleId: e.target.value })}>
                                                    <option value="">Select Role</option>
                                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
                                                <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newLimit.type} onChange={(e) => setNewLimit({ ...newLimit, type: e.target.value })}>
                                                    <option value="Withdrawal">Withdrawal</option>
                                                    <option value="Transfer">Transfer</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Limit Amount</label>
                                                <input type="number" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newLimit.amount} onChange={(e) => setNewLimit({ ...newLimit, amount: Number(e.target.value) })} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                                        <button type="button" onClick={() => setShowLimitModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Modal */}
                {showUserModal && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={handleSaveUser}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{editingUser ? 'Edit User' : 'Add New User'}</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                                                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newUser.empId} onChange={(e) => setNewUser({ ...newUser, empId: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Username</label>
                                                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Branch</label>
                                                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newUser.branch} onChange={(e) => setNewUser({ ...newUser, branch: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                                <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newUser.roleId} onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}>
                                                    <option value="">Select Role</option>
                                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                                <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={newUser.status} onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}>
                                                    <option value="Active">Active</option>
                                                    <option value="Locked">Locked</option>
                                                    <option value="Disabled">Disabled</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                                        <button type="button" onClick={() => setShowUserModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
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

export default SecurityConfig;
