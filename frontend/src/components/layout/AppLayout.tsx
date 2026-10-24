import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Car,
    Package,
    LogOut,
    Bell,
    Mail,
    Sun,
    ShieldCheck,
    Eye,
    Search,
    X,
    AlertCircle,
    Menu,
} from 'lucide-react';

interface AppLayoutProps {
    children: React.ReactNode;
    isAdminLayout?: boolean;
    onSearchQuery?: (query: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
    children,
    isAdminLayout = false,
    onSearchQuery,
}) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchVal, setSearchVal] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        setIsMobileMenuOpen(false);
        logout();
        navigate('/login');
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchVal(val);
        onSearchQuery?.(val);
    };

    const clearSearch = () => {
        setSearchVal('');
        onSearchQuery?.('');
    };

    const navItemClass = ({ isActive }: { isActive: boolean }) =>
        `w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${isActive
            ? 'bg-brand-yellow text-gray-900 shadow-sm font-semibold'
            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
        }`;

    const isAdmin = user?.role === 'ADMIN' || isAdminLayout;

    return (
        <div className="min-h-screen bg-[#F4F5F7]">
            {/* ========================================================= */}
            {/* MOBILE ONLY: TOP HEADER (Menu Bar + Logo + Avatar)        */}
            {/* ========================================================= */}
            <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/60 px-4 py-3 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                        aria-label="Open Menu"
                    >
                        <Menu size={22} />
                    </button>
                    {/* Brand Logo & Name */}
                    <div
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <div className="w-8 h-8 bg-brand-dark text-white rounded-lg flex items-center justify-center shadow-xs">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                <polyline points="2 17 12 22 22 17" />
                                <polyline points="2 12 12 17 22 12" />
                            </svg>
                        </div>
                        <h1 className="text-lg font-extrabold tracking-tight text-gray-900">
                            DriveMatch
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Admin
                        </span>
                    )}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 font-bold text-gray-900 flex items-center justify-center shadow-xs text-xs border border-white">
                        {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                </div>
            </header>

            {/* Mobile Slide-Out Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-fade-in"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="relative w-72 bg-white h-full flex flex-col justify-between p-6 shadow-2xl z-10 animate-fade-in">
                        <div>
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-brand-dark text-white rounded-lg flex items-center justify-center">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                            <polyline points="2 17 12 22 22 17" />
                                            <polyline points="2 12 12 17 22 12" />
                                        </svg>
                                    </div>
                                    <span className="font-extrabold text-base text-gray-900">DriveMatch</span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* User details */}
                            <div className="mt-4 p-3 bg-gray-50 rounded-2xl flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-brand-yellow font-bold text-gray-900 flex items-center justify-center text-xs">
                                    {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-semibold text-gray-800 truncate">{user?.email}</p>
                                    <span className="text-[10px] text-gray-500 capitalize">{user?.role?.toLowerCase() || 'Customer'}</span>
                                </div>
                            </div>

                            {/* Nav links */}
                            <div className="mt-6 flex flex-col gap-2">
                                <NavLink
                                    to="/dashboard"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${isActive
                                            ? 'bg-brand-yellow text-gray-900 shadow-xs'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <Car size={18} />
                                    <span>Browse Vehicles</span>
                                </NavLink>

                                {isAdmin && (
                                    <NavLink
                                        to="/admin"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${isActive
                                                ? 'bg-brand-yellow text-gray-900 shadow-xs'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`
                                        }
                                    >
                                        <Package size={18} />
                                        <span>Admin Inventory</span>
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        {/* Mobile Sign Out */}
                        <div className="pt-4 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setShowLogoutConfirm(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={18} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* DESKTOP ONLY: 1. FIXED SLIM LEFT SIDEBAR                  */}
            {/* ========================================================= */}
            <aside className="hidden md:flex fixed top-6 left-6 bottom-6 w-16 bg-white rounded-3xl py-6 flex-col items-center justify-between shadow-sm border border-gray-100 z-40">
                <div className="flex flex-col items-center gap-6">
                    {/* Brand Logo */}
                    <div className="w-10 h-10 bg-brand-dark text-white rounded-xl flex items-center justify-center shadow-md cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                        </svg>
                    </div>

                    <nav className="flex flex-col gap-3 mt-2">
                        {isAdmin ? (
                            <>
                                <NavLink
                                    to="/dashboard"
                                    className={({ isActive }) =>
                                        `w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${location.pathname === '/dashboard'
                                            ? 'bg-brand-yellow text-gray-900 shadow-sm font-semibold'
                                            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                                        }`
                                    }
                                    title="Customer Preview"
                                >
                                    <Eye size={20} />
                                </NavLink>

                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) =>
                                        `w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${location.pathname === '/admin'
                                            ? 'bg-brand-yellow text-gray-900 shadow-sm font-semibold'
                                            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                                        }`
                                    }
                                    title="Admin Inventory Panel"
                                >
                                    <Package size={20} />
                                </NavLink>
                            </>
                        ) : (
                            <NavLink to="/dashboard" className={navItemClass} title="Browse Vehicles">
                                <Car size={20} />
                            </NavLink>
                        )}
                    </nav>
                </div>

                {/* Bottom Logout Action Triggering Confirmation Modal */}
                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Log out"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </aside>

            {/* ========================================================= */}
            {/* DESKTOP ONLY: 2. FIXED TOP NAVBAR WITH SLEEK SEARCH BAR   */}
            {/* ========================================================= */}
            <header className="hidden md:flex fixed top-0 left-28 right-6 h-20 bg-[#F4F5F7]/90 backdrop-blur-md z-30 items-center justify-between border-b border-gray-200/40 px-2 gap-4">
                {/* Brand & Badge */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">DriveMatch</h1>
                    {isAdmin && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <ShieldCheck size={13} /> Admin
                        </span>
                    )}
                </div>

                {/* PROMINENT TOP SEARCH BAR */}
                {onSearchQuery && (
                    <div className="flex-1 max-w-md mx-4">
                        <div className="relative flex items-center">
                            <Search size={16} className="absolute left-3.5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchVal}
                                onChange={handleSearchChange}
                                placeholder="Search by make, model, category, or keywords..."
                                className="w-full bg-white border border-gray-200/80 rounded-2xl pl-10 pr-9 py-2 text-xs text-gray-900 placeholder-gray-400 shadow-xs outline-none focus:border-gray-900 transition-all"
                            />
                            {searchVal && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 text-gray-400 hover:text-gray-700"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Right Utility Icons */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center bg-white p-1 rounded-full border border-gray-100 shadow-xs">
                        <button className="p-1.5 rounded-full bg-gray-100 text-gray-800" title="Light mode">
                            <Sun size={15} />
                        </button>
                    </div>

                    <button className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-xs">
                        <Mail size={16} />
                    </button>
                    <button className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-xs relative">
                        <Bell size={16} />
                        <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 ring-2 ring-white" />
                    </button>

                    <div className="flex items-center gap-2 pl-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 font-bold text-gray-900 flex items-center justify-center shadow-xs text-sm border-2 border-white">
                            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>
                </div>
            </header>

            {/* ========================================================= */}
            {/* 3. MAIN CONTENT (Responsive padding)                      */}
            {/* ========================================================= */}
            <main className="px-4 py-4 md:pl-28 md:pr-6 md:pt-24 md:pb-12 max-w-7xl mx-auto">
                {children}
            </main>

            {/* ========================================================= */}
            {/* 4. LOGOUT CONFIRMATION MODAL                              */}
            {/* ========================================================= */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={24} />
                        </div>

                        <h3 className="text-lg font-bold text-gray-900">Sign Out</h3>
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                            Are you sure you want to end your current session? You will need to sign in again to purchase or manage vehicles.
                        </p>

                        <div className="flex items-center justify-center gap-2.5 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-2.5 px-4 rounded-2xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmLogout}
                                className="flex-1 py-2.5 px-4 rounded-2xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 shadow-xs transition-colors"
                            >
                                Yes, Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppLayout;
