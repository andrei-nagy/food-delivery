import React, { useState } from "react";
import { AiOutlineTwitter } from "react-icons/ai";
import { BiLogoFacebook } from "react-icons/bi";
import axios from "axios"; // Asigură-te că ai axios instalat
import { toast, ToastContainer } from "react-toastify"; // Asigură-te că ai toastify instalat
import { useNavigate } from "react-router-dom"; // Importă useNavigate
import { assets } from "../../../../frontend/src/assets/assets";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false); // State pentru a gestiona dacă este în mod de înregistrare
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("");
  const [securityToken, setSecurityToken] = useState(""); // Adăugat pentru security token
  const url = "https://api.orderly-app.com"; // Adresa API
  const navigate = useNavigate(); // Hook pentru navigare
  const [notification, setNotification] = useState(""); // State pentru notificări

  // Funcția pentru a gestiona submit-ul formularului
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      // Înregistrare
      handleRegister(e); // Apelează funcția de înregistrare
    } else {
      // Login
      handleLogin(e); // Apelează funcția de login
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${url}/admin/login`, { email, password });
      if (response.data.success) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userRole", response.data.userRole); 
        localStorage.setItem("userName", response.data.userName); 
        toast.success("Login successful!"); // Notificare de succes
        navigate("/"); // Redirect la pagina principală
      } else {
        setNotification(response.data.message); // Setează mesajul de notificare
        toast.error(response.data.message); // Notificare de eroare
      }
    } catch (error) {
      setNotification("An error occurred while logging in"); // Setează mesajul de notificare
      toast.error("Login failed! User may not exist."); // Notificare de eroare
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (securityToken !== "123456789") {
      setNotification("Invalid Security Token"); // Setează mesajul de notificare
      toast.error("Invalid Security Token!"); // Notificare de eroare
      return;
    }

    try {
      const response = await axios.post(`${url}/admin/register`, { name, email, password, securityToken, userRole });
      if (response.data.success) {
        toast.success("Account created successfully!"); // Notificare de succes
        navigate("/"); // Redirect to main page
      } else {
        setNotification(response.data.message); // Setează mesajul de notificare
        toast.error(response.data.message); // Notificare de eroare
      }
    } catch (error) {
      setNotification("An error occurred while registering"); // Setează mesajul de notificare
      toast.error("Registration failed! Please try again."); // Notificare de eroare
    }
  };

  return (

    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div>
            <img
              src={assets.original_logo}
              className="w-32 mx-auto"
              alt="Logo"
            />
            <p className="leading-none px-2 text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2 text-center">
              Streamline Your Management, Maximize Your Impact
            </p>
          </div>
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold mb-5">{isRegister ? "Register" : "Sign Up"}</h1>
            <div className="w-full flex-1 mt-8">
              <div className="mx-auto max-w-xs">
                <form onSubmit={handleSubmit}>
                  <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  {isRegister && (
                    <>
                      <input
                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <input
                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                        type="text"
                        placeholder="Security Token"
                        value={securityToken}
                        onChange={(e) => setSecurityToken(e.target.value)}
                      />

                      <select
                        className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value)}
                      >
                        <option value="" disabled>Select role</option>
                        <option value="Waiter">Waiter</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </>
                  )}


                  <button
                    className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                    type="submit"
                  >
                    <svg className="w-6 h-6 -ml-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <path d="M20 8v6M23 11h-6" />
                    </svg>
                    <span className="ml-3">{isRegister ? "Register" : "Sign Up"}</span>
                  </button>

                  <div className="my-12 border-b text-center">
                    <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                      {isRegister ? "Already have an account?" : "Don't have an account?"}
                    </div>
                  </div>

                  <button
                    className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                  >
                    <svg className="w-6 h-6 -ml-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <path d="M20 8v6M23 11h-6" />
                    </svg>
                    <span className="ml-3">{isRegister ? "Sign In" : "Register"}</span>
                  </button>

                </form>

                <p className="mt-6 text-xs text-gray-600 text-center">
                  I agree to abide by Orderly's
                  <a href="#" className="border-b border-gray-500 border-dotted">
                    Terms of Service
                  </a>
                  and its
                  <a href="#" className="border-b border-gray-500 border-dotted">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
