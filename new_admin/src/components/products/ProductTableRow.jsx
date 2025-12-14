import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";

const ProductTableRow = ({ product, onEdit, onRemove, url, isSelected, onSelect }) => {
    const PriceDisplay = ({ product }) => {
        const hasDiscount = product.discountPercentage > 0;
        
        return (
            <div className="flex flex-col">
                {hasDiscount ? (
                    <>
                        <span className="text-red-400 line-through text-sm">
                            {product.price.toFixed(2)} €
                        </span>
                        <span className="text-green-400 font-bold">
                            {(product.discountedPrice || product.price * (1 - product.discountPercentage / 100)).toFixed(2)} €
                        </span>
                        <span className="text-orange-400 text-xs">
                            -{product.discountPercentage}%
                        </span>
                    </>
                ) : (
                    <span className="text-gray-100">{product.price.toFixed(2)} €</span>
                )}
            </div>
        );
    };

    // ✅ NOU: Handler pentru checkbox
    const handleCheckboxChange = (e) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect(product._id, e.target.checked);
        }
    };

    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`hover:bg-gray-700 ${isSelected ? 'bg-blue-900 bg-opacity-20' : ''}`}
        >
            {/* ✅ NOU: Celulă checkbox */}
            <td className='px-6 py-4 whitespace-nowrap text-center'>
                <input
                    type="checkbox"
                    checked={isSelected || false}
                    onChange={handleCheckboxChange}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-600 bg-gray-700 cursor-pointer"
                />
            </td>
            
            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center'>
                <img
                    src={`${url}/images/` + product.image}
                    alt='Product img'
                    className='size-10 rounded-full object-cover'
                />
                {product.name}
            </td>
            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{product.category}</td>
            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                <PriceDisplay product={product} />
            </td>
            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                {product.discountPercentage > 0 ? (
                    <span className="text-orange-400 font-bold">{product.discountPercentage}%</span>
                ) : (
                    <span className="text-gray-500">No discount</span>
                )}
            </td>
            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 max-w-xs truncate' title={product.ingredients}>
                {Array.isArray(product.ingredients) 
                    ? product.ingredients.join(', ')
                    : (product.ingredients || <span className="text-gray-500">No ingredients</span>)
                }
            </td>
            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                {product.extras?.length > 0 ? (
                    <div className="text-xs text-gray-300">
                        {product.extras.map((extra, index) => (
                            <div key={index}>
                                {extra.name} (+{extra.price}€)
                            </div>
                        ))}
                    </div>
                ) : (
                    <span className="text-xs text-gray-500">No extras</span>
                )}
            </td>
            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                <button onClick={() => onEdit(product)} className='text-indigo-400 hover:text-indigo-300 mr-2'>
                    <Edit size={18} />
                </button>
                <button onClick={() => onRemove(product._id)} className='text-red-400 hover:text-red-300'>
                    <Trash2 size={18} />
                </button>
            </td>
        </motion.tr>
    );
};

export default ProductTableRow;