import { X } from "lucide-react";

const ImageUploadSection = ({ image, onImageChange }) => {
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) onImageChange(file);
    };

    const removeImage = () => {
        onImageChange(null);
    };

    return (
        <div className="space-y-3">
            <label className="block text-lg font-semibold text-white">Product Image</label>
            <label htmlFor="image" className="cursor-pointer group">
                <div className="w-full h-48 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center transition-all duration-300 group-hover:border-blue-500 group-hover:bg-gray-700/50">
                    {image ? (
                        <div className="relative w-full h-full">
                            <img 
                                src={URL.createObjectURL(image)} 
                                alt="Product preview" 
                                className="w-full h-full object-cover rounded-xl"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="text-white text-center">
                                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm">Change Image</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-6">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-400 text-sm">Click to upload product image</p>
                            <p className="text-gray-500 text-xs mt-1">PNG, JPG, JPEG up to 10MB</p>
                        </div>
                    )}
                </div>
                <input 
                    onChange={handleImageUpload} 
                    type="file" 
                    id="image" 
                    hidden 
                    accept="image/*"
                />
            </label>
            {image && (
                <div className="flex justify-between items-center bg-gray-700/30 rounded-lg p-3">
                    <span className="text-white text-sm truncate">{image.name}</span>
                    <button
                        type="button"
                        onClick={removeImage}
                        className="text-red-400 hover:text-red-300 p-1"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageUploadSection;