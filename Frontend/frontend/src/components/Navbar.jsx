import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { User, Dumbbell } from 'lucide-react';
import BrandLogo from './BrandLogo';

const Navbar = () => {
    const location = useLocation();
    const isProfilePage = location.pathname === '/profile';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-blue-600/95 backdrop-blur-xl border border-blue-500/30 shadow-lg shadow-blue-900/20 rounded-2xl px-6 py-3 flex items-center justify-between relative">

                    {/* Left Placeholder */}
                    <div className="w-10"></div>

                    {/* Center Logo */}
                    <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group">
                        <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm transition-transform duration-200 group-hover:scale-105">
                            <BrandLogo logoSize="h-8" textSize="text-2xl" />
                        </div>
                    </Link>

                    {/* Right Profile Link */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/exercises"
                            className={`p-2 rounded-xl transition-all duration-200 ${location.pathname === '/exercises'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'hover:bg-blue-500 text-blue-50 hover:text-white'
                                }`}
                        >
                            <Dumbbell className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/profile"
                            className={`p-2 rounded-xl transition-all duration-200 ${isProfilePage
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'hover:bg-blue-500 text-blue-50 hover:text-white'
                                }`}
                        >
                            <User className="w-5 h-5" />
                        </Link>
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;
