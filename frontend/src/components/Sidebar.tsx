import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    PieChart,
    Activity,
    Settings,
    Users,
    CreditCard,
    LogOut,
    Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Accounts', href: '/accounts', icon: CreditCard },
        { name: 'Securities', href: '/securities', icon: PieChart },
        { name: 'Operations', href: '/operations', icon: Activity },
        { name: 'Clients', href: '/clients', icon: Users },
        { name: 'Approvals', href: '/my-approvals', icon: Briefcase },
        { name: 'Configuration', href: '/configuration', icon: Settings },
    ];

    const isActive = (path: string) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    return (
        <div className="fixed inset-y-0 left-0 w-64 glass-panel m-4 rounded-3xl flex flex-col z-50">
            <div className="flex items-center justify-center h-20 border-b border-white/10">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">
                    Antigravity
                </h1>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navigation.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${active
                                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                                    : 'text-gray-600 hover:bg-white/50 hover:text-brand-600'
                                }`}
                        >
                            <item.icon
                                className={`mr-3 h-5 w-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-brand-500'
                                    }`}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
