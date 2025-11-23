import React from 'react';
import Navbar from './Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            {children}
        </div>
    );
};

export default Layout;
