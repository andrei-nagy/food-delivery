import { useEffect } from "react";

const NutritionSection = ({ nutrition, setNutrition }) => {
    // Creează un obiect safe cu toate proprietățile necesare
    const safeNutrition = {
        calories: nutrition?.calories ?? 0,
        protein: nutrition?.protein ?? 0,
        carbs: nutrition?.carbs ?? 0,
        fat: nutrition?.fat ?? 0,
        fiber: nutrition?.fiber ?? 0,
        sugar: nutrition?.sugar ?? 0,
    };

    const handleNutritionChange = (field, value) => {
        // Asigură-te că valoarea este convertită corect la number
        const numericValue = value === '' ? 0 : parseFloat(value) || 0;
        
        // Creează un nou obiect cu TOATE proprietățile
        const updatedNutrition = {
            calories: safeNutrition.calories,
            protein: safeNutrition.protein,
            carbs: safeNutrition.carbs,
            fat: safeNutrition.fat,
            fiber: safeNutrition.fiber,
            sugar: safeNutrition.sugar,
            [field]: numericValue
        };
        
        console.log("🔄 Nutrition change:", { 
            field, 
            value, 
            numericValue, 
            currentNutrition: nutrition,
            safeNutrition,
            updatedNutrition 
        });
        
        setNutrition(updatedNutrition);
    };

    useEffect(() => {
        console.log("🔬 NutritionSection - Current nutrition prop:", nutrition);
        console.log("🔬 NutritionSection - Safe nutrition:", safeNutrition);
    }, [nutrition]);

    return (
        <div className="space-y-4">
            <label className="block text-lg font-semibold text-white">Nutrition Information</label>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Calories</label>
                    <input
                        type="number"
                        value={safeNutrition.calories}
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
                        value={safeNutrition.protein}
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
                        value={safeNutrition.carbs}
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
                        value={safeNutrition.fat}
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
                        value={safeNutrition.fiber}
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
                        value={safeNutrition.sugar}
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