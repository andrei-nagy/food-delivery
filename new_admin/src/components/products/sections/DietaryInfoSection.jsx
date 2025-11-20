const DietaryInfoSection = ({ dietaryInfo, setDietaryInfo }) => {
    const handleDietaryChange = (field, value) => {
        setDietaryInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="space-y-4">
            <label className="block text-lg font-semibold text-white">Dietary Information</label>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={dietaryInfo.isGlutenFree}
                        onChange={(e) => handleDietaryChange('isGlutenFree', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-white">Gluten Free</span>
                </label>

                <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={dietaryInfo.isDairyFree}
                        onChange={(e) => handleDietaryChange('isDairyFree', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-white">Dairy Free</span>
                </label>

                <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={dietaryInfo.isVegetarian}
                        onChange={(e) => handleDietaryChange('isVegetarian', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-white">Vegetarian</span>
                </label>

                <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={dietaryInfo.isSpicy}
                        onChange={(e) => handleDietaryChange('isSpicy', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-white">Spicy</span>
                </label>

                <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={dietaryInfo.containsNuts}
                        onChange={(e) => handleDietaryChange('containsNuts', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-white">Contains Nuts</span>
                </label>
            </div>
        </div>
    );
};

export default DietaryInfoSection;