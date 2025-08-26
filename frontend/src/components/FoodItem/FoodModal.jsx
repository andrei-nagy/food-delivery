import React, { useContext, useEffect, useState, useRef } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './FoodModal.css';

const FoodModal = ({ food, closeModal, isOpen }) => {
    const { addToCart, url } = useContext(StoreContext);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [validationError, setValidationError] = useState("");
    const modalRef = useRef(null);
    const optionsRef = useRef(null);
    const dragStartY = useRef(0);
    const currentY = useRef(0);
    const isDragging = useRef(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => {
                setIsVisible(true);
            });
        } else {
            setIsVisible(false);
            // Resetăm starea la închidere
            setSelectedOptions([]);
            setValidationError("");
            // Mic delay înainte de a permite scroll-ul din nou
            setTimeout(() => {
                document.body.style.overflow = '';
            }, 300);
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handler pentru selectarea opțiunilor
    const handleOptionChange = (option) => {
        setValidationError(""); // Resetează eroarea la interacțiunea utilizatorului
        
        if (selectedOptions.includes(option)) {
            setSelectedOptions(selectedOptions.filter(item => item !== option));
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    };

    // Handler pentru începutul drag-ului
    const handleDragStart = (e) => {
        isDragging.current = true;
        dragStartY.current = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        modalRef.current.style.transition = 'none';
    };

    // Handler pentru drag
    const handleDrag = (e) => {
        if (!isDragging.current) return;
        
        const y = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        const deltaY = y - dragStartY.current;
        
        if (deltaY > 0) {
            currentY.current = deltaY;
            modalRef.current.style.transform = `translateY(${deltaY}px)`;
        }
    };

    // Handler pentru sfârșitul drag-ului
    const handleDragEnd = () => {
        isDragging.current = false;
        modalRef.current.style.transition = 'transform 0.3s ease';
        
        if (currentY.current > 100) {
            // Dacă s-a tras suficient, închide modalul
            modalRef.current.style.transform = 'translateY(100%)';
            setTimeout(() => closeModal(), 300);
        } else {
            // Dacă nu, revine la poziția inițială
            modalRef.current.style.transform = 'translateY(0)';
        }
        
        currentY.current = 0;
    };

    // Funcție pentru scroll smooth către opțiuni
    const scrollToOptions = () => {
        if (optionsRef.current) {
            optionsRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

    // Adaugă event listeners pentru drag
    useEffect(() => {
        const modal = modalRef.current;
        if (!modal) return;

        const handleMouseDown = (e) => {
            if (e.target.classList.contains('food-item-modal-drag-handle')) {
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

        // Touch events pentru mobile
        const handleTouchStart = (e) => {
            if (e.target.classList.contains('food-item-modal-drag-handle')) {
                handleDragStart(e);
            }
        };

        const handleTouchMove = (e) => {
            handleDrag(e);
        };

        const handleTouchEnd = () => {
            if (isDragging.current) {
                handleDragEnd();
            }
        };

        // Mouse events
        modal.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Touch events
        modal.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            // Cleanup mouse events
            modal.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            // Cleanup touch events
            modal.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    const increase = () => setSelectedQuantity(q => q + 1);
    const decrease = () => setSelectedQuantity(q => Math.max(1, q - 1));
    
    const add = () => {
        // Validare - cel puțin o opțiune trebuie selectată
        if (selectedOptions.length === 0) {
            setValidationError("Selectați cel puțin o opțiune");
            scrollToOptions(); // Face scroll către secțiunea cu opțiuni
            return;
        }
        
        if (!food) {
            console.error("Food object is undefined!");
            closeModal();
            return;
        }
        
        const foodId = food.id || food._id;
        
        if (!foodId) {
            console.error("Food ID is undefined!", food);
            closeModal();
            return;
        }
        
        addToCart(foodId, selectedQuantity, specialInstructions, selectedOptions);
        closeModal();
    };

    if (!isOpen || !food) return null;

    return (
        <div className={`food-item-modal-overlay ${isVisible ? 'active' : ''}`} onClick={closeModal}>
            <div 
                className="food-item-modal-container" 
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
            >
                <div 
                    className="food-item-modal-drag-handle"
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                ></div>
                <div className="food-item-modal-header">
                    <h2 className="food-item-modal-title">{food.name}</h2>
                    <button className="food-item-modal-close-btn" onClick={closeModal}>✕</button>
                </div>
                
                <div className="food-item-modal-body">
                    <img src={url + "/images/" + food.image} alt={food.name} className="food-item-modal-image" />
                    <p className="food-item-modal-description">{food.description}</p>
                    
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
                    
                    <div className="food-item-modal-remove-section" ref={optionsRef}>
                        <h3 className="food-item-modal-section-title">Adaugă extra (selectați cel puțin o opțiune)</h3>
                        <div className="food-item-modal-remove-options">
                            <label className="food-item-modal-remove-option">
                                <input 
                                    type="checkbox" 
                                    checked={selectedOptions.includes("Creveți tempura")}
                                    onChange={() => handleOptionChange("Creveți tempura")}
                                />
                                <span>Creveți tempura</span>
                            </label>
                            <label className="food-item-modal-remove-option">
                                <input 
                                    type="checkbox" 
                                    checked={selectedOptions.includes("Sos sriracha")}
                                    onChange={() => handleOptionChange("Sos sriracha")}
                                />
                                <span>Sos sriracha</span>
                            </label>
                        </div>
                        {validationError && (
                            <div className="food-item-modal-error">{validationError}</div>
                        )}
                    </div>
                    
                    <textarea
                        className="food-item-modal-textarea"
                        placeholder="Instrucțiuni speciale (opțional)"
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                    />
                    
                    <div className="food-item-modal-controls">
                        <div className="food-item-modal-quantity">
                            <button className="food-item-modal-qty-btn" onClick={decrease}>-</button>
                            <span className="food-item-modal-qty-value">{selectedQuantity}</span>
                            <button className="food-item-modal-qty-btn" onClick={increase}>+</button>
                        </div>
                        <button className="food-item-modal-add-btn" onClick={add}>
                            Adaugă {(food.price * selectedQuantity).toFixed(2)} €
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodModal;