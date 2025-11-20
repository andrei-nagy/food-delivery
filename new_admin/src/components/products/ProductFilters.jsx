const ProductFilters = ({ columnFilters, onColumnFilter, onResetFilters }) => {
    return (
        <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                <div className="space-y-2">
                    <input
                        type="text"
                        placeholder="Filter name..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={columnFilters.name}
                        onChange={(e) => onColumnFilter('name', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <input
                        type="text"
                        placeholder="Filter category..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={columnFilters.category}
                        onChange={(e) => onColumnFilter('category', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <input
                        type="text"
                        placeholder="Filter price..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={columnFilters.price}
                        onChange={(e) => onColumnFilter('price', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <input
                        type="text"
                        placeholder="Filter discount..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={columnFilters.discount}
                        onChange={(e) => onColumnFilter('discount', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <input
                        type="text"
                        placeholder="Filter ingredients..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={columnFilters.ingredients}
                        onChange={(e) => onColumnFilter('ingredients', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <input
                        type="text"
                        placeholder="Filter extras..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={columnFilters.extras}
                        onChange={(e) => onColumnFilter('extras', e.target.value)}
                    />
                </div>
            </div>
            <button
                onClick={onResetFilters}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 text-sm"
            >
                Reset All Filters
            </button>
        </div>
    );
};

export default ProductFilters;