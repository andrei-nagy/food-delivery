import React from 'react'
import './AddCategory.css'
import { useState } from 'react'
import { assets } from '../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const AddCategory = ({url}) => {

    const [image, setImage] = useState(false)
    const [data, setData] = useState({
        menu_name: "",
        description: "",
    })

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

   const onSubminHandler = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("menu_name", data.menu_name);
        formData.append("description", data.description);
        formData.append("image", image);
        const response = await axios.post(`${url}/api/categories/addcategory`, formData);

        if(response.data.success){
            setData({
                menu_name: "",
                description: ""
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
                    <p>Upload Image Category</p>
                    <label htmlFor="image">
                        <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                    </label>
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden required />
                </div>
                <div className="add-product-name flex-col">
                    <p>Category Name</p>
                    <input onChange={onChangeHandler} value={data.name} type="text" name="menu_name" placeholder='Type here' />
                </div>
                <div className="add-product-description flex-col">
                    <p>Category Description</p>
                    <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder='Write content here' required></textarea>
                </div>
            
                <button type='submit' className='add-btn'>Add Category</button>
            </form>
        </div>
    )
}

export default AddCategory