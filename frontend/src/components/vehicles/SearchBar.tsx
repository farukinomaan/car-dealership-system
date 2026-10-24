import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { SearchFilters } from '../../types';

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Hatchback'];

interface Props {
    onSearch: (filters: SearchFilters) => void;
}

export default function SearchBar({ onSearch }: Props) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        const filters: SearchFilters = {};
        if (query) filters.make = query;
        if (category !== 'All') filters.category = category;
        if (minPrice) filters.minPrice = Number(minPrice);
        if (maxPrice) filters.maxPrice = Number(maxPrice);
        onSearch(filters);
    };

    const handleClear = () => {
        setQuery(''); setCategory('All'); setMinPrice(''); setMaxPrice('');
        onSearch({});
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        id="search-input"
                        type="text"
                        placeholder="Search by make or model..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="input-field pl-10"
                    />
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                </button>
                <button id="search-btn" onClick={handleSearch} className="btn-primary">Search</button>
                {(query || category !== 'All' || minPrice || maxPrice) && (
                    <button onClick={handleClear} className="btn-secondary px-3">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {showFilters && (
                <div className="card p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-in">
                    <div>
                        <label className="text-xs text-gray-500 font-medium mb-1.5 block">Category</label>
                        <select
                            id="category-filter"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="input-field text-sm"
                        >
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 font-medium mb-1.5 block">Min Price ($)</label>
                        <input
                            id="min-price-filter"
                            type="number"
                            placeholder="0"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="input-field text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 font-medium mb-1.5 block">Max Price ($)</label>
                        <input
                            id="max-price-filter"
                            type="number"
                            placeholder="999999"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="input-field text-sm"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
