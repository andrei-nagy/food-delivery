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

    // Funcție pentru a obține personalizarea existentă
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

        // Dacă există o imagine nouă, trimite fișierul selectat, altfel trimite imaginea existentă din DB
        console.log('data ' + data.image);
        console.log('image ' + image);
        if (image) {
            formData.append('image', image);
        } else if (data.image) {
            formData.append('image', data.image);  // Trimite numele imaginii existente
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
            
      
                const response = await axios.put(`${url}/admin/personalization/update`, formData);

                setData({
                    image: '',
                    restaurantName: '',
                    primaryColor: '#ffffff',
                    secondaryColor: '#000000',
                    slogan: '',
                    contactEmail: '',
                    contactPhone: '',
                });
                if(isExistingCustomization){
                    toast.success('Customization updated successfully!')
                } else {
                    toast.success('Customization added successfully!')
                }
             
                // setImage(null);
                toast.success(response.data.message);
                fetchCustomization(); // Reîmprospătează datele
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error adding/updating customization:', error);
            toast.error('Failed to add/update customization.');
        }
    };


    return(
        <div className="container">
          <div className="text-box column">
            <h1>WELCOME TO THE JUNGLE</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eget urna blandit, efficitur felis eget, imperdiet massa. Mauris egestas risus sed sodales facilisis. Donec vitae sapien rhoncus, laoreet velit vitae, tincidunt enim.</p>
           <div className="learn-more">
               <div className="play-icon">
                  <p>&#9654;</p>
                </div>
                <div className="text">
                  <p>Learn More</p>
                </div>
              </div>
            </div>
          <div className="login-box column">
    
            <form onSubmit={onSubmitHandler}>
              <div className="form-group">
                <label htmlFor="email-register">
                  <small>Email</small>
                  <input  name="email" placeholder="your@example.com" />
                  <small class="error"></small>
                </label>
              </div>
              <div className="form-group">
                <small>Username</small>
                <input  name="username" placeholder="Pick a Username" type="text"/>
                <small class="error"></small>
              </div>
              <div className="form-group">
                <small>Password</small>
                <input  name="password" placeholder="8-12 Characters" type="password"/>
                <small class="error"></small>
              </div>
              <div className="form-group">
                <button type="submit">Sign up</button>
              </div>
            </form>
            
          </div>
        </div>
      )
    // return (
    //     <div className='add'>
    //         <h1>Welcome to Orderly</h1>
    //         <p>Personalize your business.</p>
    //         <form className='flex-col' onSubmit={onSubmitHandler}>
    //             <div className="add-img-upload form-field flex-col">
    //                 <p>Upload Image Category</p>
    //                 <label htmlFor="image">
    //                     <img 
    //                         src={image ? URL.createObjectURL(image) : data.image ? `${url}/images/${data.image}` : assets.upload_area} 
    //                         alt="" 
    //                     />
    //                 </label>
    //                 <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden />
    //             </div>
    //             <div className="add-product-name form-field flex-col">
    //                 <p>Restaurant Name</p>
    //                 <input onChange={onChangeHandler} value={data.restaurantName} type="text" name="restaurantName" placeholder='Type here' required />
    //             </div>
    //             <div className="add-product-description form-field flex-col">
    //                 <p>Slogan</p>
    //                 <input onChange={onChangeHandler} value={data.slogan} type="text" name="slogan" placeholder='Write slogan here' />
    //             </div>
    //             <div className="add-product-contact form-field flex-col">
    //                 <p>Contact Email</p>
    //                 <input onChange={onChangeHandler} value={data.contactEmail} type="email" name="contactEmail" placeholder='Type your email here' />
    //                 <p>Contact Phone</p>
    //                 <input onChange={onChangeHandler} value={data.contactPhone} type="text" name="contactPhone" placeholder='Type your phone here' />
    //             </div>
    //             <div className="add-product-colors form-field flex-col">
    //                 <p>Primary Color</p>
    //                 <input type="color" name="primaryColor" value={data.primaryColor} onChange={onChangeHandler} />
    //                 <p>Secondary Color</p>
    //                 <input type="color" name="secondaryColor" value={data.secondaryColor} onChange={onChangeHandler} />
    //             </div>
    //             <button type='submit' className='add-btn'>
    //                 {isExistingCustomization ? 'Update Customization' : 'Add Customization'}
    //             </button>
    //         </form>
    //     </div>
    // );
    
    
};

export default Customization;