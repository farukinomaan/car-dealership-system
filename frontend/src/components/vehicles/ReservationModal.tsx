import React, { useState, useEffect } from 'react';
import {
    Clock, ShieldCheck, MapPin, Phone, AlertTriangle,
    X, CheckCircle, RefreshCw, Zap, Lock
} from 'lucide-react';
import type { Vehicle } from '../../types';

interface ReservationModalProps {
    vehicle: Vehicle;
    isOpen: boolean;
    isInQueue: boolean;
    onClose: () => void;
    onConfirmPurchase: (details: { phone: string; location: string }) => Promise<void>;
    onRetryQueue: () => Promise<void>;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
    vehicle,
    isOpen,
    isInQueue,
    onClose,
    onConfirmPurchase,
    onRetryQueue,
}) => {
    // 2-minute countdown (120 seconds)
    const [timeLeft, setTimeLeft] = useState<number>(120);
    const [phone, setPhone] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [checkingQueue, setCheckingQueue] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Reset timer whenever modal opens
    useEffect(() => {
        if (isOpen && !isInQueue) {
            setTimeLeft(120);
            setError(null);
        }
    }, [isOpen, isInQueue]);

    // Live countdown timer ticker
    useEffect(() => {
        if (!isOpen || isInQueue || timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, isInQueue, timeLeft]);

    if (!isOpen) return null;

    // Formatting 02:00
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const isUrgent = timeLeft <= 30;

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Basic empty check
        if (!phone.trim() || !location.trim()) {
            setError('Please provide your phone number and delivery location');
            return;
        }

        // 2. Strict Phone Rules: Extract numeric digits only
        const digitsOnly = phone.replace(/\D/g, '');

        // Rule A: Minimum 10 digits
        if (digitsOnly.length < 10) {
            setError('Please enter a valid phone number with at least 10 digits (e.g. +1 555-234-5678)');
            return;
        }

        // Rule B: Maximum 15 digits (International E.164 standard)
        if (digitsOnly.length > 15) {
            setError('Phone number is too long (maximum 15 digits allowed)');
            return;
        }

        // Rule C: Reject obvious dummy repeated numbers (e.g. 0000000000, 1111111111)
        if (/^(\d)\1{9,}$/.test(digitsOnly)) {
            setError('Please enter a valid real phone number, not repeated digits');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await onConfirmPurchase({ phone, location });
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Transaction could not be completed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleQueueCheck = async () => {
        setCheckingQueue(true);
        await onRetryQueue();
        setCheckingQueue(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
            <div className="bg-[#111315] border border-gray-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden">

                {/* Decorative Top Yellow Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FEE500] to-transparent" />

                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>

                {/* ========================================================
                    CASE 1: IRCTC HIGH-CONCURRENCY QUEUE WAITING SCREEN
                   ======================================================== */}
                {isInQueue ? (
                    <div className="text-center py-4">
                        <div className="relative w-20 h-20 mx-auto mb-5 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-2 border-[#FEE500]/20 animate-ping" />
                            <div className="w-16 h-16 rounded-full bg-[#FEE500]/10 border border-[#FEE500]/40 flex items-center justify-center text-[#FEE500]">
                                <RefreshCw size={28} className="animate-spin" />
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
                            <Clock size={13} /> Active Tatkal Lock Queue
                        </div>

                        <h3 className="text-xl font-black tracking-tight text-white mb-2">
                            Vehicle in Checkout with Another Buyer
                        </h3>

                        <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed mb-6">
                            Another customer is currently in their <span className="text-[#FEE500] font-semibold">2-minute checkout window</span> for this {vehicle.year} {vehicle.make} {vehicle.model}.
                            If their payment is not completed, this slot will open immediately.
                        </p>

                        <div className="bg-[#181A1D] border border-gray-800 rounded-2xl p-4 mb-6 text-left flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-300">
                                    <Lock size={18} />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400">Queue Position</div>
                                    <div className="text-sm font-bold text-white">#1 Next in Line</div>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-[#FEE500] flex items-center gap-1">
                                <Zap size={13} /> High Priority
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                            >
                                Leave Queue
                            </button>
                            <button
                                onClick={handleQueueCheck}
                                disabled={checkingQueue}
                                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-[#FEE500] hover:bg-[#F5DC00] text-[#111315] flex items-center justify-center gap-2 transition-all shadow-md"
                            >
                                <RefreshCw size={14} className={checkingQueue ? 'animate-spin' : ''} />
                                {checkingQueue ? 'Checking...' : 'Check Availability'}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ========================================================
                        CASE 2: BOOKMYSHOW 2-MINUTE ACTIVE TIMING WINDOW
                       ======================================================== */
                    <div>
                        {/* Countdown Header Bar */}
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
                            <div>
                                <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">
                                    DriveMatch Reservation
                                </span>
                                <h3 className="text-lg font-black text-white">
                                    {vehicle.make} {vehicle.model}
                                </h3>
                            </div>

                            {/* Live Timer Pill */}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${isUrgent
                                ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                                : 'bg-[#FEE500]/10 border-[#FEE500]/30 text-[#FEE500]'
                                }`}>
                                <Clock size={15} />
                                <span className="font-mono text-sm font-black tracking-wider">
                                    {formattedTime}
                                </span>
                            </div>
                        </div>

                        {/* Booking Window Notice */}
                        {timeLeft > 0 ? (
                            <div className="bg-[#181A1D] border border-gray-800 rounded-2xl p-3.5 mb-5 flex items-start gap-3">
                                <ShieldCheck size={18} className="text-[#FEE500] shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-300 leading-relaxed">
                                    <strong className="text-white">Slot Exclusively Locked:</strong> You have {formattedTime} minutes to submit your details. Other buyers are locked out in queue.
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 mb-5 flex items-start gap-3 text-red-400">
                                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                <div className="text-xs leading-relaxed">
                                    <strong className="text-red-300">Reservation Window Expired!</strong> The vehicle slot was automatically released back to public inventory.
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                {error}
                            </div>
                        )}

                        {/* Customer Checkout Form */}
                        <form onSubmit={handleConfirm} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                                    Phone Number (For Order Updates)
                                </label>
                                <div className="relative">
                                    <Phone size={15} className="absolute left-3.5 top-3.5 text-gray-500" />
                                    <input
                                        type="tel"
                                        required
                                        placeholder="+1 (555) 234-5678"
                                        value={phone}
                                        onChange={(e) => {
                                            // Disallow words and letters immediately — only numbers, +, -, (), and spaces allowed
                                            const cleaned = e.target.value.replace(/[^\d+()\s-]/g, '');
                                            setPhone(cleaned);
                                            if (error) setError(null);
                                        }}
                                        disabled={timeLeft <= 0}
                                        className="w-full pl-10 pr-4 py-2.5 bg-[#181A1D] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FEE500] transition-colors"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">
                                    Numbers only (10–15 digits, e.g. +1 (555) 234-5678 or 9876543210)
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                                    Delivery Location / Dealership Hub
                                </label>
                                <div className="relative">
                                    <MapPin size={15} className="absolute left-3.5 top-3.5 text-gray-500" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Street Address, City, State"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        disabled={timeLeft <= 0}
                                        className="w-full pl-10 pr-4 py-2.5 bg-[#181A1D] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FEE500] transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Summary breakdown */}
                            <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                                <span className="text-gray-400">Total Agreed Price</span>
                                <span className="text-base font-black text-white">
                                    ${Number(vehicle.price).toLocaleString()}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                >
                                    Release Slot
                                </button>
                                <button
                                    type="submit"
                                    disabled={timeLeft <= 0 || submitting}
                                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-[#FEE500] hover:bg-[#F5DC00] text-[#111315] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all shadow-md"
                                >
                                    <CheckCircle size={15} />
                                    {submitting ? 'Confirming...' : 'Confirm Purchase'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationModal;
