import React, { useContext, useState, useEffect } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';  // pentru redirecționare

const LoginPopup = ({ setShowLogin }) => {
    const { url, setToken } = useContext(StoreContext);
    const navigate = useNavigate(); // pentru redirecționare

    const [currState, setCurrState] = useState("Login");
    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    });

    // Funcție pentru a extrage parametrii din URL
    const getQueryParam = (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    };

    // useEffect pentru a verifica dacă există tableNumber în URL și a face login automat
    useEffect(() => {
        const tableNumber = getQueryParam('table');
        if (tableNumber) {
            // autoLogin(tableNumber);
            autoRegister(tableNumber);
            localStorage.setItem('tableNumber', tableNumber);
        }
    }, []); // efectul se execută o singură dată la montarea componentei


    // Funcție pentru login automat
    const autoLogin = async (tableNumber) => {
        try {
            const response = await axios.get(`${url}/api/user/login?tableNumber=${tableNumber}`);
            if (response.data.success) {
                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);
                toast.success("Welcome!");  // mesaj de succes
                navigate('/');  // redirecționare la pagina principală
            } else {
                alert(response.data.message);
                if (response.data.code === "MAX_SESSIONS") {
                    navigate('/welcome');
                }
            }
        } catch (error) {
            console.error("Eroare la login automat:", error);
            // alert("Eroare la login automat.");
        }
    };


    // Funcție pentru login automat
    const autoRegister = async (tableNumber) => {
        try {
            const response = await axios.post(`${url}/api/user/register?tableNumber=${tableNumber}`);
            if (response.data.success) {
                const { token, userId } = response.data; // Extragem token-ul și userId-ul din răspuns

                setToken(token);
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("userId", userId); // Setăm userId-ul în localStorage

                toast.success("Welcome!");  // mesaj de succes
                navigate('/');  // redirecționare la pagina principală
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("Eroare la register automat:", error);
            // alert("Eroare la register automat.");
        }
    };
    // Gestionare modificări în inputuri
    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };

    // Funcție pentru login/register manual
    const onLogin = async (event) => {
        event.preventDefault();
        let newUrl = url;
        if (currState === "Login") {
            newUrl += "/api/user/login";
        } else {
            newUrl += "/api/user/register";
        }

        const response = await axios.post(newUrl, data);

        if (response.data.success) {
            setToken(response.data.token);
            localStorage.setItem("token", response.data.token);
            setShowLogin(false);
            toast.success("Bun venit, " + data.name + '.');
        } else {
            alert(response.data.message);
        }
    };

    // return (
    //     <div className='login-popup'>
    //         <form onSubmit={onLogin} className='login-popup-container'>
    //             <div className="login-popup-title">
    //                 <h2>{currState}</h2>
    //                 <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
    //             </div>
    //             <div className="login-popup-inputs">
    //                 {currState === 'Login' ? <></> : <input onChange={onChangeHandler} value={data.name} name="name" type="text" placeholder='Your Name' required />}
    //                 <input onChange={onChangeHandler} value={data.email} name="email" type="email" placeholder='Your Email' required />
    //                 <input onChange={onChangeHandler} value={data.password} name="password" type="password" placeholder='Password' required />
    //             </div>
    //             <button type='submit'>{currState === 'Sign Up' ? "Create account" : "Login"}</button>
    //             <div className="login-popup-condition">
    //                 <input type="checkbox" required />
    //                 <p>By continuing, I agree to the terms of use & privacy policy</p>
    //             </div>
    //             {currState === 'Login'
    //                 ? <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
    //                 : <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>}
    //         </form>
    //     </div>
    // );
};

export default LoginPopup;
