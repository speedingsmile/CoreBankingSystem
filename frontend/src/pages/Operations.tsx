import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Operations: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Operations / Front Office
                    </h1>
                    <p className="mt-2 text-gray-500 text-lg">
                        Manage day-to-day operations, client onboarding, and master data maintenance.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Clients Setup Card */}
                    <div className="glass-card p-8 rounded-3xl hover:scale-[1.02] transition-transform duration-300 cursor-pointer group" onClick={() => navigate('/clients')}>
                        <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors duration-300">
                            <svg className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Client Master File</h3>
                        <p className="text-gray-500 mb-6">
                            Manage client profiles, KYC status, and segment assignments.
                        </p>
                        <span className="text-brand-600 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center">
                            Manage Clients <span className="ml-2">→</span>
                        </span>
                    </div>

                    {/* Accounts Setup Card */}
                    <div className="glass-card p-8 rounded-3xl hover:scale-[1.02] transition-transform duration-300 cursor-pointer group" onClick={() => navigate('/accounts')}>
                        <div className="h-12 w-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500 transition-colors duration-300">
                            <svg className="w-6 h-6 text-green-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Account Master File</h3>
                        <p className="text-gray-500 mb-6">
                            Manage customer accounts, balances, and product assignments.
                        </p>
                        <span className="text-brand-600 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center">
                            Manage Accounts <span className="ml-2">→</span>
                        </span>
                    </div>

                    {/* Securities Setup Card */}
                    <div className="glass-card p-8 rounded-3xl hover:scale-[1.02] transition-transform duration-300 cursor-pointer group" onClick={() => navigate('/securities')}>
                        <div className="h-12 w-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-colors duration-300">
                            <svg className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Security Master File</h3>
                        <p className="text-gray-500 mb-6">
                            Manage tradable securities, prices, and market data.
                        </p>
                        <span className="text-brand-600 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center">
                            Manage Securities <span className="ml-2">→</span>
                        </span>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Operations;
