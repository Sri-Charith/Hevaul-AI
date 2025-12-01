import React from 'react';
import Navbar from './Navbar';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-28 px-4 pb-12 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
