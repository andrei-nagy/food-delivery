import React, { useEffect, useState } from 'react';
import './Customization.css';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Customization = ({ url }) => {
    const [image, setImage] = useState(null);
    const [data, setData] = useState({
        image: '',
        restaurantName: '',
        primaryColor: '#ffffff',
        secondaryColor: '#000000',
        slogan: '',
        contactEmail: '',
        contactPhone: '',
    });
    const [isExistingCustomization, setIsExistingCustomization] = useState(false);

    // Function to fetch existing customization
    const fetchCustomization = async () => {
        try {
            const response = await axios.get(`${url}/admin/personalization/get`);
            if (response.data.success && response.data.data) {
                setData(response.data.data);
                setIsExistingCustomization(true);
            } else {
                setIsExistingCustomization(false);
            }
        } catch (error) {
            console.error('Error fetching customization data:', error);
        }
    };

    useEffect(() => {
        fetchCustomization();
    }, [url]);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData((prevData) => ({ ...prevData, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('restaurantName', data.restaurantName);

        if (image) {
            formData.append('image', image);
        } else if (data.image) {
            formData.append('image', data.image); // Send existing image name
        }
        formData.append('primaryColor', data.primaryColor);
        formData.append('secondaryColor', data.secondaryColor);
        formData.append('slogan', data.slogan);
        formData.append('contactEmail', data.contactEmail);
        formData.append('contactPhone', data.contactPhone);

        try {
            const response = isExistingCustomization
                ? await axios.put(`${url}/admin/personalization/update`, formData)
                : await axios.post(`${url}/admin/personalization/add`, formData);

            if (response.data.success) {
                setData({
                    image: '',
                    restaurantName: '',
                    primaryColor: '#ffffff',
                    secondaryColor: '#000000',
                    slogan: '',
                    contactEmail: '',
                    contactPhone: '',
                });
                if (isExistingCustomization) {
                    toast.success('Customization updated successfully!');
                } else {
                    toast.success('Customization added successfully!');
                }

                toast.success(response.data.message);
                fetchCustomization(); // Refresh data
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error adding/updating customization:', error);
            toast.error('Failed to add/update customization.');
        }
    };

    return (
        <div className='add-customization container'>
            <form className='row' onSubmit={onSubmitHandler}>
                <div className="add-img-upload-customization col-md-12 mb-4">
                    <p>Upload Image Category</p>
                    <label htmlFor="image" className="d-block">
                        <img 
                            src={image ? URL.createObjectURL(image) : data.image ? `${url}/images/${data.image}` : assets.upload_area} 
                            alt="" 
                            className="img-fluid border border-primary rounded" 
                        />
                    </label>
                    <input 
                        onChange={(e) => setImage(e.target.files[0])} 
                        type="file" 
                        id='image' 
                        hidden 
                    />
                </div>
                <div className="add-product-name col-md-6 mb-4">
                    <p>Restaurant Name</p>
                    <input 
                        onChange={onChangeHandler} 
                        value={data.restaurantName} 
                        type="text" 
                        name="restaurantName" 
                        placeholder='Type here' 
                        required 
                        className="form-control" 
                    />
                </div>
                <div className="add-product-description col-md-6 mb-4">
                    <p>Slogan</p>
                    <input 
                        onChange={onChangeHandler} 
                        value={data.slogan} 
                        type="text" 
                        name="slogan" 
                        placeholder='Write slogan here' 
                        className="form-control" 
                    />
                </div>
                <div className="add-product-contact col-md-6 mb-4">
                    <p>Contact Email</p>
                    <input 
                        onChange={onChangeHandler} 
                        value={data.contactEmail} 
                        type="email" 
                        name="contactEmail" 
                        placeholder='Type your email here' 
                        className="form-control" 
                    />
                </div>
                <div className="add-product-contact col-md-6 mb-4">
                    <p>Contact Phone</p>
                    <input 
                        onChange={onChangeHandler} 
                        value={data.contactPhone} 
                        type="text" 
                        name="contactPhone" 
                        placeholder='Type your phone here' 
                        className="form-control" 
                    />
                </div>
                <div className="add-product-colors col-md-6 mb-4">
                    <p>Primary Color</p>
                    <input 
                        type="color" 
                        name="primaryColor" 
                        value={data.primaryColor} 
                        onChange={onChangeHandler} 
                        className="form-control" 
                    />
                </div>
                <div className="add-product-colors col-md-6 mb-4">
                    <p>Secondary Color</p>
                    <input 
                        type="color" 
                        name="secondaryColor" 
                        value={data.secondaryColor} 
                        onChange={onChangeHandler} 
                        className="form-control" 
                    />
                </div>
                <div className="col-md-12 mb-4">
                    <button type='submit' className='btn btn-primary'>
                        {isExistingCustomization ? 'Update Customization' : 'Add Customization'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Customization;
