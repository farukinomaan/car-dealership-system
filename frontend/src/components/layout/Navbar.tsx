import { Link, useNavigate } from 'react-router-dom';
import { Car, LogOut, Shield, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center group-hover:bg-brand-600 transition-colors">
                            <Car className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">AutoElite</span>
                    </Link>

                    {/* Nav Links */}
                    {isAuthenticated && (
                        <div className="flex items-center gap-2">
                            <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm font-medium">
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                            {isAdmin && (
                                <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all text-sm font-medium">
                                    <Shield className="w-4 h-4" />
                                    Admin
                                </Link>
                            )}
                        </div>
                    )}

                    {/* User */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <div className="hidden sm:flex items-center gap-2">
                                    <div className="w-8 h-8 bg-brand-500/20 rounded-full flex items-center justify-center">
                                        <span className="text-brand-400 text-xs font-bold">
                                            {user?.firstName[0]}{user?.lastName[0]}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-gray-500 text-xs capitalize">{user?.role.toLowerCase()}</p>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm">
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
                                <Link to="/register" className="btn-primary text-sm px-4 py-2">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
