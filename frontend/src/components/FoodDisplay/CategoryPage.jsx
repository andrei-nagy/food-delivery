import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import FoodItemCategory from "../FoodItem/FoodItemCategory";
import {
  FaArrowLeft,
  FaSearch,
  FaTimes,
  FaTh,
  FaList,
  FaFilter,
  FaStar,
  FaLeaf,
  FaFire,
  FaEuroSign,
  FaShoppingBag
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import FoodModal from "../FoodItem/FoodModal";
import "./CategoryPage.css";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const { food_list, cartItems, url, getTotalCartAmount } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [viewMode, setViewMode] = useState("double");
  const [showFilters, setShowFilters] = useState(false);
  const [rangeProgress, setRangeProgress] = useState({ min: 0, max: 100 });

  // Filtre state
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dietaryFilters, setDietaryFilters] = useState({
    vegan: false,
    bestSeller: false,
    new: false,
  });
  const [sortBy, setSortBy] = useState("name");

  // Floating button state
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const lastScrollY = useRef(0);
  const scrollTimeoutRef = useRef(null);

  const searchInputRef = useRef(null);

  const cartItemCount = Object.values(cartItems).reduce(
    (total, count) => total + count,
    0
  );

  // ✅ LOGICĂ NOUĂ - Scroll progresiv pentru header și categorii mobile
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 50;

      // Calculează opacitatea și transformarea pe baza scroll-ului
      let opacity = 1;
      let translateY = 0;

      if (currentScrollY > scrollThreshold) {
        // Scade opacitatea și translate progresiv
        const progress = Math.min((currentScrollY - scrollThreshold) / 100, 1);
        opacity = 1 - progress;
        translateY = -progress * 100; // Se mișcă în sus progresiv
      }

      // Aplică transformările elementelor
      const header = document.querySelector('.category-explorer__header');
      const mobileCategories = document.querySelector('.category-explorer__mobile-categories-scroll');
      
      if (header) {
        header.style.opacity = opacity;
        header.style.transform = `translateY(${translateY}px)`;
      }
      
      if (mobileCategories) {
        mobileCategories.style.opacity = opacity;
        mobileCategories.style.transform = `translateY(${translateY}px)`;
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // ✅ Funcție pentru a afișa butonul smooth
  const showFloatingButton = () => {
    setIsVisible(true);
  };

  // ✅ Funcție pentru a ascunde butonul smooth
  const hideFloatingButton = () => {
    setIsVisible(false);
  };

  // ✅ Gestionează afișarea/ascunderea pe baza produselor din coș
  useEffect(() => {
    if (cartItemCount > 0) {
      setShouldRender(true);
      // Mic delay pentru a permite render-ului să se actualizeze
      setTimeout(() => {
        showFloatingButton();
      }, 100);
    } else {
      hideFloatingButton();
      // Așteaptă ca animația să se termine înainte de a seta shouldRender pe false
      setTimeout(() => {
        setShouldRender(false);
      }, 400);
    }
  }, [cartItemCount]);

  // ✅ Scroll handler cu debounce pentru performanță - PENTRU FLOATING BUTTON
  useEffect(() => {
    const handleScrollFloating = () => {
      const currentScrollY = window.scrollY;

      // Curăță timeout-ul anterior
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Setează un nou timeout pentru a evita prea multe actualizări
      scrollTimeoutRef.current = setTimeout(() => {
        if (currentScrollY < lastScrollY.current - 50 && shouldRender) {
          // scroll în sus cu cel puțin 50px - afișează butonul
          showFloatingButton();
        } else if (currentScrollY > lastScrollY.current + 50 && isVisible) {
          // scroll în jos cu cel puțin 50px - ascunde butonul
          hideFloatingButton();
        }

        lastScrollY.current = currentScrollY;
      }, 50);
    };

    window.addEventListener("scroll", handleScrollFloating, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScrollFloating);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [shouldRender, isVisible]); 

  // ✅ Curăță timeout-urile la unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Calculează progresul pentru bara colorată
  useEffect(() => {
    if (food_list.length > 0) {
      const maxPrice = Math.ceil(
        Math.max(...food_list.map((item) => item.price))
      );
      const minPercent = (priceRange[0] / maxPrice) * 100;
      const maxPercent = (priceRange[1] / maxPrice) * 100;
      setRangeProgress({ min: minPercent, max: maxPercent });
    }
  }, [priceRange, food_list]);

  // Setup categories and price range
  useEffect(() => {
    const uniqueCategories = [
      "All",
      ...new Set(food_list.map((item) => item.category)),
    ];
    setCategories(uniqueCategories);

    // Set price range based on actual food prices
    if (food_list.length > 0) {
      const prices = food_list.map((item) => item.price);
      const maxPrice = Math.ceil(Math.max(...prices));
      setPriceRange([0, maxPrice]);
    }
  }, [food_list]);

  // Search suggestions with description search
  useEffect(() => {
    if (searchQuery.length > 0) {
      const suggestions = food_list
        .filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description &&
              item.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5);
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }
  }, [searchQuery, food_list]);

  // Filter handlers
  const handleCategoryFilter = (category) => {
    setSelectedCategories((prev) => {
      if (category === "All") {
        return prev.includes("All") ? [] : ["All"];
      }

      if (prev.includes("All")) {
        return [category];
      }

      if (prev.includes(category)) {
        return prev.filter((cat) => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleDietaryFilter = (filter) => {
    setDietaryFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setDietaryFilters({
      vegan: false,
      bestSeller: false,
      new: false,
    });
    setPriceRange([
      0,
      Math.ceil(Math.max(...food_list.map((item) => item.price))),
    ]);
    setSortBy("name");
    setSearchQuery("");
  };

  const handleCategoryClick = (cat) => {
    navigate(`/category/${encodeURIComponent(cat)}`);
    setShowFilters(false);
    setSelectedCategories([]);
  };

  const openModal = (food) => {
    setSelectedFood(food);
    setIsModalOpen(true);
    setShowSuggestions(false);
  };

  const closeModal = () => {
    setSelectedFood(null);
    setIsModalOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleSuggestionClick = (food) => {
    openModal(food);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // Apply all filters
  const filteredByCategory =
    categoryName === "All"
      ? food_list
      : food_list.filter((item) => item.category === categoryName);

  let filteredFood = filteredByCategory.filter((item) => {
    // Search filter (name + description)
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Price filter
    const matchesPrice =
      item.price >= priceRange[0] && item.price <= priceRange[1];

    // Category filters
    const matchesCategories =
      selectedCategories.length === 0 ||
      selectedCategories.includes("All") ||
      selectedCategories.includes(item.category);

    // Dietary filters
    const matchesVegan = !dietaryFilters.vegan || item.isVegan;
    const matchesBestSeller = !dietaryFilters.bestSeller || item.isBestSeller;
    const matchesNew = !dietaryFilters.new || item.isNewAdded;

    return (
      matchesSearch &&
      matchesPrice &&
      matchesCategories &&
      matchesVegan &&
      matchesBestSeller &&
      matchesNew
    );
  });

  // Sort filtered food
  filteredFood = filteredFood.sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Count active filters
  const activeFilterCount =
    (selectedCategories.length > 0 ? 1 : 0) +
    (dietaryFilters.vegan ? 1 : 0) +
    (dietaryFilters.bestSeller ? 1 : 0) +
    (dietaryFilters.new ? 1 : 0) +
    (priceRange[0] > 0 ||
    priceRange[1] < Math.ceil(Math.max(...food_list.map((item) => item.price)))
      ? 1
      : 0);

  // Group foods by category when multiple categories are selected
  const getGroupedFoods = () => {
    if (selectedCategories.length <= 1 || 
      (selectedCategories.length === 1 && selectedCategories.includes("All"))) {
    return null;
  }

  const grouped = {};
  selectedCategories.forEach(category => {
    const categoryFoods = filteredFood.filter(item => item.category === category);
    if (categoryFoods.length > 0) {
      grouped[category] = categoryFoods;
    }
  });

  return grouped;
};

  const groupedFoods = getGroupedFoods();

  return (
    <div className="category-explorer">
      {/* Header Section - FĂRĂ CLASA CONDITIONALĂ */}
      <div className="category-explorer__header">
        <div className="category-explorer__header-top">
         <button className="back-button" onClick={() => navigate(-1)}>
                  <FaArrowLeft />
                  <span>Back</span>
                </button>

          <div className="category-explorer__controls">
            <button
              className={`category-explorer__view-btn ${
                viewMode === "single"
                  ? "category-explorer__view-btn--active"
                  : ""
              }`}
              onClick={() => toggleViewMode("single")}
              aria-label="Single column view"
            >
              <FaList />
            </button>
            <button
              className={`category-explorer__view-btn ${
                viewMode === "double"
                  ? "category-explorer__view-btn--active"
                  : ""
              }`}
              onClick={() => toggleViewMode("double")}
              aria-label="Double column view"
            >
              <FaTh />
            </button>
            <button
              className="category-explorer__filter-btn"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Filter categories"
            >
              <FaFilter />
              {activeFilterCount > 0 && (
                <span className="category-explorer__filter-badge">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="category-explorer__search-section">
          <div className="category-explorer__search-container">
            <div
              className={`category-explorer__search-wrapper ${
                isSearchFocused
                  ? "category-explorer__search-wrapper--focused"
                  : ""
              }`}
            >
              <div className="category-explorer__search-input-container">
                <div className="category-explorer__search-icon">
                  <FaSearch />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="category-explorer__search-input"
                  placeholder="Search dishes, ingredients, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (searchQuery.length > 0) setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setIsSearchFocused(false), 200);
                  }}
                />
                <div className="category-explorer__search-actions">
                  {searchQuery && (
                    <button
                      className="category-explorer__clear-search"
                      onClick={clearSearch}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Search Suggestions */}
            <AnimatePresence>
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  className="category-explorer__search-suggestions"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {searchSuggestions.map((item) => (
                    <div
                      key={item._id}
                      className="category-explorer__suggestion-item"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      <img
                        src={url + "/images/" + item.image}
                        alt={item.name}
                        className="category-explorer__suggestion-image"
                      />
                      <div className="category-explorer__suggestion-content">
                        <div className="category-explorer__suggestion-name">
                          {item.name}
                        </div>
                        <div className="category-explorer__suggestion-meta">
                          <div className="category-explorer__suggestion-price">
                            {item.price} €
                          </div>
                          <div className="category-explorer__suggestion-category">
                            {item.category}
                          </div>
                        </div>
                        {item.description && (
                          <div className="category-explorer__suggestion-desc">
                            {item.description.substring(0, 60)}...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Horizontal Categories Scroll - FĂRĂ CLASA CONDITIONALĂ */}
      <div className="category-explorer__mobile-categories-scroll">
        <div className="category-explorer__mobile-categories-container">
          {categories
            .sort((a, b) => {
              // "All" este mereu primul
              if (a === "All") return -1;
              if (b === "All") return 1;
              // Restul în ordine alfabetică
              return a.localeCompare(b);
            })
            .map((cat) => (
              <button
                key={cat}
                className={`category-explorer__mobile-category-btn ${
                  selectedCategories.includes(cat) 
                    ? "category-explorer__mobile-category-btn--active" 
                    : ""
                } ${
                  categoryName === cat 
                    ? "category-explorer__mobile-category-btn--current" 
                    : ""
                }`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
                <span className="category-explorer__mobile-category-count">
                  {cat === "All" 
                    ? food_list.length 
                    : food_list.filter((item) => item.category === cat).length
                  }
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="category-explorer__main">
        {/* Filter Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="category-explorer__sidebar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="category-explorer__sidebar-header">
                <h3>Filters</h3>
                <div className="category-explorer__sidebar-actions">
                  <button
                    className="category-explorer__clear-filters"
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </button>
                  <button
                    className="category-explorer__sidebar-close"
                    onClick={() => setShowFilters(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {/* Sort Options */}
              <div className="category-explorer__filter-section">
                <h4 className="category-explorer__filter-title">Sort By</h4>
                <div className="category-explorer__sort-options">
                  <button
                    className={`category-explorer__sort-option ${
                      sortBy === "name"
                        ? "category-explorer__sort-option--active"
                        : ""
                    }`}
                    onClick={() => setSortBy("name")}
                  >
                    Name A-Z
                  </button>
                  <button
                    className={`category-explorer__sort-option ${
                      sortBy === "price-low"
                        ? "category-explorer__sort-option--active"
                        : ""
                    }`}
                    onClick={() => setSortBy("price-low")}
                  >
                    Price: Low to High
                  </button>
                  <button
                    className={`category-explorer__sort-option ${
                      sortBy === "price-high"
                        ? "category-explorer__sort-option--active"
                        : ""
                    }`}
                    onClick={() => setSortBy("price-high")}
                  >
                    Price: High to Low
                  </button>
                </div>
              </div>

              {/* Price Range */}
              <div className="category-explorer__filter-section">
                <h4 className="category-explorer__filter-title">
                  Price Range: {priceRange[0]}€ - {priceRange[1]}€
                </h4>
                <div 
                  className="category-explorer__price-range"
                  style={{
                    "--range-min": `${(priceRange[0] / Math.ceil(Math.max(...food_list.map(item => item.price)))) * 100}%`,
                    "--range-max": `${(priceRange[1] / Math.ceil(Math.max(...food_list.map(item => item.price)))) * 100}%`
                  }}
                >
                  <input
                    type="range"
                    min="0"
                    max={Math.ceil(Math.max(...food_list.map(item => item.price)))}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="category-explorer__range-input"
                  />
                  <input
                    type="range"
                    min="0"
                    max={Math.ceil(Math.max(...food_list.map(item => item.price)))}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="category-explorer__range-input"
                  />
                </div>
                <div className="category-explorer__price-labels">
                  <span>0€</span>
                  <span>
                    {Math.ceil(Math.max(...food_list.map(item => item.price)))}€
                  </span>
                </div>
              </div>

              {/* Dietary Filters */}
              <div className="category-explorer__filter-section">
                <h4 className="category-explorer__filter-title">
                  Dietary & Features
                </h4>
                <div className="category-explorer__dietary-filters">
                  <button
                    className={`category-explorer__dietary-filter ${
                      dietaryFilters.vegan
                        ? "category-explorer__dietary-filter--active"
                        : ""
                    }`}
                    onClick={() => handleDietaryFilter("vegan")}
                  >
                    <FaLeaf />
                    Vegan
                  </button>
                  <button
                    className={`category-explorer__dietary-filter ${
                      dietaryFilters.bestSeller
                        ? "category-explorer__dietary-filter--active"
                        : ""
                    }`}
                    onClick={() => handleDietaryFilter("bestSeller")}
                  >
                    <FaFire />
                    Best Seller
                  </button>
                  <button
                    className={`category-explorer__dietary-filter ${
                      dietaryFilters.new
                        ? "category-explorer__dietary-filter--active"
                        : ""
                    }`}
                    onClick={() => handleDietaryFilter("new")}
                  >
                    <FaStar />
                    New Items
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="category-explorer__filter-section">
                <h4 className="category-explorer__filter-title">Categories</h4>
                <div className="category-explorer__category-filters">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`category-explorer__category-filter ${
                        selectedCategories.includes(cat)
                          ? "category-explorer__category-filter--active"
                          : ""
                      }`}
                      onClick={() => handleCategoryFilter(cat)}
                    >
                      {cat}
                      <span className="category-explorer__category-count">
                        {cat === "All"
                          ? food_list.length
                          : food_list.filter((item) => item.category === cat)
                              .length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Food Grid */}
        <div
          className={`category-explorer__content ${
            showFilters ? "category-explorer__content--with-sidebar" : ""
          }`}
        >
          {filteredFood.length > 0 ? (
            <div className="category-explorer__food-container">
              {/* Dacă sunt selectate mai multe categorii, grupează rezultatele */}
              {groupedFoods ? (
                // Grupează pe categorii
                <div className="category-explorer__food-grid-grouped">
                  {Object.entries(groupedFoods).map(([category, categoryFoods]) => (
                    <div key={category} className="category-explorer__category-group">
                      {/* Titlul categoriei */}
                      <div className="category-explorer__food-header">
                        <h2 className="category-explorer__grid-title">
                          {category} ({categoryFoods.length} {categoryFoods.length === 1 ? 'item' : 'items'})
                        </h2>
                      </div>
                      
                      {/* Grid-ul pentru categoria curentă */}
                      <div
                        className={`category-explorer__food-subgrid category-explorer__food-subgrid--${viewMode}`}
                      >
                        <motion.div
                          layout
                          className="category-explorer__food-grid"
                          transition={{
                            duration: 0.3,
                            ease: "easeInOut",
                          }}
                        >
                          {categoryFoods.map((item) => (
                            <motion.div
                              key={item._id}
                              layout
                              className={`category-explorer__food-item category-explorer__food-item--${viewMode}`}
                              transition={{ duration: 0.2 }}
                            >
                              <FoodItemCategory
                                id={item._id}
                                name={item.name}
                                description={item.description}
                                price={item.price}
                                image={item.image}
                                isBestSeller={item.isBestSeller}
                                isNewAdded={item.isNewAdded}
                                isVegan={item.isVegan}
                                category={item.category}
                                onClick={() => openModal(item)}
                                viewMode={viewMode}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Afișare normală (o singură categorie sau toate)
                <>
                  <div className="category-explorer__food-header">
                    <h2 className="category-explorer__grid-title">
                      {searchQuery
                        ? `Search Results for "${searchQuery}" (${filteredFood.length})`
                        : `${categoryName} (${filteredFood.length} items)`}
                    </h2>
                    {activeFilterCount > 0 && (
                      <div className="category-explorer__active-filters">
                        <span>Active filters: {activeFilterCount}</span>
                      </div>
                    )}
                  </div>

                  <div
                    className={`category-explorer__food-container category-explorer__food-container--${viewMode}`}
                  >
                    <motion.div
                      layout
                      className="category-explorer__food-grid"
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                    >
                      {filteredFood.map((item) => (
                        <motion.div
                          key={item._id}
                          layout
                          className={`category-explorer__food-item category-explorer__food-item--${viewMode}`}
                          transition={{ duration: 0.2 }}
                        >
                          <FoodItemCategory
                            id={item._id}
                            name={item.name}
                            description={item.description}
                            price={item.price}
                            image={item.image}
                            isBestSeller={item.isBestSeller}
                            isNewAdded={item.isNewAdded}
                            isVegan={item.isVegan}
                            category={item.category}
                            onClick={() => openModal(item)}
                            viewMode={viewMode}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="category-explorer__no-results">
              <div className="category-explorer__no-results-icon">🍕</div>
              <h3 className="category-explorer__no-results-title">
                No items found
              </h3>
              <p className="category-explorer__no-results-message">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : `No items in ${categoryName} category`}
              </p>
              {(searchQuery || activeFilterCount > 0) && (
                <button
                  className="category-explorer__no-results-action"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Floating Cart Circle - ACELAȘI DESIGN CA ÎN FOODDISPLAY */}
      {shouldRender && (
        <div
          className={`floating-cart-circle ${isVisible ? "visible" : ""}`}
          onClick={() => {
            navigate("/cart");
            window.scrollTo(0, 0);
          }}
          onMouseEnter={showFloatingButton}
        >
          <div className="cart-circle-content">
            <FaShoppingBag className="cart-icon" />
            <span className="cart-count-badge">{cartItemCount}</span>
          </div>
          <div className="cart-total-price">
            {getTotalCartAmount().toFixed(2)} €
          </div>
          <div className="cart-pulse-effect"></div>
        </div>
      )}

      {/* Food Modal */}
      {isModalOpen && selectedFood && (
        <FoodModal
          food={selectedFood}
          closeModal={closeModal}
          isOpen={isModalOpen}
        />
      )}
    </div>
  );
};

export default CategoryPage;