import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface FilterState {
    query: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    year?: number;
}

interface FilterSidebarProps {
    onSearch: (filters: FilterState) => void;
}

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Coupe', 'Truck', 'Hatchback', 'Van'];
export const AVAILABLE_COLORS = [
    { name: 'Black', hex: '#111315' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Brown', hex: '#92400E' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Silver', hex: '#9CA3AF' },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ onSearch }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<number>(100000);
    const [selectedColor, setSelectedColor] = useState<string>('All');

    const triggerSearch = (updates: {
        query?: string;
        category?: string;
        maxPrice?: number;
        color?: string;
        year?: string;
    }) => {
        const cat = updates.category !== undefined
            ? updates.category
            : (selectedCategory === 'All' ? undefined : selectedCategory.toUpperCase());

        const brand = updates.query !== undefined
            ? updates.query
            : selectedBrand;

        const yearVal = updates.year !== undefined
            ? updates.year
            : selectedYear;

        const queryTerm = searchQuery || brand;

        const price = updates.maxPrice !== undefined
            ? updates.maxPrice
            : maxPrice;

        const targetColor = updates.color !== undefined
            ? updates.color
            : selectedColor;

        onSearch({
            query: queryTerm,
            category: cat,
            maxPrice: price,
            color: targetColor === 'All' ? undefined : targetColor,
            year: yearVal ? Number(yearVal) : undefined,
        });
    };

    const handleKeywordChange = (val: string) => {
        setSearchQuery(val);
        triggerSearch({ query: val });
    };

    const handleBrandChange = (brand: string) => {
        setSelectedBrand(brand);
        triggerSearch({ query: brand });
    };

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
        triggerSearch({ year });
    };

    const handleCategoryClick = (cat: string) => {
        setSelectedCategory(cat);
        triggerSearch({ category: cat === 'All' ? undefined : cat.toUpperCase() });
    };

    const handleColorClick = (colorName: string) => {
        setSelectedColor(colorName);
        triggerSearch({ color: colorName });
    };

    const handleReset = () => {
        setSelectedCategory('All');
        setSearchQuery('');
        setSelectedBrand('');
        setSelectedYear('');
        setMaxPrice(100000);
        setSelectedColor('All');
        onSearch({ query: '', color: undefined, year: undefined });
    };

    return (
        <aside className="w-full lg:w-72 bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-5 flex-shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
                <button
                    onClick={handleReset}
                    className="text-xs font-semibold text-amber-500 hover:text-amber-600 transition-colors"
                >
                    Reset all
                </button>
            </div>

            {/* Keyword Search Input */}
            <div className="relative">
                <Search size={14} className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleKeywordChange(e.target.value)}
                    placeholder="Search make or model..."
                    className="w-full bg-[#F8F9FA] border border-gray-200/80 rounded-2xl pl-9 pr-7 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-gray-900 transition-colors"
                />
                {searchQuery && (
                    <button
                        onClick={() => handleKeywordChange('')}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700 text-xs w-4 h-4 flex items-center justify-center"
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Brand & Year Selectors */}
            <div className="grid grid-cols-2 gap-2">
                {/* 1. Select Brand */}
                <div className="relative">
                    <select
                        value={selectedBrand}
                        onChange={(e) => handleBrandChange(e.target.value)}
                        className="w-full appearance-none bg-[#F8F9FA] text-xs font-medium text-gray-700 py-2.5 px-3 pr-7 rounded-xl outline-none border border-transparent focus:border-gray-200"
                    >
                        <option value="">Select Brand</option>
                        <option value="BMW">BMW</option>
                        <option value="Tesla">Tesla</option>
                        <option value="Ford">Ford</option>
                        <option value="Toyota">Toyota</option>
                        <option value="Porsche">Porsche</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
                </div>

                {/* 2. Choose Year Only */}
                <div className="relative">
                    <select
                        value={selectedYear}
                        onChange={(e) => handleYearChange(e.target.value)}
                        className="w-full appearance-none bg-[#F8F9FA] text-xs font-medium text-gray-700 py-2.5 px-3 pr-7 rounded-xl outline-none border border-transparent focus:border-gray-200"
                    >
                        <option value="">Choose Year</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Budget Range Slider */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-900">Budget Range</span>
                </div>
                <input
                    type="range"
                    min="10000"
                    max="150000"
                    step="5000"
                    value={maxPrice}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        setMaxPrice(val);
                        triggerSearch({ maxPrice: val });
                    }}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex items-center justify-between gap-3 mt-3">
                    <div className="flex-1 bg-[#F8F9FA] py-1.5 px-3 rounded-xl text-xs font-semibold text-gray-700 flex justify-between">
                        <span>$10,000</span>
                    </div>
                    <span className="text-gray-300">—</span>
                    <div className="flex-1 bg-[#F8F9FA] py-1.5 px-3 rounded-xl text-xs font-semibold text-gray-700 flex justify-between">
                        <span>${maxPrice.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Type (Vehicle Category) */}
            <div>
                <span className="text-sm font-semibold text-gray-900 block mb-2.5">Type</span>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                        const active = selectedCategory.toLowerCase() === cat.toLowerCase();
                        return (
                            <button
                                key={cat}
                                onClick={() => handleCategoryClick(cat)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${active
                                        ? 'bg-brand-yellow text-gray-900 font-semibold shadow-xs'
                                        : 'bg-[#F8F9FA] text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Color Filter Pills */}
            <div>
                <span className="text-sm font-semibold text-gray-900 block mb-2.5">Color</span>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_COLORS.map((col) => {
                        const active = selectedColor === col.name;
                        return (
                            <button
                                key={col.name}
                                onClick={() => handleColorClick(col.name)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${active
                                        ? 'bg-gray-900 text-white shadow-xs'
                                        : 'bg-[#F8F9FA] text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.hex }} />
                                {col.name}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => handleColorClick('All')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${selectedColor === 'All'
                                ? 'bg-gray-900 text-white shadow-xs'
                                : 'bg-[#F8F9FA] text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        All Colors
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default FilterSidebar;
