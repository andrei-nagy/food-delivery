import SearchBar from '../SearchBar/SearchBar'; 

const CategoryPage = () => {
  const { categoryName } = useParams();
  const { food_list, addToCart } = useContext(StoreContext);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredByCategory = categoryName === 'All'
    ? food_list
    : food_list.filter(item => item.category === categoryName);

  const filteredFood = filteredByCategory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="category-page">
      <button onClick={() => navigate('/')} aria-label="Go back" ... > 
        <FaArrowLeft /> Back
      </button>

      <nav className="category-menu" ...>...</nav>

      <SearchBar query={searchQuery} setQuery={setSearchQuery} />

      {filteredFood.length > 0 ? (
        <div className="food-list">
          {filteredFood.map(item => (
            <FoodItemCategory
              key={item._id}
              id={item._id}
              name={item.name}
              price={item.price}
              description={item.description}
              image={item.image}
              onClick={() => openModal(item)}
            />
          ))}
        </div>
      ) : (
        <p>No items found for this category.</p>
      )}
    </div>
  );
};
