import React, { useEffect, useState, useMemo } from 'react';
import { vehiclesApi } from '../api/vehicles.api';
import type { Vehicle, SearchFilters } from '../types';
import { AppLayout } from '../components/layout/AppLayout';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { FilterSidebar, type FilterState } from '../components/dashboard/FilterSidebar';
import { VehicleCard, getVehicleColors } from '../components/vehicles/VehicleCard';
import { useAuth } from '../context/AuthContext';
import { SlidersHorizontal, X } from 'lucide-react';

const KNOWN_CATEGORIES = ['SEDAN', 'SUV', 'COUPE', 'TRUCK', 'HATCHBACK', 'VAN'];

export const DashboardPage: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [keyword, setKeyword] = useState<string>('');
    const [activeColor, setActiveColor] = useState<string>('All');
    const [activeYear, setActiveYear] = useState<string | number | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<string | null>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const fetchVehicles = async (backendFilters?: SearchFilters) => {
        setLoading(true);
        try {
            const hasFilters = Boolean(backendFilters?.make || backendFilters?.category || backendFilters?.maxPrice);
            const data = hasFilters
                ? await vehiclesApi.search(backendFilters!)
                : await vehiclesApi.getAll();
            setVehicles(data);
        } catch (err) {
            console.error('Failed to fetch vehicles', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleSearch = (filters: FilterState) => {
        const queryTerm = (filters.query || '').trim();
        setKeyword(queryTerm);
        setActiveColor(filters.color || 'All');
        setActiveYear(filters.year);

        const upperQuery = queryTerm.toUpperCase();
        const matchedCategory = KNOWN_CATEGORIES.includes(upperQuery) ? upperQuery : filters.category;
        const makeFilter = KNOWN_CATEGORIES.includes(upperQuery) ? undefined : (queryTerm || undefined);

        fetchVehicles({
            make: makeFilter,
            category: matchedCategory,
            maxPrice: filters.maxPrice,
        });
    };

    const handlePurchase = async (id: string) => {
        try {
            await vehiclesApi.purchase(id);
            setNotification('Vehicle purchased successfully! 🎉');
            setTimeout(() => setNotification(null), 4000);
            fetchVehicles();
        } catch (err: any) {
            setNotification(err.response?.data?.message || 'Failed to complete purchase');
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const displayedVehicles = useMemo(() => {
        return vehicles.filter((car) => {
            // 1. Year filter check
            if (activeYear && String(car.year) !== String(activeYear)) {
                return false;
            }

            // 2. Color filter check
            if (activeColor && activeColor !== 'All') {
                const carColors = getVehicleColors(car);
                const hasColor = carColors.some(
                    (c) => c.name.toLowerCase() === activeColor.toLowerCase()
                );
                if (!hasColor) return false;
            }

            // 3. Keyword check across make, model, category, and description
            if (keyword) {
                const q = keyword.toLowerCase();
                const matchesMake = car.make.toLowerCase().includes(q);
                const matchesModel = car.model.toLowerCase().includes(q);
                const matchesCategory = car.category.toLowerCase().includes(q);
                const matchesDesc = (car.description || '').toLowerCase().includes(q);

                return matchesMake || matchesModel || matchesCategory || matchesDesc;
            }

            return true;
        });
    }, [vehicles, activeYear, activeColor, keyword]);

    return (
        <AppLayout
            onSearchQuery={(q) => {
                setKeyword(q.trim());
                handleSearch({ query: q, color: activeColor, year: activeYear as any });
            }}
        >
            {/* Toast Notification */}
            {notification && (
                <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-xs font-semibold py-2.5 px-4 rounded-2xl shadow-lg border border-gray-700 animate-fade-in flex items-center gap-2">
                    <span>{notification}</span>
                </div>
            )}

            {/* Top Hero Booking Card */}
            <HeroBanner />

            {/* ========================================================= */}
            {/* FLIPKART-STYLE MOBILE STICKY FILTER BAR (Mobile Only)     */}
            {/* ========================================================= */}
            <div className="lg:hidden sticky top-14 z-30 bg-white/95 backdrop-blur-md -mx-4 px-4 py-2.5 border-y border-gray-200/70 flex items-center justify-between mb-4 shadow-xs">
                <span className="text-xs font-semibold text-gray-600">
                    {displayedVehicles.length} vehicles found
                </span>

                <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="flex items-center gap-2 bg-brand-yellow text-gray-900 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs hover:brightness-95 active:scale-95 transition-all"
                >
                    <SlidersHorizontal size={14} />
                    <span>Filter & Sort</span>
                    {(keyword || (activeColor && activeColor !== 'All') || activeYear) && (
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                    )}
                </button>
            </div>

            {/* Main Body: Left Filter Sidebar + Right Vehicle Grid */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Desktop Sidebar: Exactly unchanged */}
                <div className="hidden lg:block w-72 shrink-0 sticky top-24">
                    <FilterSidebar onSearch={handleSearch} />
                </div>

                {/* Right Vehicle Grid */}
                <div className="flex-1 w-full">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-3xl p-6 h-72 animate-pulse border border-gray-100" />
                            ))}
                        </div>
                    ) : displayedVehicles.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                            <p className="text-gray-500 text-sm">
                                No vehicles found matching{' '}
                                <span className="font-bold text-gray-900">
                                    "{activeYear ? `Year ${activeYear}` : keyword || activeColor}"
                                </span>.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {displayedVehicles.map((car) => (
                                <VehicleCard
                                    key={car.id}
                                    vehicle={car}
                                    onPurchase={handlePurchase}
                                    isAdmin={isAdmin}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================================= */}
            {/* FLIPKART-STYLE BOTTOM SHEET FILTER MODAL (Mobile Only)    */}
            {/* ========================================================= */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-fade-in"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />

                    <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl z-10 animate-fade-in">
                        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal size={16} className="text-gray-900" />
                                <span className="font-bold text-sm text-gray-900">
                                    Filters
                                </span>
                            </div>
                            <button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-4 flex-1">
                            <FilterSidebar
                                onSearch={(filters) => {
                                    handleSearch(filters);
                                }}
                            />
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-white">
                            <button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="w-full py-3 bg-brand-yellow text-gray-900 font-bold text-xs rounded-2xl shadow-xs"
                            >
                                View {displayedVehicles.length} Vehicles
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default DashboardPage;
