import React, { useContext, useEffect, useState, useRef } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './FoodModal.css';

const FoodModal = ({ food, closeModal, isOpen }) => {
    const { addToCart, url } = useContext(StoreContext);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [validationError, setValidationError] = useState("");
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [descriptionHeight, setDescriptionHeight] = useState('60px');
    const descriptionRef = useRef(null);
    const modalRef = useRef(null);
    const optionsRef = useRef(null);
    const dragStartY = useRef(0);
    const currentY = useRef(0);
    const isDragging = useRef(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Forțează recalcularea layout-ului
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
            requestAnimationFrame(() => {
                setIsVisible(true);
            });
        } else {
            setIsVisible(false);
            setSelectedOptions([]);
            setValidationError("");
            setIsDescriptionExpanded(false);
            setTimeout(() => {
                document.body.style.overflow = '';
            }, 300);
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        if (descriptionRef.current) {
            if (isDescriptionExpanded) {
                setDescriptionHeight(`${descriptionRef.current.scrollHeight}px`);
            } else {
                requestAnimationFrame(() => {
                    setDescriptionHeight('60px');
                });
            }
        }
    }, [isDescriptionExpanded, food.description]);

    const handleOptionChange = (option) => {
        setValidationError("");
        
        if (selectedOptions.includes(option)) {
            setSelectedOptions(selectedOptions.filter(item => item !== option));
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    };

    const handleDragStart = (e) => {
        isDragging.current = true;
        dragStartY.current = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        modalRef.current.style.transition = 'none';
    };

    const handleDrag = (e) => {
        if (!isDragging.current) return;
        
        const y = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        const deltaY = y - dragStartY.current;
        
        if (deltaY > 0) {
            currentY.current = deltaY;
            modalRef.current.style.transform = `translateY(${deltaY}px)`;
        }
    };

    const handleDragEnd = () => {
        isDragging.current = false;
        modalRef.current.style.transition = 'transform 0.3s ease';
        
        if (currentY.current > 100) {
            modalRef.current.style.transform = 'translateY(100%)';
            setTimeout(() => closeModal(), 300);
        } else {
            modalRef.current.style.transform = 'translateY(0)';
        }
        
        currentY.current = 0;
    };

    const scrollToOptions = () => {
        if (optionsRef.current) {
            optionsRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

    useEffect(() => {
        const modal = modalRef.current;
        if (!modal) return;

        const handleMouseDown = (e) => {
            if (e.target.classList.contains('food-item-modal-drag-handle') || 
                e.target.closest('.food-item-modal-drag-handle')) {
                handleDragStart(e);
            }
        };

        const handleMouseMove = (e) => {
            handleDrag(e);
        };

        const handleMouseUp = () => {
            if (isDragging.current) {
                handleDragEnd();
            }
        };

        const handleTouchStart = (e) => {
            if (e.target.classList.contains('food-item-modal-drag-handle') || 
                e.target.closest('.food-item-modal-drag-handle')) {
                handleDragStart(e);
            }
        };

        const handleTouchMove = (e) => {
            if (!isDragging.current) return;
            
            e.preventDefault();
            
            const y = e.touches[0].clientY;
            const deltaY = y - dragStartY.current;
            
            if (deltaY > 0) {
                currentY.current = deltaY;
                modalRef.current.style.transform = `translateY(${deltaY}px)`;
            }
        };

        const handleTouchEnd = () => {
            if (isDragging.current) {
                handleDragEnd();
            }
        };

        modal.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        modal.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            modal.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            modal.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    const increase = () => setSelectedQuantity(q => q + 1);
    const decrease = () => setSelectedQuantity(q => Math.max(1, q - 1));
    
// ✅ CORECT: Generează ID compatibil cu backend
const generateCartItemId = () => {
    // ✅ FOLOSEȘTE food._id care este ID-ul real din MongoDB
    const baseId = food._id; // ← SCHIMBĂ ASTA!
    const extrasString = selectedOptions.sort().join(',');
    
    // ✅ INCLUDE specialInstructions în ID pentru a crea item-uri separate
    const instructionsHash = specialInstructions 
        ? btoa(specialInstructions).substring(0, 8).replace(/=/g, '')
        : '';
    
    if (extrasString && instructionsHash) {
        return `${baseId}__${btoa(extrasString).replace(/=/g, '')}__${instructionsHash}`;
    } else if (extrasString) {
        return `${baseId}__${btoa(extrasString).replace(/=/g, '')}`;
    } else if (instructionsHash) {
        return `${baseId}____${instructionsHash}`;
    } else {
        return `${baseId}__`;
    }
};

    // Calculează prețul total cu extrasele selectate
    const calculateTotalPrice = () => {
        let total = food.price * selectedQuantity;
        
        // Adaugă prețul extraselor selectate
        selectedOptions.forEach(optionName => {
            const extra = food.extras?.find(extra => extra.name === optionName);
            if (extra) {
                total += extra.price * selectedQuantity;
            }
        });
        
        return total;
    };

    // ✅ CORECTAT: Funcție cu debugging extins
    const handleAddToCart = () => {
        if (!food) {
            console.error("Food object is undefined!");
            closeModal();
            return;
        }
        

        const cartItemId = generateCartItemId();
        // Pregătește datele pentru coș
      const cartItemData = {
    baseFoodId: food._id, // ← SCHIMBĂ ȘI AICIA!
    quantity: selectedQuantity,
    specialInstructions: specialInstructions,
    selectedOptions: selectedOptions,
    unitPrice: food.price,
    extrasPrice: selectedOptions.reduce((total, optionName) => {
        const extra = food.extras?.find(extra => extra.name === optionName);
        return total + (extra?.price || 0);
    }, 0)
};
        
        
        // ✅ Trimite specialInstructions către addToCart
        addToCart(cartItemId, selectedQuantity, specialInstructions, selectedOptions, cartItemData);
        closeModal();
    };


    const handleAddButton = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleAddToCart();
    };

    const handleQtyButton = (action) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        action();
    };

    const truncateDescription = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (!isOpen || !food) return null;

    return (
        <div className={`food-item-modal-overlay ${isVisible ? 'active' : ''}`} onClick={closeModal}>
            <div 
                className="food-item-modal-container" 
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="food-item-modal-sticky-header">
                    <div 
                        className="food-item-modal-drag-handle"
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                    ></div>
                    <div className="food-item-modal-header">
                        <h2 className="food-item-modal-title">{food.name}</h2>
                        <button className="food-item-modal-close-btn" onClick={closeModal}>✕</button>
                    </div>
                </div>
                
                <div className="food-item-modal-body">
                    <img src={url + "/images/" + food.image} alt={food.name} className="food-item-modal-image" />
                    
                    <div className="food-item-modal-description-wrapper">
                        <div 
                            ref={descriptionRef}
                            className={`food-item-modal-description ${isDescriptionExpanded ? 'expanded' : ''}`}
                            style={{ maxHeight: descriptionHeight }}
                        >
                            <div className="food-item-modal-description-content">
                                {isDescriptionExpanded 
                                    ? food.description
                                    : truncateDescription(food.description, 200)
                                }
                            </div>
                        </div>
                        
                        {food.description.length > 200 && (
                            <button 
                                className="food-item-modal-view-more"
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            >
                                {isDescriptionExpanded ? (
                                    <span>View less <FaChevronUp className="food-item-modal-chevron" /></span>
                                ) : (
                                    <span>View more <FaChevronDown className="food-item-modal-chevron" /></span>
                                )}
                            </button>
                        )}
                    </div>
                    
                    <div className="food-item-modal-price-section">
                        <span className="food-item-modal-current-price">{food.price.toFixed(2)} €</span>
                        {food.originalPrice && (
                            <span className="food-item-modal-original-price">{food.originalPrice.toFixed(2)} €</span>
                        )}
                    </div>
                    
                    <div className="food-item-modal-ingredients">
                        <h3 className="food-item-modal-section-title">Ingrediente</h3>
                        <p className="food-item-modal-section-content">Orez (120g), creveți tempura (produs decongelat) (45g), castravete (20g), cremă de brânză (25g), iree tobiko (produs decongelat) (10g), mango (15g), sos sriracha (5g), sos de ananas (5g), alge nori (1g) - 246g.</p>
                    </div>
                    
                    {/* SECȚIUNEA EXTRASELOR DIN BAZA DE DATE */}
                    {food.extras && food.extras.length > 0 && (
                        <div className="food-item-modal-remove-section" ref={optionsRef}>
                            <h3 className="food-item-modal-section-title">Extra opțiuni (opțional)</h3>
                            <div className="food-item-modal-remove-options">
                                {food.extras.map((extra) => (
                                    <label key={extra._id || extra.name} className="food-item-modal-remove-option">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedOptions.includes(extra.name)}
                                            onChange={() => handleOptionChange(extra.name)}
                                        />
                                        <span className="food-item-modal-option-text">
                                            {extra.name}
                                            <span className="food-item-modal-option-price">+{extra.price.toFixed(2)} €</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {validationError && (
                                <div className="food-item-modal-error">{validationError}</div>
                            )}
                        </div>
                    )}
                    
                    <textarea
                        className="food-item-modal-textarea"
                        placeholder="Instrucțiuni speciale (opțional)"
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                    />
                    
                    <div className="food-item-modal-controls">
                        <div className="food-item-modal-quantity">
                            <button 
                                className="food-item-modal-qty-btn" 
                                onClick={handleQtyButton(decrease)}
                                onTouchEnd={handleQtyButton(decrease)}
                            >-</button>
                            <span className="food-item-modal-qty-value">{selectedQuantity}</span>
                            <button 
                                className="food-item-modal-qty-btn" 
                                onClick={handleQtyButton(increase)}
                                onTouchEnd={handleQtyButton(increase)}
                            >+</button>
                        </div>
                        <button 
                            className="food-item-modal-add-btn" 
                            onClick={handleAddButton}
                            onTouchEnd={handleAddButton}
                        >
                            Adaugă {calculateTotalPrice().toFixed(2)} €
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodModal;