import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Truck, Sparkles, MapPin, CreditCard } from 'lucide-react';

const SHOWROOMS = [
    'Flagship Metro Showroom (Los Angeles)',
    'Downtown Financial Center (New York)',
    'Bay Area Luxury Auto Gallery (San Francisco)',
    'Miami Beach Executive Pavilion (Miami)',
];

const LOGISTICS = [
    'Direct Flatbed Home Delivery (Complimentary)',
    'Showroom VIP Handover (Same-Day Express)',
    'Enclosed Nationwide Carrier Transport',
    'Curbside Touchless Vehicle Drop-Off',
];

const FINANCING = [
    '0.0% APR 36-Month Dealer Financing',
    '1-Click Direct Purchase (ACH / Debit / Wire)',
    'Custom Dealership Executive Lease Terms',
    'Zero Down Payment Promotional Plan',
];

const WARRANTIES = [
    '10-Yr Powertrain + 30-Day Money-Back',
    '150-Point Certified Pre-Sale Inspection',
    '24/7 Roadside Assistance & Towing Package',
    'Full Factory Extended Bumper-to-Bumper',
];

export const HeroBanner: React.FC = () => {
    const [index, setIndex] = useState(0);

    // Automatically cycle the options smoothly every 2.8 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % 4);
        }, 2800);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-6 items-stretch justify-between">
            {/* Left Pitch & Dealership Trust */}
            <div className="max-w-md flex flex-col justify-between">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200/60 mb-2">
                        <Sparkles size={12} className="text-amber-500" />
                        <span>Certified Dealership Fleet</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-snug">
                        Find & Own Your Dream Drive
                    </h2>
                    <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                        Verified 150-point inspection, direct home delivery, and guaranteed 1-click checkout with dealer financing.
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-5 pt-3 border-t border-gray-100">
                    {/* Buyer Avatars & Rating */}
                    <div className="flex items-center">
                        <div className="flex -space-x-2">
                            <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80" alt="buyer" />
                            <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" alt="buyer" />
                            <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80" alt="buyer" />
                        </div>
                        <div className="ml-3 px-2 py-0.5 rounded-full bg-brand-yellow font-extrabold text-[11px] text-gray-900 shadow-xs">
                            4.9 ★
                        </div>
                    </div>

                    <div className="text-xs">
                        <div className="flex text-amber-400 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={13} fill="currentColor" />
                            ))}
                        </div>
                        <span className="font-semibold text-gray-800">1,500+ Vehicles Sold This Month</span>
                    </div>
                </div>
            </div>

            {/* Right: The 4 Option Boxes with Options Automatically Coming In & Out */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Showroom Location */}
                <div className="bg-[#F8F9FA] rounded-2xl p-3.5 flex flex-col justify-center border border-gray-100/60 overflow-hidden">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1">
                        <MapPin size={13} className="text-amber-500" />
                        <span>Showroom & Branch</span>
                    </div>
                    <div className="h-5 overflow-hidden relative">
                        <p
                            key={index}
                            className="text-xs font-medium text-gray-700 truncate animate-fade-in transition-all duration-300"
                        >
                            {SHOWROOMS[index]}
                        </p>
                    </div>
                </div>

                {/* 2. Handover Method */}
                <div className="bg-[#F8F9FA] rounded-2xl p-3.5 flex flex-col justify-center border border-gray-100/60 overflow-hidden">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1">
                        <Truck size={13} className="text-amber-500" />
                        <span>Handover & Logistics</span>
                    </div>
                    <div className="h-5 overflow-hidden relative">
                        <p
                            key={index}
                            className="text-xs font-medium text-gray-700 truncate animate-fade-in transition-all duration-300"
                        >
                            {LOGISTICS[index]}
                        </p>
                    </div>
                </div>

                {/* 3. Financing & Payment Method */}
                <div className="bg-[#F8F9FA] rounded-2xl p-3.5 flex flex-col justify-center border border-gray-100/60 overflow-hidden">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1">
                        <CreditCard size={13} className="text-amber-500" />
                        <span>Purchase & Finance Terms</span>
                    </div>
                    <div className="h-5 overflow-hidden relative">
                        <p
                            key={index}
                            className="text-xs font-medium text-gray-700 truncate animate-fade-in transition-all duration-300"
                        >
                            {FINANCING[index]}
                        </p>
                    </div>
                </div>

                {/* 4. Certified Assurance */}
                <div className="bg-[#F8F9FA] rounded-2xl p-3.5 flex flex-col justify-center border border-gray-100/60 overflow-hidden">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1">
                        <ShieldCheck size={13} className="text-emerald-500" />
                        <span>Warranty & Guarantee</span>
                    </div>
                    <div className="h-5 overflow-hidden relative flex items-center justify-between">
                        <p
                            key={index}
                            className="text-xs font-medium text-gray-700 truncate animate-fade-in transition-all duration-300 mr-2"
                        >
                            {WARRANTIES[index]}
                        </p>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                            Included
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
