import React, { useState } from 'react';
import './Customization.css';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddCustomization = ({ url }) => {
    const [image, setImage] = useState(null); // Aici se va salva fișierul imagine
    const [data, setData] = useState({
        restaurantId: '', // ID-ul restaurantului
        restaurantName: '',
        primaryColor: '#ffffff', // Valoarea implicită
        secondaryColor: '#000000', // Valoarea implicită
        slogan: '',
        contactEmail: '',
        contactPhone: '',
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData((prevData) => ({ ...prevData, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('restaurantId', data.restaurantId);
        formData.append('restaurantName', data.restaurantName);
        formData.append('image', image);
        formData.append('primaryColor', data.primaryColor);
        formData.append('secondaryColor', data.secondaryColor);
        formData.append('slogan', data.slogan);
        formData.append('contactEmail', data.contactEmail);
        formData.append('contactPhone', data.contactPhone);

        try {
            const response = await axios.post(`${url}/admin/personalization/add`, formData);
            if (response.data.success) {
                setData({
                    restaurantId: '',
                    restaurantName: '',
                    primaryColor: '#ffffff',
                    secondaryColor: '#000000',
                    slogan: '',
                    contactEmail: '',
                    contactPhone: '',
                });
                setImage(null);
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error adding customization:', error);
            toast.error('Failed to add customization.');
        }
    };

    return (
        <div className='add'>
            <form className='flex-col' onSubmit={onSubmitHandler}>
                <div className="add-img-upload flex-col">
                    <p>Upload Image Category</p>
                    <label htmlFor="image">
                        <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                    </label>
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden required />
                </div>
                <div className="add-product-name flex-col">
                    <p>Restaurant Name</p>
                    <input onChange={onChangeHandler} value={data.restaurantName} type="text" name="restaurantName" placeholder='Type here' required />
                </div>
                <div className="add-product-description flex-col">
                    <p>Slogan</p>
                    <input onChange={onChangeHandler} value={data.slogan} type="text" name="slogan" placeholder='Write slogan here' />
                </div>
                <div className="add-product-contact flex-col">
                    <p>Contact Email</p>
                    <input onChange={onChangeHandler} value={data.contactEmail} type="email" name="contactEmail" placeholder='Type your email here' />
                    <p>Contact Phone</p>
                    <input onChange={onChangeHandler} value={data.contactPhone} type="text" name="contactPhone" placeholder='Type your phone here' />
                </div>
                <div className="add-product-colors flex-col">
                    <p>Primary Color</p>
                    <input type="color" name="primaryColor" value={data.primaryColor} onChange={onChangeHandler} />
                    <p>Secondary Color</p>
                    <input type="color" name="secondaryColor" value={data.secondaryColor} onChange={onChangeHandler} />
                </div>
                <button type='submit' className='add-btn'>Add Customization</button>
            </form>
        </div>
    );
};

export default AddCustomization;
