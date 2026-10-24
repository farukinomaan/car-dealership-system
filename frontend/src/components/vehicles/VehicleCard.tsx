import React, { useState } from 'react';
import type { Vehicle } from '../../types';
import { Maximize2, Star, Gauge, ShieldCheck, ShoppingCart, X } from 'lucide-react';

export interface VehicleColor {
    name: string;
    hex: string;
}

// Deterministic vehicle color generator to sync with filters and models
export function getVehicleColors(vehicle: Vehicle): VehicleColor[] {
    const makeLower = vehicle.make.toLowerCase();
    const catLower = vehicle.category.toLowerCase();

    if (makeLower.includes('bmw')) {
        return [
            { name: 'Black', hex: '#111315' },
            { name: 'Blue', hex: '#3B82F6' },
            { name: 'Silver', hex: '#9CA3AF' },
        ];
    }
    if (makeLower.includes('ford') || catLower === 'truck') {
        return [
            { name: 'Brown', hex: '#92400E' },
            { name: 'Black', hex: '#111315' },
            { name: 'Red', hex: '#EF4444' },
        ];
    }
    if (makeLower.includes('porsche')) {
        return [
            { name: 'Red', hex: '#EF4444' },
            { name: 'Black', hex: '#111315' },
            { name: 'Silver', hex: '#9CA3AF' },
        ];
    }
    if (makeLower.includes('tesla')) {
        return [
            { name: 'Silver', hex: '#9CA3AF' },
            { name: 'Black', hex: '#111315' },
            { name: 'Red', hex: '#EF4444' },
        ];
    }
    // Default palette for Toyota / RAV4 / Sedan
    return [
        { name: 'Blue', hex: '#3B82F6' },
        { name: 'Silver', hex: '#9CA3AF' },
        { name: 'Black', hex: '#111315' },
    ];
}

interface VehicleCardProps {
    vehicle: Vehicle;
    onPurchase: (id: string) => void;
    isAdmin?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onPurchase, isAdmin = false }) => {
    const [purchasing, setPurchasing] = useState(false);
    const [showZoomModal, setShowZoomModal] = useState(false);

    const isAvailable = vehicle.quantity > 0;
    const colors = getVehicleColors(vehicle);

    const handleBuy = async () => {
        if (!isAvailable || purchasing || isAdmin) return;
        setPurchasing(true);
        try {
            await onPurchase(vehicle.id);
        } finally {
            setPurchasing(false);
        }
    };

    const displayImage =
        vehicle.imageUrl ||
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80';

    return (
        <>
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
                {/* Top Floating Actions: Fullview */}
                <div className="relative">
                    <div className="absolute top-0 right-0 z-10 flex items-center gap-2">
                        <button
                            onClick={() => setShowZoomModal(true)}
                            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-white shadow-xs transition-all"
                            title="Full view / Zoom"
                        >
                            <Maximize2 size={14} />
                        </button>
                    </div>

                    {/* Vehicle Presentation */}
                    <div
                        className="h-44 w-full flex items-center justify-center overflow-hidden py-2 cursor-pointer"
                        onClick={() => setShowZoomModal(true)}
                    >
                        <img
                            src={displayImage}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </div>

                {/* Details Section */}
                <div className="mt-2">
                    {/* Title & Price */}
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h4 className="font-bold text-gray-900 text-base leading-tight">
                                {vehicle.make} {vehicle.model} {vehicle.year}
                            </h4>
                            <span className="text-xs text-gray-400 font-medium">Automatic • {vehicle.category}</span>
                        </div>

                        <div className="text-right">
                            <div className="text-lg font-extrabold text-gray-900">
                                ${vehicle.price.toLocaleString()}
                            </div>
                            <span className="text-[11px] font-medium text-gray-400">Total Price</span>
                        </div>
                    </div>

                    {/* Available Colors Dot List (Synced with Filters) */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                        <span className="text-[11px] text-gray-400 font-medium mr-1">Colors:</span>
                        {colors.map((c, i) => (
                            <span
                                key={i}
                                title={c.name}
                                className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-2xs hover:scale-125 transition-transform cursor-pointer"
                                style={{ backgroundColor: c.hex }}
                            />
                        ))}
                    </div>

                    {/* Specs Row */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 font-medium text-gray-700">
                            <Star size={13} className="text-amber-400 fill-amber-400" />
                            <span>4.9</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Gauge size={13} className="text-gray-400" />
                            <span>Zero-mile</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ShieldCheck size={13} className={isAvailable ? 'text-emerald-500' : 'text-red-400'} />
                            <span className={isAvailable ? 'text-emerald-600 font-semibold' : 'text-red-500 font-medium'}>
                                {isAvailable ? `${vehicle.quantity} In Stock` : 'Sold Out'}
                            </span>
                        </div>
                    </div>

                    {/* Purchase Button — disabled if Admin preview mode */}
                    {isAdmin ? (
                        <div className="w-full mt-4 py-2.5 px-4 rounded-2xl text-xs font-semibold text-center bg-gray-100 text-gray-500">
                            Admin Preview Only
                        </div>
                    ) : (
                        <button
                            onClick={handleBuy}
                            disabled={!isAvailable || purchasing}
                            className={`w-full mt-4 py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${isAvailable
                                    ? 'bg-brand-yellow hover:bg-[#F5DC00] text-gray-900 shadow-xs hover:shadow'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <ShoppingCart size={14} />
                            {purchasing ? 'Processing...' : isAvailable ? 'Purchase Vehicle' : 'Out of Stock'}
                        </button>
                    )}
                </div>
            </div>

            {/* FULLVIEW / ZOOM MODAL WITH DESCRIPTION */}
            {showZoomModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowZoomModal(false)}
                            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-yellow text-gray-900 shadow-2xs">
                                {vehicle.category}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">{vehicle.year} Model</span>
                            <span className="text-xs text-gray-300">•</span>
                            <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                                <Star size={12} fill="currentColor" /> 4.9 Rating
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                            {vehicle.make} {vehicle.model}
                        </h3>

                        {/* Vehicle Image Banner */}
                        <div className="my-5 h-64 w-full flex items-center justify-center bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100">
                            <img
                                src={displayImage}
                                alt={`${vehicle.make} ${vehicle.model}`}
                                className="max-h-full max-w-full object-contain drop-shadow-md"
                            />
                        </div>

                        {/* Description Section */}
                        <div className="mb-5 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100/80">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                                Vehicle Overview & Details
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                {vehicle.description ||
                                    `Experience luxury and performance with the ${vehicle.year} ${vehicle.make} ${vehicle.model}. Fully inspected by certified master technicians, complete with dealer warranty and verified CarFax records.`}
                            </p>
                        </div>

                        {/* Colors in Zoom Modal */}
                        <div className="flex items-center gap-2 mb-5">
                            <span className="text-xs text-gray-500 font-medium">Available Finishes:</span>
                            <div className="flex items-center gap-1.5">
                                {colors.map((c, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800"
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                                        {c.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Bottom Purchase Bar */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                            <div>
                                <span className="text-[11px] text-gray-400 font-medium block">Total Dealership Price</span>
                                <div className="text-2xl font-black text-gray-900">
                                    ${vehicle.price.toLocaleString()}
                                </div>
                            </div>

                            {!isAdmin && isAvailable && (
                                <button
                                    onClick={() => {
                                        setShowZoomModal(false);
                                        handleBuy();
                                    }}
                                    className="bg-brand-yellow hover:bg-[#F5DC00] text-gray-900 font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-xs transition-all"
                                >
                                    <ShoppingCart size={15} />
                                    Purchase Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VehicleCard;
