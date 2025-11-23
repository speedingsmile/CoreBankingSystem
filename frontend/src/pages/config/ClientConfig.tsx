import React from 'react';
import Layout from '../../components/Layout';

const ClientConfig: React.FC = () => {
    return (
        <Layout>
            <div className="py-10">
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            Client & Party Configuration
                        </h1>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-6">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                            <p>Configuration for Customer Taxonomies, KYC, and Relationships will go here.</p>
                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default ClientConfig;
