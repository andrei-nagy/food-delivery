import { useState } from "react";
import { Plus, X } from "lucide-react";

const AllergensSection = ({ allergens, setAllergens }) => {
    const [newAllergen, setNewAllergen] = useState("");

    const addAllergen = () => {
        if (newAllergen.trim() && !allergens.includes(newAllergen.trim())) {
            setAllergens(prev => [...prev, newAllergen.trim()]);
            setNewAllergen("");
        }
    };

    const removeAllergen = (index) => {
        setAllergens(prev => prev.filter((_, i) => i !== index));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addAllergen();
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-lg font-semibold text-white">Allergens</label>
            
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newAllergen}
                    onChange={(e) => setNewAllergen(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add allergen (e.g., Nuts, Gluten)"
                    className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={addAllergen}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition duration-200"
                >
                    <Plus size={16} />
                </button>
            </div>

            {allergens.length > 0 && (
                <div className="bg-gray-700/30 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-white mb-2">Added Allergens:</h4>
                    <div className="flex flex-wrap gap-2">
                        {allergens.map((allergen, index) => (
                            <div key={index} className="flex items-center bg-red-600/20 border border-red-500/50 rounded-full px-3 py-1">
                                <span className="text-red-300 text-sm">{allergen}</span>
                                <button
                                    type="button"
                                    onClick={() => removeAllergen(index)}
                                    className="text-red-400 hover:text-red-300 ml-2"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllergensSection;