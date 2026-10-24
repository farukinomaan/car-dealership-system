import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth.api';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
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
            const data = await authApi.register({ email, password, firstName, lastName });
            login(data.accessToken, data.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-brand-yellow rounded-2xl flex items-center justify-center mb-3 shadow-xs">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111315" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create an Account</h2>
                    <p className="text-gray-500 text-sm mt-1">Join DriveMatch and access premium vehicles</p>
                </div>

                {error && (
                    <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3 rounded-2xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">First Name</label>
                            <input
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="John"
                                className="w-full bg-[#F8F9FA] border border-gray-200 text-sm text-gray-900 rounded-2xl px-4 py-3 outline-none focus:border-gray-900 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Last Name</label>
                            <input
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                                className="w-full bg-[#F8F9FA] border border-gray-200 text-sm text-gray-900 rounded-2xl px-4 py-3 outline-none focus:border-gray-900 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
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
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimum 6 characters"
                                className="w-full bg-[#F8F9FA] border border-gray-200 text-sm text-gray-900 rounded-2xl pl-10 pr-4 py-3 outline-none focus:border-gray-900 transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-brand-yellow hover:bg-[#F5DC00] text-gray-900 font-bold text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Get Started'}
                        <ArrowRight size={16} />
                    </button>
                </form>

                <p className="text-center text-xs text-gray-500 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-gray-900 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
