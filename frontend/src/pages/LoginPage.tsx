import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth.api';
import { Mail, Lock, User, ShieldCheck, ArrowRight, AlertCircle, Zap, Award, Gauge } from 'lucide-react';

// DriveMatch Brand Emblem Component
const DriveMatchLogoIcon: React.FC<{ size?: number }> = ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 36L26 20H42L36 30H50L22 46L26 36H14Z" fill="#FEE500" />
        <path d="M28 20L48 20L42 27L22 27Z" fill="#FFFFFF" opacity="0.95" />
        <circle cx="48" cy="42" r="3.5" fill="#FEE500" />
        <circle cx="20" cy="42" r="3.5" fill="#FEE500" />
    </svg>
);

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [roleTab, setRoleTab] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await authApi.login({ email, password });

            // Strict Role Validation
            if (roleTab === 'ADMIN' && data.user.role !== 'ADMIN') {
                setError('Unauthorized: Admin credentials required for Admin Portal.');
                setLoading(false);
                return;
            }

            if (roleTab === 'CUSTOMER' && data.user.role === 'ADMIN') {
                setError('Admin account detected. Please switch to the Admin Portal tab.');
                setLoading(false);
                return;
            }

            // Save session to AuthContext
            login(data.accessToken, data.user);

            if (data.user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F5F7] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
            {/* ========================================================= */}
            {/* PRODUCTION AUTOMOTIVE BACKGROUND ANIMATION                */}
            {/* ========================================================= */}

            {/* 1. Ambient Dynamic Light Orbs */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#FEE500]/25 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-[#111315]/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-10 right-1/4 w-72 h-72 bg-[#FEE500]/15 rounded-full blur-[100px] pointer-events-none" />

            {/* 2. Aerodynamic Airflow Streamlines (Wind-Tunnel Simulation) */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="streamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#111315" stopOpacity="0" />
                        <stop offset="50%" stopColor="#FEE500" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#111315" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="streamGradWhite" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                        <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Upper Sweeping Curves */}
                <path
                    d="M -100 200 C 300 120, 800 450, 1600 250"
                    fill="none"
                    stroke="url(#streamGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="16 12"
                    className="animate-[dash_25s_linear_infinite]"
                />
                <path
                    d="M -100 260 C 350 180, 850 500, 1600 320"
                    fill="none"
                    stroke="url(#streamGradWhite)"
                    strokeWidth="1.5"
                    strokeDasharray="20 16"
                    className="animate-[dash_35s_linear_infinite]"
                />

                {/* Lower Sweeping Curves */}
                <path
                    d="M -100 600 C 400 450, 900 800, 1600 550"
                    fill="none"
                    stroke="url(#streamGrad)"
                    strokeWidth="2"
                    strokeDasharray="24 14"
                    className="animate-[dash_20s_linear_infinite]"
                />
                <path
                    d="M -100 660 C 450 520, 950 860, 1600 610"
                    fill="none"
                    stroke="url(#streamGradWhite)"
                    strokeWidth="1.5"
                    strokeDasharray="30 20"
                    className="animate-[dash_30s_linear_infinite]"
                />
            </svg>

            {/* 3. Floating Automotive Telemetry HUD Badges */}
            <div className="hidden lg:flex items-center gap-2 absolute top-12 left-16 px-4 py-2 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/60 animate-bounce duration-1000">
                <Gauge size={14} className="text-[#968200]" />
                <span className="text-xs font-bold text-gray-800">0–60 mph in 3.1s Certified</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 absolute bottom-12 left-20 px-4 py-2 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/60">
                <Award size={14} className="text-amber-500" />
                <span className="text-xs font-bold text-gray-800">150-Point Dealership Warranty</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 absolute top-24 right-16 px-4 py-2 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/60">
                <Zap size={14} className="text-[#FEE500] fill-[#FEE500]" />
                <span className="text-xs font-bold text-gray-800">Live Showroom Inventory</span>
            </div>

            {/* ========================================================= */}
            {/* AUTH CARD                                                 */}
            {/* ========================================================= */}
            <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-100/90 relative z-10 transition-all duration-300 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)]">
                {/* Brand Header */}
                <div className="flex flex-col items-center text-center mb-7">
                    <div className="w-14 h-14 bg-[#111315] rounded-2xl flex items-center justify-center shadow-xl mb-4 cursor-pointer hover:scale-110 active:scale-95 transition-all ring-4 ring-black/5">
                        <DriveMatchLogoIcon size={30} />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900">
                        Drive<span className="text-[#FEE500]">Match</span>
                    </h1>
                    <p className="text-xs font-semibold text-gray-400 mt-1">
                        Sign in to access your automotive showroom
                    </p>
                </div>

                {/* Role Switcher Tabs */}
                <div className="flex bg-[#F4F5F7] p-1.5 rounded-2xl mb-6">
                    <button
                        type="button"
                        onClick={() => {
                            setRoleTab('CUSTOMER');
                            setError(null);
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${roleTab === 'CUSTOMER'
                                ? 'bg-[#111315] text-[#FEE500] shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <User size={15} />
                        <span>Customer Portal</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setRoleTab('ADMIN');
                            setError(null);
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${roleTab === 'ADMIN'
                                ? 'bg-[#111315] text-[#FEE500] shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <ShieldCheck size={15} />
                        <span>Admin Portal</span>
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-5 p-3.5 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2.5 text-xs font-semibold border border-red-100">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-[#F8F9FA] border border-gray-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold text-gray-900 placeholder-gray-400 outline-none focus:border-gray-900 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-[#F8F9FA] border border-gray-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold text-gray-900 placeholder-gray-400 outline-none focus:border-gray-900 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Submit Button (Vibrant DriveMatch Yellow) */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3.5 bg-[#FEE500] hover:brightness-95 active:scale-[0.99] text-[#111315] font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <span>{loading ? 'Authenticating...' : `Sign In as ${roleTab === 'ADMIN' ? 'Admin' : 'Customer'}`}</span>
                        <ArrowRight size={15} />
                    </button>
                </form>

                {/* Bottom Registration Link */}
                <div className="mt-8 text-center text-xs font-semibold text-gray-500">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="font-extrabold text-gray-900 hover:underline"
                    >
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
