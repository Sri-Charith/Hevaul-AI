import React from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, LogOut, Shield, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Fallback if user data isn't loaded yet (though ProtectedRoute should handle this)
    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8">

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-12 text-white shadow-2xl shadow-blue-500/20">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-3xl font-bold shadow-xl">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{user.name}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-blue-100 bg-blue-500/20 px-4 py-1.5 rounded-full backdrop-blur-sm w-fit mx-auto md:mx-0">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm font-medium">{user.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* Account Details Card */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Account Security</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-500 font-medium">Account ID</div>
                                <div className="font-mono text-gray-900 mt-1">{user._id}</div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        </div>

                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="text-sm text-gray-500 font-medium mb-2">Authentication Method</div>
                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                {/* We could infer this or store it, but for now generic */}
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Secure Access
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity / Stats Card (Placeholder for now) */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Activity Status</h2>
                    </div>

                    <div className="flex flex-col items-center justify-center h-40 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                            <Activity className="w-6 h-6" />
                        </div>
                        <p className="text-gray-500 font-medium">No recent activity recorded</p>
                        <p className="text-xs text-gray-400 max-w-[200px]">Your interaction history will appear here as you use the AI features.</p>
                    </div>
                </div>

            </div>

            {/* Logout Button */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={handleLogout}
                    className="group flex items-center gap-2 px-8 py-4 bg-white border border-red-100 text-red-600 rounded-2xl font-semibold shadow-lg shadow-red-500/5 hover:bg-red-50 hover:border-red-200 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Sign Out of Account</span>
                </button>
            </div>

        </div>
    );
};

export default Profile;
