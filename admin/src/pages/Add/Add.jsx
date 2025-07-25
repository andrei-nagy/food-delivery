import React, { useState } from 'react'
import './Add.css'
import { assets } from '../../assets/assets'
import axios from "axios"
import { toast } from 'react-toastify'
import { useEffect } from 'react'

const Add = ({ url }) => {

    const [image, setImage] = useState(false);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Salad"
    })

    const [list, setList] = useState([]);

    const getCategoryList = async () => {
        try {
            const response = await axios.get(`${url}/api/categories/listcategory`);
            console.log(response.data);
            if (response.data.success) {
                setList(response.data.data);  // Setăm lista de categorii
            } else {
                toast.error("Error");
            }
        } catch (error) {
            console.error("Error fetching categories", error);
            toast.error("Error fetching categories");
        }
    };

    useEffect(() => {
        getCategoryList();
    }, [])

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }
  // New onBlur handler for price
  const onPriceBlur = () => {
    const numericValue = parseFloat(data.price);
    if (!isNaN(numericValue)) {
        const roundedValue = numericValue.toFixed(2);
        setData((data) => ({ ...data, price: roundedValue }));
    }
};

    const onSubminHandler = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", Number(data.price));
        formData.append("category", data.category);
        formData.append("image", image);
        const response = await axios.post(`${url}/api/food/add`, formData);

        if (response.data.success) {
            setData({
                name: "",
                description: "",
                price: "",
                category: "Salad"
            })
            setImage(false);
            toast.success(response.data.message)
        } else {
            toast.error(response.data.message)
        }
    }

    return (
        <div className='add'>
            <form className='flex-col' onSubmit={onSubminHandler}>
                <div className="add-img-upload flex-col">
                    <p>Upload Image</p>
                    <label htmlFor="image">
                        <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                    </label>
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden required />
                </div>
                <div className="add-product-name flex-col">
                    <p>Product Name</p>
                    <input onChange={onChangeHandler} value={data.name} type="text" name="name" placeholder='Type here' />
                </div>
                <div className="add-product-description flex-col">
                    <p>Product Description</p>
                    <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder='Write content here' required></textarea>
                </div>
                <div className="add-category-price">
                    <div className="add-category flex-col">
                        <p>Product Category</p>
                        <select onChange={onChangeHandler} value={data.category} name="category">
                            <option value="" disabled>Select a category</option>
                            {list.map((category) => (
                                <option key={category._id} value={category.menu_name}>
                                    {category.menu_name}
                                </option>
                                ))}
                        </select>
                    </div>
                    <div className="add-price flex-col">
                        <p>Product Price</p>
                        <input onChange={onChangeHandler}  onBlur={onPriceBlur} value={data.price} type="number" name="price" placeholder='$20' />
                    </div>
                </div>
                <button type='submit' className='add-btn'>Add product</button>
            </form>
        </div>
    )
}

export default Add