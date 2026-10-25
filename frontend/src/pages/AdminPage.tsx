import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehiclesApi } from '../api/vehicles.api';
import type { Vehicle } from '../types';
import { AppLayout } from '../components/layout/AppLayout';
import { Plus, ArrowLeft, X, RefreshCw, Trash2, Edit2 } from 'lucide-react';

export const AdminPage: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [restockAmounts, setRestockAmounts] = useState<{ [id: string]: number }>({});
    const [notification, setNotification] = useState<string | null>(null);

    // Form states
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState<number>(2024);
    const [price, setPrice] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(1);
    const [category, setCategory] = useState('SEDAN');
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');

    const navigate = useNavigate();

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const data = await vehiclesApi.getAll();
            setVehicles(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const openAddModal = () => {
        setEditingVehicle(null);
        setMake('');
        setModel('');
        setYear(2025);
        setPrice(35000);
        setQuantity(5);
        setCategory('SEDAN');
        setImageUrl('');
        setDescription('');
        setIsModalOpen(true);
    };

    const openEditModal = (v: Vehicle) => {
        setEditingVehicle(v);
        setMake(v.make);
        setModel(v.model);
        setYear(v.year);
        setPrice(v.price);
        setQuantity(v.quantity);
        setCategory(v.category);
        setImageUrl(v.imageUrl || '');
        setDescription(v.description || '');
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingVehicle) {
                await vehiclesApi.update(editingVehicle.id, {
                    make,
                    model,
                    year: Number(year),
                    price: Number(price),
                    quantity: Number(quantity),
                    category: category.toUpperCase(),
                    imageUrl,
                    description,
                });
                setNotification('Vehicle updated successfully!');
            } else {
                await vehiclesApi.create({
                    make,
                    model,
                    year: Number(year),
                    price: Number(price),
                    quantity: Number(quantity),
                    category: category.toUpperCase(),
                    imageUrl,
                    description,
                });
                setNotification('Vehicle created successfully!');
            }
            setIsModalOpen(false);
            fetchVehicles();
            setTimeout(() => setNotification(null), 3000);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            await vehiclesApi.delete(id);
            fetchVehicles();
            setNotification('Vehicle deleted.');
            setTimeout(() => setNotification(null), 3000);
        } catch (err: any) {
            alert('Delete failed');
        }
    };

    const handleRestock = async (id: string) => {
        const qty = restockAmounts[id] || 1;
        try {
            await vehiclesApi.restock(id, qty);
            fetchVehicles();
            setNotification(`Restocked +${qty} units!`);
            setTimeout(() => setNotification(null), 3000);
        } catch (err: any) {
            alert('Restock failed');
        }
    };

    return (
        <AppLayout isAdminLayout={true}>
            {/* Toast */}
            {notification && (
                <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-xs font-semibold py-2.5 px-4 rounded-2xl shadow-lg border border-gray-700 animate-fade-in">
                    {notification}
                </div>
            )}

            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2 transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Customer Preview
                    </button>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Admin Inventory Panel</h2>
                    <p className="text-gray-500 text-xs mt-0.5">Manage, restock, and update dealership vehicles</p>
                </div>

                <button
                    onClick={openAddModal}
                    className="bg-brand-yellow hover:bg-[#F5DC00] text-gray-900 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto"
                >
                    <Plus size={16} /> Add New Vehicle
                </button>
            </div>

            {/* Inventory Table Container */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-400 font-semibold tracking-wider uppercase text-[10px]">
                                <th className="pb-3 px-3">Vehicle</th>
                                <th className="pb-3 px-3">Category</th>
                                <th className="pb-3 px-3">Price</th>
                                <th className="pb-3 px-3">Current Stock</th>
                                <th className="pb-3 px-3">Restock Quantity</th>
                                <th className="pb-3 px-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-400">Loading inventory...</td>
                                </tr>
                            ) : vehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-400">No vehicles in database.</td>
                                </tr>
                            ) : (
                                vehicles.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                                        {/* Vehicle */}
                                        <td className="py-3 px-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#F8F9FA] rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0">
                                                    {v.imageUrl ? (
                                                        <img src={v.imageUrl} alt="" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400">N/A</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{v.make} {v.model}</div>
                                                    <div className="text-[11px] text-gray-400">{v.year}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="py-3 px-3 font-medium text-gray-600">{v.category}</td>

                                        {/* Price */}
                                        <td className="py-3 px-3 font-bold text-gray-900">${v.price.toLocaleString()}</td>

                                        {/* Stock */}
                                        <td className="py-3 px-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${v.quantity > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                                                }`}>
                                                {v.quantity} units
                                            </span>
                                        </td>

                                        {/* Restock Input & Action */}
                                        <td className="py-3 px-3">
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    defaultValue={1}
                                                    onChange={(e) =>
                                                        setRestockAmounts({ ...restockAmounts, [v.id]: Number(e.target.value) })
                                                    }
                                                    className="w-14 bg-[#F8F9FA] border border-gray-200 rounded-xl px-2 py-1.5 text-center text-xs font-semibold text-gray-900 outline-none"
                                                />
                                                <button
                                                    onClick={() => handleRestock(v.id)}
                                                    className="bg-brand-yellow hover:bg-[#F5DC00] text-gray-900 font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 transition-colors"
                                                >
                                                    <RefreshCw size={11} /> Restock
                                                </button>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3 px-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEditModal(v)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(v.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
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

            {/* MODERN ADD / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-3.5 mt-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Make</label>
                                    <input
                                        type="text"
                                        required
                                        value={make}
                                        onChange={(e) => setMake(e.target.value)}
                                        placeholder="Toyota, BMW..."
                                        className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Model</label>
                                    <input
                                        type="text"
                                        required
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        placeholder="Camry, M4..."
                                        className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Year</label>
                                    <input
                                        type="number"
                                        required
                                        value={year}
                                        onChange={(e) => setYear(Number(e.target.value))}
                                        className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Price ($)</label>
                                    <input
                                        type="number"
                                        required
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Stock</label>
                                    <input
                                        type="number"
                                        required
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-gray-900"
                                >
                                    <option value="SEDAN">Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="COUPE">Coupe</option>
                                    <option value="TRUCK">Truck</option>
                                    <option value="HATCHBACK">Hatchback</option>
                                    <option value="VAN">Van</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief summary..."
                                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-2xl px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-gray-900 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-brand-yellow hover:bg-[#F5DC00] text-gray-900 font-bold px-5 py-2.5 rounded-2xl text-xs shadow-xs transition-all"
                                >
                                    {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
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
