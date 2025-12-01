import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import BrandLogo from './BrandLogo';

const Navbar = () => {
    const location = useLocation();
    const isProfilePage = location.pathname === '/profile';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg shadow-gray-200/20 rounded-2xl px-6 py-3 flex items-center justify-between relative">

                    {/* Left Placeholder (to balance the center logo) */}
                    <div className="w-10">
                        {/* Could put a back button or menu here later */}
                    </div>

                    {/* Center Logo */}
                    <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group">
                        <BrandLogo logoSize="h-8" textSize="text-2xl" />
                        <div className="h-0.5 w-0 bg-blue-600 absolute -bottom-1 left-1/2 -translate-x-1/2 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
                    </Link>

                    {/* Right Profile Link */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/profile"
                            className={`p-2 rounded-xl transition-all duration-200 ${isProfilePage
                                ? 'bg-blue-100 text-blue-600'
                                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
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
