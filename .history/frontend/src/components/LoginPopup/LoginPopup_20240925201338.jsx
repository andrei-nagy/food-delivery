import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'

const LoginPopup = ({ setShowLogin }) => {

    const {url} = useContext(StoreContext);

    const [currState, setCurrState] = useState("Login")
    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (event) => {
            event.preventDefault();

    }

    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className='login-popup-container' >
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {currState === 'Login' ? <></> : <input onChange={onChangeHandler} value={data.name} name="name" type="text" placeholder='Your Name' required />}
                    <input onChange={onChangeHandler} value={data.email} name="email" type="email" placeholder='Your Email' required />
                    <input onChange={onChangeHandler} value={data.password} name="password" type="password" placeholder='Password' required />
                </div>
                <button type='submit'>{currState === 'Sign Up' ? "Create account" : "Login"}</button>
                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, I agree to the terms of use & privacy policy</p>
                </div>
                {currState === 'Login'
                    ? <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
                    : <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>}
            </form>
        </div>

    )
}

export default LoginPopup