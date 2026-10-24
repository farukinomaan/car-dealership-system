import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth.api';
import { Mail, Lock, ArrowRight, ShieldCheck, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await authApi.login({ email, password });

            // STRICT ROLE VERIFICATION CHECK
            if (selectedRole === 'CUSTOMER' && data.user.role === 'ADMIN') {
                setError('This account is an Admin. Please switch to the Admin tab to sign in.');
                setLoading(false);
                return;
            }

            if (selectedRole === 'ADMIN' && data.user.role !== 'ADMIN') {
                setError('Access denied. This account does not have Administrator privileges.');
                setLoading(false);
                return;
            }

            // Successfully validated
            login(data.accessToken, data.user);

            // Route based on role
            if (data.user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                {/* Brand Logo Header */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-brand-yellow rounded-2xl flex items-center justify-center mb-3 shadow-xs">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111315" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
                    <p className="text-gray-500 text-xs mt-1">Sign in to your DriveMatch account</p>
                </div>

                {/* ROLE SELECTOR TABS (Customer vs Admin) */}
                <div className="flex bg-[#F8F9FA] p-1.5 rounded-2xl mb-6 border border-gray-100">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedRole('CUSTOMER');
                            setError(null);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${selectedRole === 'CUSTOMER'
                                ? 'bg-white text-gray-900 shadow-xs'
                                : 'text-gray-400 hover:text-gray-700'
                            }`}
                    >
                        <User size={14} /> Customer Portal
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedRole('ADMIN');
                            setError(null);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${selectedRole === 'ADMIN'
                                ? 'bg-brand-yellow text-gray-900 shadow-xs'
                                : 'text-gray-400 hover:text-gray-700'
                            }`}
                    >
                        <ShieldCheck size={14} /> Admin Portal
                    </button>
                </div>

                {error && (
                    <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3 rounded-2xl leading-relaxed">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            {selectedRole === 'ADMIN' ? 'Admin Email Address' : 'Email Address'}
                        </label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={selectedRole === 'ADMIN' ? 'admin@dealership.com' : 'name@example.com'}
                                className="w-full bg-[#F8F9FA] border border-gray-200 text-sm text-gray-900 rounded-2xl pl-10 pr-4 py-3 outline-none focus:border-gray-900 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-[#F8F9FA] border border-gray-200 text-sm text-gray-900 rounded-2xl pl-10 pr-4 py-3 outline-none focus:border-gray-900 transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full mt-2 font-bold text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 ${selectedRole === 'ADMIN'
                                ? 'bg-brand-yellow hover:bg-[#F5DC00] text-gray-900'
                                : 'bg-gray-900 hover:bg-black text-white'
                            }`}
                    >
                        {loading ? 'Authenticating...' : `Sign In as ${selectedRole === 'ADMIN' ? 'Admin' : 'Customer'}`}
                        <ArrowRight size={16} />
                    </button>
                </form>

                {selectedRole === 'CUSTOMER' && (
                    <p className="text-center text-xs text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-gray-900 hover:underline">
                            Create an account
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
