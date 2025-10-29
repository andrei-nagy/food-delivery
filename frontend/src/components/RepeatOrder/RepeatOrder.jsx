import React, { useContext, useState, useEffect, useRef } from "react";
import { StoreContext } from "../../context/StoreContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPlus, FaMinus, FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { toast } from 'react-toastify';

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./RepeatOrder.css";

const RepeatOrder = () => {
  const { url, token, addToCart } = useContext(StoreContext);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasOrders, setHasOrders] = useState(false);
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();
  const swiperRef = useRef(null);
  const autoplayTimeoutRef = useRef(null);

  useEffect(() => {
    fetchRecentOrders();
    return () => {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/userOrders",
        {},
        { headers: { token } }
      );
      
      const allOrders = response.data.data;
      if (allOrders && allOrders.length > 0) {
        const sortedOrders = allOrders.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
        setRecentOrders(sortedOrders);
        setHasOrders(true);
      } else {
        setHasOrders(false);
      }
    } catch (error) {
      console.error("Error fetching recent orders", error);
      setHasOrders(false);
    } finally {
      setLoading(false);
    }
  };

  const pauseAutoplayTemporarily = () => {
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.stop();
      
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
      
      autoplayTimeoutRef.current = setTimeout(() => {
        if (swiperRef.current && swiperRef.current.autoplay) {
          swiperRef.current.autoplay.start();
        }
      }, 3000);
    }
  };

const handleRepeatSingleItem = async (item) => {
  try {
    pauseAutoplayTemporarily();

    const itemId = item.foodId || item._id;
    const quantity = quantities[itemId] || 1;
    
    if (!itemId) {
      console.error("❌ Invalid item data - no item ID found");
      return;
    }

    if (!addToCart) {
      console.error("❌ addToCart function is not available");
      return;
    }

    // ✅ SOLUȚIA: Folosește direct parametrul quantity
    addToCart(itemId, quantity);
  toast.success(`${item.name} x${quantity} added!`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });    
    const button = document.querySelector(`[data-item-id="${itemId}"]`);
    if (button) {
      button.classList.add('added');
      setTimeout(() => button.classList.remove('added'), 500);
    }
    
  } catch (error) {
    console.error("❌ Error adding item to cart:", error);
  }
};

  const handleQuantityChange = (itemId, change) => {
    pauseAutoplayTemporarily();

    setQuantities(prev => {
      const currentQuantity = prev[itemId] || 1;
      const newQuantity = Math.max(1, currentQuantity + change);
      
      return {
        ...prev,
        [itemId]: newQuantity
      };
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short"
    });
  };

  const getAllUniqueProducts = () => {
    const allProducts = [];
    
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        const existingIndex = allProducts.findIndex(
          prod => (prod.foodId || prod._id) === (item.foodId || item._id)
        );
        
        if (existingIndex === -1) {
          allProducts.push({
            ...item,
            orderDate: order.date,
            orderStatus: order.payment ? 'completed' : 'pending'
          });
        }
      });
    });
    
    return allProducts;
  };

  const uniqueProducts = getAllUniqueProducts();

  if (loading) {
    return (
      <div className="repeat-order">
        <div className="repeat-order-header">
          <div className="repeat-order-header-left">
            <span className="repeat-order-title">Repeat Your Order</span>
            <small className="repeat-order-subtitle">
              Quick reorder from your history
            </small>
          </div>
        </div>
        
        <div className="repeat-order-swiper-container">
          <div className="repeat-order-swiper-loading">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="repeat-product-card-medium-skeleton">
                <div className="repeat-product-image-medium-skeleton"></div>
                <div className="repeat-product-content-medium-skeleton">
                  <div className="repeat-product-name-medium-skeleton"></div>
                  <div className="repeat-product-meta-medium-skeleton">
                    <div className="repeat-product-price-medium-skeleton"></div>
                    <div className="repeat-product-date-medium-skeleton"></div>
                  </div>
                  <div className="repeat-product-actions-medium-skeleton">
                    <div className="quantity-selector-medium-skeleton"></div>
                    <div className="add-button-medium-skeleton"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasOrders || recentOrders.length === 0) {
    return null;
  }

  return (
    <div className="repeat-order">
      <div className="repeat-order-header">
        <div className="repeat-order-header-left">
          <span className="repeat-order-title">Repeat Your Order</span>
          <small className="repeat-order-subtitle">
            Quick reorder from your history
          </small>
        </div>
        
        {/* {uniqueProducts.length > 5 && (
          <Link to="/order-history" className="repeat-order-view-more">
            View All
            <FaArrowRight className="repeat-order-arrow-icon" />
          </Link>
        )} */}
      </div>

      <div className="repeat-order-swiper-container">
        {/* <button className="swiper-custom-button swiper-custom-prev">
          <FaChevronLeft />
        </button> */}
        
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={1.8}
          loop={uniqueProducts.length > 3}
          autoplay={{ 
            delay: 4000, 
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          speed={600}
        //   navigation={{
        //     nextEl: '.swiper-custom-next',
        //     prevEl: '.swiper-custom-prev',
        //   }}
          pagination={{
            clickable: true,
            type: 'bullets',
 el: '.swiper-pagination-medium',          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          breakpoints={{
            380: { slidesPerView: 2.0 },
            480: { slidesPerView: 2.3 },
            640: { slidesPerView: 2.8 },
            768: { 
              slidesPerView: 3.3,
              spaceBetween: 18
            },
            1024: { 
              slidesPerView: 3.8,
              spaceBetween: 20
            },
            1200: { 
              slidesPerView: 4.3,
              spaceBetween: 20
            },
            1400: { 
              slidesPerView: 4.8,
              spaceBetween: 22
            }
          }}
          className="repeat-order-swiper-medium"
        >
          {uniqueProducts.map((item, index) => {
            const itemId = item.foodId || item._id;
            const quantity = quantities[itemId] || 1;
            
            return (
              <SwiperSlide key={itemId || index}>
                <div className="repeat-product-card-medium">
                  <div className="repeat-product-image-section-medium">
                    <div className="repeat-product-image-container-medium">
                      <img 
                        src={`${url}/images/${item.image}`} 
                        alt={item.name}
                        className="repeat-product-image-medium"
                        onError={(e) => {
                          e.target.src = '/images/placeholder-food.jpg';
                        }}
                      />
                      {/* <div className="repeat-product-badge-medium">
                        {item.orderStatus === 'completed' ? '✅ Completed' : '⏳ Pending'}
                      </div> */}
                    </div>
                  </div>

                  <div className="repeat-product-content-medium">
                    <div className="repeat-product-info-medium">
                      <h3 className="repeat-product-name-medium">{item.name}</h3>
                      
                      <div className="repeat-product-meta-medium">
                        <div className="repeat-product-price-medium">
                          {item.price} €
                        </div>
                        {/* <div className="repeat-product-date-medium">
                          {formatDate(item.orderDate)}
                        </div> */}
                      </div>
                    </div>

                    <div className="repeat-product-actions-medium">
                      <div className="quantity-selector-medium">
                        <button 
                          className="qty-btn-medium qty-minus-medium"
                          onClick={() => handleQuantityChange(itemId, -1)}
                        >
                          <FaMinus />
                        </button>
                        <span className="qty-value-medium">{quantity}</span>
                        <button 
                          className="qty-btn-medium qty-plus-medium"
                          onClick={() => handleQuantityChange(itemId, 1)}
                        >
                          <FaPlus />
                        </button>
                      </div>
                      
                      <button 
                        className="repeat-add-btn-medium"
                        onClick={() => handleRepeatSingleItem(item)}
                        title={`Add ${quantity} ${item.name} to cart`}
                        data-item-id={itemId}
                      >
                        {/* <FaPlus className="add-icon-medium" /> */}
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* <button className="swiper-custom-button swiper-custom-next">
          <FaChevronRight />
        </button> */}

        <div className="swiper-pagination-medium"></div>
      </div>
    </div>
  );
};

export default RepeatOrder;