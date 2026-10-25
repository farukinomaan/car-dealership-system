import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    X,
    Package,
    Trash2,
    Edit3,
    ArrowLeft,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Car,
    ChevronDown
} from 'lucide-react';
import { vehiclesApi } from '../api/vehicles.api';
import type { Vehicle } from '../types';
import { AppLayout } from '../components/layout/AppLayout';

// 12 Famous Car Brands and their iconic models
export const CAR_BRANDS_MODELS: Record<string, { models: string[]; defaultCategory: string }> = {
    'BMW': {
        models: ['M4 Competition', 'M3 Sedan', 'M5 Competition', 'M8 Gran Coupe', 'X5 M', 'i4 M50', 'i7 xDrive60', 'Z4 M40i'],
        defaultCategory: 'Sedan'
    },
    'Porsche': {
        models: ['911 GT3 RS', '911 Turbo S', 'Taycan Turbo S', '718 Cayman GT4', 'Panamera GTS', 'Macan GTS', 'Cayenne Turbo GT'],
        defaultCategory: 'Coupe'
    },
    'Mercedes-Benz': {
        models: ['AMG GT Coupe', 'C63 AMG', 'E63 AMG', 'S580 Luxury', 'G63 AMG Wagon', 'SL63 AMG Roadster', 'EQE Sedan'],
        defaultCategory: 'Sedan'
    },
    'Tesla': {
        models: ['Model S Plaid', 'Model 3 Performance', 'Model X Plaid', 'Model Y Long Range', 'Cybertruck Cyberbeast'],
        defaultCategory: 'Sedan'
    },
    'Audi': {
        models: ['RS6 Avant', 'RS7 Sportback', 'R8 V10 Performance', 'RS5 Coupe', 'e-tron GT', 'Q8 Prestige', 'S4 Sedan'],
        defaultCategory: 'Sedan'
    },
    'Ferrari': {
        models: ['296 GTB Hybrid', 'SF90 Stradale', 'F8 Tributo', '812 Competizione', 'Purosangue SUV', 'Roma Coupe'],
        defaultCategory: 'Coupe'
    },
    'Lamborghini': {
        models: ['Huracán Tecnica', 'Huracán STO', 'Revuelto V12 Hybrid', 'Urus Performante', 'Aventador SVJ'],
        defaultCategory: 'Coupe'
    },
    'Toyota': {
        models: ['GR Supra 3.0', 'GR Corolla Circuit', 'Land Cruiser GR Sport', 'RAV4 Hybrid', 'Camry TRD', 'Tacoma TRD Pro'],
        defaultCategory: 'Coupe'
    },
    'Ford': {
        models: ['Mustang Dark Horse', 'Mustang Shelby GT500', 'F-150 Raptor R', 'F-150 Lightning', 'Bronco Raptor', 'Explorer ST'],
        defaultCategory: 'Coupe'
    },
    'Chevrolet': {
        models: ['Corvette Z06', 'Corvette E-Ray', 'Camaro ZL1', 'Silverado 1500 ZR2', 'Tahoe RST'],
        defaultCategory: 'Coupe'
    },
    'Honda': {
        models: ['Civic Type R', 'Civic Si', 'Accord Hybrid Sport', 'CR-V Hybrid', 'Pilot TrailSport'],
        defaultCategory: 'Hatchback'
    },
    'Hyundai': {
        models: ['Ioniq 5 N', 'Elantra N', 'Sonata N-Line', 'Palisade Calligraphy', 'Santa Fe Hybrid'],
        defaultCategory: 'SUV'
    }
};

const CATEGORIES = ['Sedan', 'SUV', 'Coupe', 'Truck', 'Hatchback', 'Convertible', 'Van'];

const DEFAULT_BRAND = 'BMW';
const DEFAULT_MODEL = CAR_BRANDS_MODELS['BMW'].models[0];

const EMPTY_FORM = {
    make: DEFAULT_BRAND,
    model: DEFAULT_MODEL,
    year: 2025,
    category: CAR_BRANDS_MODELS['BMW'].defaultCategory,
    price: 75000,
    quantity: 2,
    description: '',
    imageUrl: ''
};

export const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

    // Form State
    const [form, setForm] = useState(EMPTY_FORM);
    const [selectedBrand, setSelectedBrand] = useState<string>(DEFAULT_BRAND);
    const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
    const [customBrand, setCustomBrand] = useState<string>('');
    const [customModel, setCustomModel] = useState<string>('');

    const [restockQty, setRestockQty] = useState<Record<string, number>>({});
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const data = await vehiclesApi.getAll();
            setVehicles(data);
        } catch {
            showToast('Failed to fetch inventory', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    // Handle Brand Dropdown Change
    const handleBrandChange = (brand: string) => {
        setSelectedBrand(brand);
        if (brand === 'OTHER') {
            setSelectedModel('OTHER');
            setForm((prev) => ({
                ...prev,
                make: customBrand,
                model: customModel
            }));
        } else {
            const brandData = CAR_BRANDS_MODELS[brand];
            const defaultFirstModel = brandData ? brandData.models[0] : '';
            setSelectedModel(defaultFirstModel);
            setForm((prev) => ({
                ...prev,
                make: brand,
                model: defaultFirstModel,
                category: brandData ? brandData.defaultCategory : prev.category
            }));
        }
    };

    // Handle Model Dropdown Change
    const handleModelChange = (model: string) => {
        setSelectedModel(model);
        if (model === 'OTHER') {
            setForm((prev) => ({ ...prev, model: customModel }));
        } else {
            setForm((prev) => ({ ...prev, model }));
        }
    };

    // Open modal for new vehicle
    const handleOpenAddModal = () => {
        setEditingVehicle(null);
        setSelectedBrand(DEFAULT_BRAND);
        setSelectedModel(DEFAULT_MODEL);
        setCustomBrand('');
        setCustomModel('');
        setForm(EMPTY_FORM);
        setIsModalOpen(true);
    };

    // Open modal for edit
    const handleEdit = (v: Vehicle) => {
        setEditingVehicle(v);

        const isKnownBrand = Object.keys(CAR_BRANDS_MODELS).includes(v.make);
        if (isKnownBrand) {
            setSelectedBrand(v.make);
            const isKnownModel = CAR_BRANDS_MODELS[v.make].models.includes(v.model);
            if (isKnownModel) {
                setSelectedModel(v.model);
                setCustomModel('');
            } else {
                setSelectedModel('OTHER');
                setCustomModel(v.model);
            }
            setCustomBrand('');
        } else {
            setSelectedBrand('OTHER');
            setSelectedModel('OTHER');
            setCustomBrand(v.make);
            setCustomModel(v.model);
        }

        setForm({
            make: v.make,
            model: v.model,
            year: v.year,
            category: v.category,
            price: Number(v.price),
            quantity: v.quantity,
            description: v.description || '',
            imageUrl: v.imageUrl || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalMake = selectedBrand === 'OTHER' ? customBrand.trim() : selectedBrand;
        const finalModel = selectedModel === 'OTHER' ? customModel.trim() : selectedModel;

        if (!finalMake) {
            showToast('Please specify a car brand', 'error');
            return;
        }
        if (!finalModel) {
            showToast('Please specify a car model', 'error');
            return;
        }

        const payload = {
            ...form,
            make: finalMake,
            model: finalModel,
            price: Number(form.price),
            quantity: Number(form.quantity),
            year: Number(form.year)
        };

        try {
            if (editingVehicle) {
                await vehiclesApi.update(editingVehicle.id, payload);
                showToast('Vehicle updated successfully!');
            } else {
                await vehiclesApi.create(payload);
                showToast('Vehicle added to inventory!');
            }
            setIsModalOpen(false);
            setEditingVehicle(null);
            fetchVehicles();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Operation failed', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this vehicle from inventory?')) return;
        try {
            await vehiclesApi.delete(id);
            showToast('Vehicle deleted successfully');
            fetchVehicles();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Delete failed', 'error');
        }
    };

    const handleRestock = async (id: string) => {
        const qty = restockQty[id] || 1;
        try {
            await vehiclesApi.restock(id, qty);
            showToast(`Restocked ${qty} units successfully!`);
            setRestockQty((prev) => ({ ...prev, [id]: 1 }));
            fetchVehicles();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Restock failed', 'error');
        }
    };

    const totalStock = vehicles.reduce((sum, v) => sum + v.quantity, 0);

    return (
        <AppLayout isAdminLayout={true}>
            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed top-6 right-8 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold tracking-wide animate-fade-in ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-500 text-white'
                        }`}
                >
                    {toast.type === 'success' ? <CheckCircle size={16} className="text-brand-yellow" /> : <AlertCircle size={16} />}
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* Top Header / Actions Bar */}
            <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 rounded-2xl hover:bg-gray-100 text-gray-500 transition-colors"
                            title="Back to Preview"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Admin Inventory Manager</h1>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {vehicles.length} distinct models &bull; {totalStock} total units in showroom
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                        <Car size={15} />
                        <span>Customer Preview</span>
                    </button>

                    <button
                        id="add-vehicle-btn"
                        onClick={handleOpenAddModal}
                        className="flex-1 sm:flex-initial bg-brand-yellow hover:bg-[#F5DC00] text-gray-900 font-bold px-5 py-2.5 rounded-2xl text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        <span>Add Vehicle</span>
                    </button>
                </div>
            </div>

            {/* Vehicles Table Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-[#FAFBFD]">
                                <th className="py-4 px-6">Vehicle Model</th>
                                <th className="py-4 px-6">Category</th>
                                <th className="py-4 px-6">Price</th>
                                <th className="py-4 px-6">Stock Status</th>
                                <th className="py-4 px-6">Quick Restock</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="py-6 px-6">
                                            <div className="h-6 bg-gray-100 rounded-xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : vehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-400">
                                        No vehicles found in inventory. Click <b>"Add Vehicle"</b> above to create one.
                                    </td>
                                </tr>
                            ) : (
                                vehicles.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                                        {/* Vehicle */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                {v.imageUrl ? (
                                                    <img
                                                        src={v.imageUrl}
                                                        alt=""
                                                        className="w-12 h-10 object-cover rounded-xl bg-gray-100 border border-gray-100 flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 flex-shrink-0">
                                                        <Package size={18} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900">
                                                        {v.make} {v.model}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 font-medium">{v.year}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="py-4 px-6">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 font-semibold rounded-lg text-[11px]">
                                                {v.category}
                                            </span>
                                        </td>

                                        {/* Price */}
                                        <td className="py-4 px-6 font-bold text-gray-900">
                                            ${Number(v.price).toLocaleString()}
                                        </td>

                                        {/* Stock */}
                                        <td className="py-4 px-6">
                                            {v.quantity === 0 ? (
                                                <span className="px-2.5 py-1 bg-red-50 text-red-600 font-bold rounded-lg text-[11px] border border-red-100">
                                                    Out of Stock
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-[11px] border border-emerald-100">
                                                    {v.quantity} Available
                                                </span>
                                            )}
                                        </td>

                                        {/* Restock */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={restockQty[v.id] || 1}
                                                    onChange={(e) =>
                                                        setRestockQty((prev) => ({
                                                            ...prev,
                                                            [v.id]: Math.max(1, Number(e.target.value))
                                                        }))
                                                    }
                                                    className="w-14 bg-[#F8F9FA] border border-gray-200 text-center font-bold text-gray-900 rounded-xl py-1.5 px-1 outline-none text-xs"
                                                />
                                                <button
                                                    id={`restock-btn-${v.id}`}
                                                    onClick={() => handleRestock(v.id)}
                                                    className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-colors"
                                                >
                                                    <RefreshCw size={12} />
                                                    <span>Restock</span>
                                                </button>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    id={`edit-btn-${v.id}`}
                                                    onClick={() => handleEdit(v)}
                                                    className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                                    title="Edit vehicle"
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button
                                                    id={`delete-btn-${v.id}`}
                                                    onClick={() => handleDelete(v.id)}
                                                    className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                                    title="Delete vehicle"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit Vehicle Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto animate-slide-up">
                        <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {editingVehicle ? 'Edit Vehicle Details' : 'Create New Vehicle'}
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Select brand and model from the dropdown menus
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* 1. BRAND / MAKE DROPDOWN */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Car Brand (Make) *
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="brand-select"
                                            value={selectedBrand}
                                            onChange={(e) => handleBrandChange(e.target.value)}
                                            className="w-full appearance-none bg-[#F8F9FA] border border-gray-200 text-xs font-bold text-gray-900 rounded-2xl px-4 py-3 pr-9 outline-none focus:border-gray-900 transition-colors cursor-pointer"
                                        >
                                            {Object.keys(CAR_BRANDS_MODELS).map((brand) => (
                                                <option key={brand} value={brand}>
                                                    {brand}
                                                </option>
                                            ))}
                                            <option value="OTHER">Other / Custom Brand...</option>
                                        </select>
                                        <ChevronDown
                                            size={15}
                                            className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none"
                                        />
                                    </div>

                                    {/* Custom Brand Input if "OTHER" selected */}
                                    {selectedBrand === 'OTHER' && (
                                        <input
                                            type="text"
                                            placeholder="Type custom brand name..."
                                            value={customBrand}
                                            onChange={(e) => {
                                                setCustomBrand(e.target.value);
                                                setForm((prev) => ({ ...prev, make: e.target.value }));
                                            }}
                                            required
                                            className="w-full mt-2 bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 rounded-2xl px-4 py-2.5 outline-none focus:border-gray-900 transition-colors"
                                        />
                                    )}
                                </div>

                                {/* 2. SPECIFIC CAR MODEL DROPDOWN */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Model Name *
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="model-select"
                                            value={selectedModel}
                                            onChange={(e) => handleModelChange(e.target.value)}
                                            className="w-full appearance-none bg-[#F8F9FA] border border-gray-200 text-xs font-bold text-gray-900 rounded-2xl px-4 py-3 pr-9 outline-none focus:border-gray-900 transition-colors cursor-pointer"
                                        >
                                            {selectedBrand !== 'OTHER' &&
                                                CAR_BRANDS_MODELS[selectedBrand]?.models.map((m) => (
                                                    <option key={m} value={m}>
                                                        {m}
                                                    </option>
                                                ))}
                                            <option value="OTHER">Other / Custom Model...</option>
                                        </select>
                                        <ChevronDown
                                            size={15}
                                            className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none"
                                        />
                                    </div>

                                    {/* Custom Model Input if "OTHER" selected */}
                                    {selectedModel === 'OTHER' && (
                                        <input
                                            type="text"
                                            placeholder="Type custom model name..."
                                            value={customModel}
                                            onChange={(e) => {
                                                setCustomModel(e.target.value);
                                                setForm((prev) => ({ ...prev, model: e.target.value }));
                                            }}
                                            required
                                            className="w-full mt-2 bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 rounded-2xl px-4 py-2.5 outline-none focus:border-gray-900 transition-colors"
                                        />
                                    )}
                                </div>

                                {/* 3. YEAR */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Year *</label>
                                    <input
                                        type="number"
                                        min={1990}
                                        max={2030}
                                        required
                                        value={form.year}
                                        onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                                        className="w-full bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 rounded-2xl px-4 py-3 outline-none focus:border-gray-900 transition-colors font-medium"
                                    />
                                </div>

                                {/* 4. CATEGORY */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category *</label>
                                    <div className="relative">
                                        <select
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            className="w-full appearance-none bg-[#F8F9FA] border border-gray-200 text-xs font-medium text-gray-900 rounded-2xl px-4 py-3 pr-9 outline-none focus:border-gray-900 transition-colors cursor-pointer"
                                        >
                                            {CATEGORIES.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown
                                            size={15}
                                            className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none"
                                        />
                                    </div>
                                </div>

                                {/* 5. PRICE */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Price ($) *</label>
                                    <input
                                        type="number"
                                        min={1}
                                        required
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                                        className="w-full bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 rounded-2xl px-4 py-3 outline-none focus:border-gray-900 transition-colors font-bold"
                                    />
                                </div>

                                {/* 6. QUANTITY IN STOCK */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Showroom Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        required
                                        value={form.quantity}
                                        onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                                        className="w-full bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 rounded-2xl px-4 py-3 outline-none focus:border-gray-900 transition-colors font-bold"
                                    />
                                </div>
                            </div>

                            {/* 7. IMAGE URL */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Image URL</label>
                                <input
                                    type="url"
                                    placeholder="https://images.unsplash.com/..."
                                    value={form.imageUrl}
                                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                    className="w-full bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 rounded-2xl px-4 py-3 outline-none focus:border-gray-900 transition-colors"
                                />
                            </div>

                            {/* 8. DESCRIPTION */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Engine specifications, interior package, powertrain features..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full bg-[#F8F9FA] border border-gray-200 text-xs text-gray-900 rounded-2xl px-4 py-3 outline-none focus:border-gray-900 transition-colors resize-none"
                                />
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-brand-yellow hover:bg-[#F5DC00] text-gray-900 font-bold px-6 py-2.5 rounded-2xl text-xs shadow-xs transition-all active:scale-95"
                                >
                                    {editingVehicle ? 'Update Vehicle' : 'Add to Inventory'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default AdminPage;
