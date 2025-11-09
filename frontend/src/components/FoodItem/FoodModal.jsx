import React, { useContext, useEffect, useState, useRef } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './FoodModal.css';
import { assets } from "../../assets/assets";

const FoodModal = ({ food, closeModal, isOpen }) => {
    const { addToCart, url, canAddToCart, billRequested } = useContext(StoreContext);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [validationError, setValidationError] = useState("");
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [descriptionHeight, setDescriptionHeight] = useState('60px');
    const [imageError, setImageError] = useState(false);
    const descriptionRef = useRef(null);
    const modalRef = useRef(null);
    const optionsRef = useRef(null);
    const dragStartY = useRef(0);
    const currentY = useRef(0);
    const isDragging = useRef(false);

    // Safe access to food properties
    const foodDescription = food?.description || "";
    const foodName = food?.name || "";
    const foodPrice = food?.price || 0;
    const foodImage = food?.image || "";
    const foodExtras = food?.extras || [];
    const foodId = food?._id || "";
    const isVegan = food?.isVegan || false;
    const isBestSeller = food?.isBestSeller || false;
    const isNewAdded = food?.isNewAdded || false;

    useEffect(() => {
        if (isOpen && food) {
            document.body.style.overflow = 'hidden';
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
            setImageError(false); // Reset image error when modal closes
            setTimeout(() => {
                document.body.style.overflow = '';
            }, 300);
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, food]);

    useEffect(() => {
        if (descriptionRef.current && food) {
            if (isDescriptionExpanded) {
                setDescriptionHeight(`${descriptionRef.current.scrollHeight}px`);
            } else {
                requestAnimationFrame(() => {
                    setDescriptionHeight('60px');
                });
            }
        }
    }, [isDescriptionExpanded, foodDescription, food]);

    const handleImageError = () => {
        setImageError(true);
    };

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
        if (modalRef.current) {
            modalRef.current.style.transition = 'none';
        }
    };

    const handleDrag = (e) => {
        if (!isDragging.current || !modalRef.current) return;
        
        const y = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        const deltaY = y - dragStartY.current;
        
        if (deltaY > 0) {
            currentY.current = deltaY;
            modalRef.current.style.transform = `translateY(${deltaY}px)`;
        }
    };

    const handleDragEnd = () => {
        isDragging.current = false;
        if (!modalRef.current) return;
        
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
            
            if (deltaY > 0 && modalRef.current) {
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

    const increase = () => {
        if (billRequested) return;
        setSelectedQuantity(q => q + 1);
    };

    const decrease = () => {
        if (billRequested) return;
        setSelectedQuantity(q => Math.max(1, q - 1));
    };
    
    const generateCartItemId = () => {
        if (!foodId) return "";
        
        const baseId = foodId;
        const extrasString = selectedOptions.sort().join(',');
        
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

    const calculateTotalPrice = () => {
        if (!food) return 0;
        
        let total = foodPrice * selectedQuantity;
        
        selectedOptions.forEach(optionName => {
            const extra = foodExtras.find(extra => extra.name === optionName);
            if (extra) {
                total += extra.price * selectedQuantity;
            }
        });
        
        return total;
    };

    const handleAddToCart = () => {
        // ✅ Verifică dacă nota a fost cerută înainte de a adăuga în coș
        if (billRequested) {
            closeModal();
            return;
        }

        if (!food) {
            console.error("Food object is undefined!");
            closeModal();
            return;
        }

        const cartItemId = generateCartItemId();
        const cartItemData = {
            baseFoodId: foodId,
            quantity: selectedQuantity,
            specialInstructions: specialInstructions,
            selectedOptions: selectedOptions,
            unitPrice: foodPrice,
            extrasPrice: selectedOptions.reduce((total, optionName) => {
                const extra = foodExtras.find(extra => extra.name === optionName);
                return total + (extra?.price || 0);
            }, 0)
        };
        
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
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Early return if no food or not open
    if (!isOpen || !food) return null;

    return (
        <div className={`food-item-modal-overlay ${isVisible ? 'active' : ''}`} onClick={closeModal}>
            <div 
                className={`food-item-modal-container ${billRequested ? 'bill-requested-modal' : ''}`} 
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
                        <h2 className="food-item-modal-title">{foodName}</h2>
                        <button className="food-item-modal-close-btn" onClick={closeModal}>✕</button>
                    </div>
                </div>
                
                <div className="food-item-modal-body">
                    {/* Bill Requested Warning Banner */}
                    {billRequested && (
                        <div className="food-modal-bill-warning">
                            <div className="food-modal-bill-warning-content">
                                <span className="food-modal-bill-warning-icon">⚠️</span>
                                <div className="food-modal-bill-warning-text">
                                    <strong>Bill Requested</strong>
                                    <span>Cannot add new items. Please cancel the bill request first.</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Imaginea principală cu fallback */}
                    <img 
                        src={imageError ? assets.image_coming_soon : (url + "/images/" + foodImage)} 
                        alt={foodName} 
                        className={`food-item-modal-image ${billRequested ? 'disabled-image' : ''} ${imageError ? 'image-error' : ''}`}
                        onError={handleImageError}
                    />
                    
                    <div className="food-item-modal-description-wrapper">
                        <div 
                            ref={descriptionRef}
                            className={`food-item-modal-description ${isDescriptionExpanded ? 'expanded' : ''} ${billRequested ? 'disabled-text' : ''}`}
                            style={{ maxHeight: descriptionHeight }}
                        >
                            <div className="food-item-modal-description-content">
                                {isDescriptionExpanded 
                                    ? foodDescription
                                    : truncateDescription(foodDescription, 200)
                                }
                            </div>
                        </div>
                        
                        {foodDescription.length > 200 && !billRequested && (
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
                        <span className={`food-item-modal-current-price ${billRequested ? 'disabled-text' : ''}`}>
                            {foodPrice.toFixed(2)} €
                        </span>
                        {food.originalPrice && (
                            <span className={`food-item-modal-original-price ${billRequested ? 'disabled-text' : ''}`}>
                                {food.originalPrice.toFixed(2)} €
                            </span>
                        )}
                    </div>
                    
                    <div className="food-item-modal-ingredients">
                        <h3 className={`food-item-modal-section-title ${billRequested ? 'disabled-text' : ''}`}>
                            Ingrediente
                        </h3>
                        <p className={`food-item-modal-section-content ${billRequested ? 'disabled-text' : ''}`}>
                            {foodDescription || "Ingredientele nu sunt disponibile momentan."}
                        </p>
                    </div>

                    {/* Badge-uri pentru Vegan, Best Seller și New */}
                    {(isVegan || isBestSeller || isNewAdded) && !billRequested && (
                        <div className="food-item-modal-badges">
                            <h3 className="food-item-modal-section-title">Caracteristici</h3>
                            <div className="food-item-modal-badges-container">
                                {isNewAdded && (
                                    <span className="food-item-modal-badge food-item-modal-badge-new">
                                        <span className="food-item-modal-badge-text">New</span>
                                    </span>
                                )}
                                {isVegan && (
                                    <span className="food-item-modal-badge food-item-modal-badge-vegan">
                                        <span className="food-item-modal-badge-text">Vegan</span>
                                    </span>
                                )}
                                {isBestSeller && (
                                    <span className="food-item-modal-badge food-item-modal-badge-bestseller">
                                        <span className="food-item-modal-badge-text">Best Seller</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {foodExtras.length > 0 && !billRequested && (
                        <div className="food-item-modal-remove-section" ref={optionsRef}>
                            <h3 className="food-item-modal-section-title">Extra opțiuni (opțional)</h3>
                            <div className="food-item-modal-remove-options">
                                {foodExtras.map((extra) => (
                                    <label key={extra._id || extra.name} className="food-item-modal-remove-option">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedOptions.includes(extra.name)}
                                            onChange={() => handleOptionChange(extra.name)}
                                            disabled={billRequested}
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
                    
                    {!billRequested && (
                        <textarea
                            className="food-item-modal-textarea"
                            placeholder="Instrucțiuni speciale (opțional)"
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                            disabled={billRequested}
                        />
                    )}
                    
                    <div className="food-item-modal-controls">
                        <div className={`food-item-modal-quantity ${billRequested ? 'disabled-controls' : ''}`}>
                            <button 
                                className="food-item-modal-qty-btn" 
                                onClick={handleQtyButton(decrease)}
                                onTouchEnd={handleQtyButton(decrease)}
                                disabled={billRequested}
                            >-</button>
                            <span className="food-item-modal-qty-value">{selectedQuantity}</span>
                            <button 
                                className="food-item-modal-qty-btn" 
                                onClick={handleQtyButton(increase)}
                                onTouchEnd={handleQtyButton(increase)}
                                disabled={billRequested}
                            >+</button>
                        </div>
                        <button 
                            className={`food-item-modal-add-btn ${billRequested ? 'food-item-modal-add-btn-disabled' : ''}`} 
                            onClick={handleAddButton}
                            onTouchEnd={handleAddButton}
                            disabled={billRequested}
                        >
                            {billRequested ? 'Bill Requested' : `Add ${calculateTotalPrice().toFixed(2)} €`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodModal;