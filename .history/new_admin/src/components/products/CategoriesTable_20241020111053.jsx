import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CategoriesTable = () => {
    const [products, setProducts] = useState([]);
    const url = "http://localhost:4000";

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${url}/api/categories/listcategory`);
            if (response.data.success && Array.isArray(response.data.data)) {
                setProducts(response.data.data);
            } else {
                console.error("Response structure is not as expected:", response.data);
                setProducts([]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const removeFoodCategory = async (foodId) => {
        const response = await axios.post(`${url}/api/categories/remove`, { id: foodId });
        await fetchProducts();

        if (response.data.success) {
            toast.success(response.data.message);
        } else {
            toast.error(response.data.message);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='list add flex-col'>
                <p className='text-xl font-semibold text-gray-100 mb-4'>All Food Categories List</p>
                <div className="list-table">
                    <div className="list-table-format title">
                        <b>Image</b>
                        <b>Menu Name</b>
                        <b>Description</b>
                        <b>Action</b>
                    </div>
                    {products.map((item) => (
                        <div key={item._id} className='list-table-format'>
                            <img src={`${url}/images/` + item.image} alt="" className='w-16 h-16 rounded' />
                            <p className='text-gray-300'>{item.menu_name}</p>
                            <p className='text-gray-300'>{item.description}</p>
                            <p onClick={() => removeFoodCategory(item._id)} className='cursor-pointer text-red-400 hover:text-red-300'>X</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default CategoriesTable;
