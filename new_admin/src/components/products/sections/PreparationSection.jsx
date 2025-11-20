const PreparationSection = ({ preparation, setPreparation }) => {
    const handlePreparationChange = (field, value) => {
        setPreparation(field, value);
    };

    return (
        <div className="space-y-4">
            <label className="block text-lg font-semibold text-white">Preparation Information</label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Cooking Time</label>
                    <input
                        type="text"
                        value={preparation.cookingTime}
                        onChange={(e) => handlePreparationChange('cookingTime', e.target.value)}
                        placeholder="ex: 15-20 minute"
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Spice Level</label>
                    <select
                        value={preparation.spiceLevel}
                        onChange={(e) => handlePreparationChange('spiceLevel', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select spice level</option>
                        <option value="Mild">Mild</option>
                        <option value="Medium 🌶️">Medium 🌶️</option>
                        <option value="Hot 🌶️🌶️">Hot 🌶️🌶️</option>
                        <option value="Very Hot 🌶️🌶️🌶️">Very Hot 🌶️🌶️🌶️</option>
                        <option value="Extreme 🌶️🌶️🌶️🌶️🌶️">Extreme 🌶️🌶️🌶️🌶️🌶️</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Serving Size</label>
                    <input
                        type="text"
                        value={preparation.servingSize}
                        onChange={(e) => handlePreparationChange('servingSize', e.target.value)}
                        placeholder="ex: 350g"
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Difficulty</label>
                    <select
                        value={preparation.difficulty}
                        onChange={(e) => handlePreparationChange('difficulty', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select difficulty</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default PreparationSection;