import { motion } from "framer-motion";
import { Edit, Trash2, MoreVertical, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useState } from "react";

const ProductTableRow = ({ product, onEdit, onRemove, url, isSelected, onSelect, isMobile }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showActions, setShowActions] = useState(false);

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

    // Handler pentru checkbox
    const handleCheckboxChange = (e) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect(product._id, e.target.checked);
        }
    };

    // Handler pentru toggle detalii pe mobile
    const toggleDetails = () => {
        if (isMobile) {
            setShowDetails(!showDetails);
        }
    };

    return (
        <>
            <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`hover:bg-gray-700 ${isSelected ? 'bg-blue-900 bg-opacity-20' : ''} ${isMobile ? 'cursor-pointer' : ''}`}
                onClick={isMobile ? toggleDetails : undefined}
            >
                {/* Checkbox - mereu vizibil */}
                <td className='px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-center'>
                    <input
                        type="checkbox"
                        checked={isSelected || false}
                        onChange={handleCheckboxChange}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-600 bg-gray-700 cursor-pointer"
                    />
                </td>
                
                {/* Nume + Imagine - mereu vizibil */}
                <td className='px-4 md:px-6 py-3 md:py-4 whitespace-nowrap'>
                    <div className="flex items-center gap-2 md:gap-3">
                        {product.image && (
                            <img
                                src={`${url}/images/` + product.image}
                                alt={product.name}
                                className='size-8 md:size-10 rounded-full object-cover'
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm md:text-base font-medium text-white truncate">
                                {product.name}
                            </div>
                            {isMobile && (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                                        {product.category}
                                    </span>
                                    <PriceDisplay product={product} />
                                </div>
                            )}
                        </div>
                        {isMobile && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDetails(!showDetails);
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                        )}
                    </div>
                </td>
                
                {/* Categorie - ascuns pe mobile */}
                {!isMobile && (
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-100'>
                        <span className="px-2 py-1 bg-gray-700 rounded text-sm">
                            {product.category}
                        </span>
                    </td>
                )}
                
                {/* Preț - ascuns pe mobile (apare în coloana nume) */}
                {!isMobile && (
                    <td className='px-6 py-4 whitespace-nowrap'>
                        <PriceDisplay product={product} />
                    </td>
                )}
                
                {/* Discount - ascuns pe mobile */}
                {!isMobile && (
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        {product.discountPercentage > 0 ? (
                            <span className="px-2 py-1 bg-orange-900 bg-opacity-30 rounded text-orange-300 font-medium">
                                {product.discountPercentage}%
                            </span>
                        ) : (
                            <span className="text-gray-500">-</span>
                        )}
                    </td>
                )}
                
                {/* Ingrediente - ascuns pe tabletă și mai mic */}
                {!isMobile && (
                    <td className='px-6 py-4 hidden lg:table-cell max-w-xs'>
                        <div className="text-sm text-gray-300 truncate" title={
                            Array.isArray(product.ingredients) 
                                ? product.ingredients.join(', ')
                                : (product.ingredients || '')
                        }>
                            {Array.isArray(product.ingredients) 
                                ? product.ingredients.slice(0, 2).join(', ') + (product.ingredients.length > 2 ? '...' : '')
                                : (product.ingredients?.substring(0, 50) || <span className="text-gray-500">-</span>)
                            }
                        </div>
                    </td>
                )}
                
                {/* Extras - ascuns pe tabletă */}
                {!isMobile && (
                    <td className='px-6 py-4 hidden xl:table-cell'>
                        {product.extras?.length > 0 ? (
                            <div className="text-xs text-gray-300">
                                <div className="flex flex-wrap gap-1">
                                    {product.extras.slice(0, 2).map((extra, index) => (
                                        <span 
                                            key={index} 
                                            className="px-2 py-0.5 bg-purple-900 bg-opacity-30 rounded"
                                        >
                                            {extra.name}
                                        </span>
                                    ))}
                                    {product.extras.length > 2 && (
                                        <span className="px-2 py-0.5 bg-gray-700 rounded">
                                            +{product.extras.length - 2}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <span className="text-xs text-gray-500">-</span>
                        )}
                    </td>
                )}
                
                {/* Acțiuni - diferit pe mobile vs desktop */}
                <td className='px-4 md:px-6 py-3 md:py-4 whitespace-nowrap'>
                    {isMobile ? (
                        <div className="relative">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowActions(!showActions);
                                }}
                                className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
                            >
                                <MoreVertical size={16} />
                            </button>
                            
                            {showActions && (
                                <div className="absolute right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 min-w-[140px]">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(product);
                                            setShowActions(false);
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-gray-800 text-blue-300"
                                    >
                                        <Edit size={14} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemove(product._id);
                                            setShowActions(false);
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 w-full text-sm text-red-400 hover:bg-gray-800 hover:text-red-300"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 md:gap-2">
                            <button 
                                onClick={() => onEdit(product)} 
                                className='p-1.5 md:p-2 rounded bg-gray-700 hover:bg-gray-600 text-blue-400 hover:text-blue-300 transition-colors'
                                title="Edit"
                            >
                                <Edit size={16} />
                            </button>
                            <button 
                                onClick={() => onRemove(product._id)} 
                                className='p-1.5 md:p-2 rounded bg-gray-700 hover:bg-gray-600 text-red-400 hover:text-red-300 transition-colors'
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </td>
            </motion.tr>

            {/* Detalii expandate pe mobile */}
            {isMobile && showDetails && (
                <tr className="bg-gray-800 bg-opacity-50">
                    <td colSpan="8" className="px-4 py-3">
                        <div className="space-y-3">
                            {/* Detalii complete */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Category</p>
                                    <p className="text-sm text-white">{product.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Discount</p>
                                    <p className="text-sm text-white">
                                        {product.discountPercentage > 0 ? (
                                            <span className="text-orange-400">{product.discountPercentage}%</span>
                                        ) : (
                                            <span className="text-gray-500">No discount</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Ingrediente */}
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Ingredients</p>
                                <p className="text-sm text-gray-300">
                                    {Array.isArray(product.ingredients) 
                                        ? product.ingredients.join(', ')
                                        : (product.ingredients || <span className="text-gray-500">No ingredients</span>)
                                    }
                                </p>
                            </div>

                            {/* Extras */}
                            {product.extras?.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Extras</p>
                                    <div className="space-y-1">
                                        {product.extras.map((extra, index) => (
                                            <div key={index} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-300">{extra.name}</span>
                                                <span className="text-green-400">+{extra.price}€</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Imagine completă (dacă există) */}
                            {product.image && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Image</p>
                                    <img
                                        src={`${url}/images/` + product.image}
                                        alt={product.name}
                                        className="w-20 h-20 rounded-lg object-cover"
                                    />
                                </div>
                            )}

                            {/* Butoane de acțiune în detaliu */}
                            <div className="flex gap-2 pt-2 border-t border-gray-700">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(product);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-900 bg-opacity-30 hover:bg-opacity-40 text-blue-300 rounded text-sm"
                                >
                                    <Edit size={14} />
                                    Edit Product
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(product._id);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-900 bg-opacity-30 hover:bg-opacity-40 text-red-300 rounded text-sm"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// Props default pentru backward compatibility
ProductTableRow.defaultProps = {
    isSelected: false,
    onSelect: () => {},
    isMobile: false
};

export default ProductTableRow;