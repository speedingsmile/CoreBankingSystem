import React from 'react';
import Layout from '../../components/Layout';

const MarketConfig: React.FC = () => {
    return (
        <Layout>
            <div className="py-10">
                <header>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold leading-tight text-gray-900">
                            Securities & Investment Configuration
                        </h1>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-6">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                            <p>Configuration for Instrument Definitions, Market Setup, and Corporate Action Rules will go here.</p>
                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default MarketConfig;
