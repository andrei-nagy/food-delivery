import { useEffect } from "react";

const NutritionSection = ({ nutrition, setNutrition }) => {
    // Asigură-te că avem întotdeauna un obiect complet
    const safeNutrition = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        ...nutrition
    };

    const handleNutritionChange = (field, value) => {
        // Permite empty string temporar, convertește la number doar când e necesar
        let finalValue;
        
        if (value === '') {
            finalValue = ''; // Păstrează empty temporar pentru UX
        } else {
            const numericValue = parseFloat(value);
            finalValue = isNaN(numericValue) ? 0 : numericValue;
        }
        
        const updatedNutrition = {
            ...safeNutrition,
            [field]: finalValue
        };
        
        console.log("🔄 NutritionSection - Change:", { 
            field, 
            inputValue: value,
            finalValue,
            updatedNutrition 
        });
        
        setNutrition(updatedNutrition);
    };

    // Funcție helper pentru a afișa empty string în loc de 0
    const displayValue = (value) => {
        return value === 0 ? '' : value;
    };

    useEffect(() => {
        console.log("🔬 NutritionSection mounted/updated:", safeNutrition);
    }, [nutrition]);

    return (
        <div className="space-y-4">
            <label className="block text-lg font-semibold text-white">Nutrition Information</label>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Calories</label>
                    <input
                        type="number"
                        value={displayValue(safeNutrition.calories)}
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
                        value={displayValue(safeNutrition.protein)}
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
                        value={displayValue(safeNutrition.carbs)}
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
                        value={displayValue(safeNutrition.fat)}
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
                        value={displayValue(safeNutrition.fiber)}
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
                        value={displayValue(safeNutrition.sugar)}
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