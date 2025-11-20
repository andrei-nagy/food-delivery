import { Plus, X } from "lucide-react";

const ExtraOptionsSection = ({ 
    extraName, 
    setExtraName, 
    extraPrice, 
    setExtraPrice, 
    addExtra, 
    updatedProduct, 
    removeExtra 
}) => (
    <div className="space-y-4">
        <label className="block text-lg font-semibold text-white">Extra Options</label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
                <input
                    type="text"
                    value={extraName}
                    onChange={(e) => setExtraName(e.target.value)}
                    placeholder="Extra name (e.g., Extra Cheese)"
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex gap-2">
                <input
                    type="number"
                    value={extraPrice}
                    onChange={(e) => setExtraPrice(e.target.value)}
                    placeholder="Price"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={addExtra}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-500 transition duration-200"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>

        {updatedProduct.extras.length > 0 && (
            <div className="bg-gray-700/30 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white mb-2">Added Extras:</h4>
                <div className="space-y-2">
                    {updatedProduct.extras.map((extra, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-600/50 rounded px-3 py-2">
                            <div>
                                <span className="text-white text-sm">{extra.name}</span>
                                <span className="text-green-400 text-sm ml-2">+${extra.price}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeExtra(index)}
                                className="text-red-400 hover:text-red-300"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

export default ExtraOptionsSection;