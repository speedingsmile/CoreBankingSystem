import React from 'react';
import Sidebar from './Sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="pl-72 pr-8 py-8 min-h-screen transition-all duration-300">
                {children}
            </div>
        </div>
    );
};

export default Layout;
