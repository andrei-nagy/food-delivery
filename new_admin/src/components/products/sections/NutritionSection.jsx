const NutritionSection = ({ nutrition, setNutrition }) => {
    const handleNutritionChange = (field, value) => {
        // Asigură-te că valoarea este convertită corect la number
        const numericValue = value === '' ? 0 : parseFloat(value) || 0;
        
        setNutrition({
            ...nutrition,
            [field]: numericValue
        });
    };

    return (
        <div className="space-y-4">
            <label className="block text-lg font-semibold text-white">Nutrition Information</label>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Calories</label>
                    <input
                        type="number"
                        value={nutrition.calories}
                        onChange={(e) => handleNutritionChange('calories', e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Protein (g)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={nutrition.protein}
                        onChange={(e) => handleNutritionChange('protein', e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Carbs (g)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={nutrition.carbs}
                        onChange={(e) => handleNutritionChange('carbs', e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Fat (g)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={nutrition.fat}
                        onChange={(e) => handleNutritionChange('fat', e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Fiber (g)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={nutrition.fiber}
                        onChange={(e) => handleNutritionChange('fiber', e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Sugar (g)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={nutrition.sugar}
                        onChange={(e) => handleNutritionChange('sugar', e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default NutritionSection;