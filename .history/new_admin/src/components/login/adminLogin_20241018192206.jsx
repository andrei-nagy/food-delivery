import React, { useState } from "react";
import { AiOutlineTwitter } from "react-icons/ai";
import { BiLogoFacebook } from "react-icons/bi";
import axios from "axios"; // Asigură-te că ai axios instalat
import { toast } from "react-toastify"; // Asigură-te că ai toastify instalat
import { useNavigate } from "react-router-dom"; // Importă useNavigate

const Login = () => {
  const [isRegister, setIsRegister] = useState(false); // State pentru a gestiona dacă este în mod de înregistrare
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityToken, setSecurityToken] = useState("");
  const url = "http://localhost:4000"; // Adresa API
  const navigate = useNavigate(); // Hook pentru navigare

  // Funcția pentru a gestiona submit-ul formularului
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      // Înregistrare
      try {
        const response = await axios.post(`${url}/admin/register`, { email, password, securityToken });
        if (response.data.success) {
          toast.success("Account created successfully");
          navigate('/'); // Redirect to main page
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error("An error occurred while registering");
      }
    } else {
      // Login
      try {
        const response = await axios.post(`${url}/admin/login`, { email, password });
        if (response.data.success) {
          localStorage.setItem('authToken', response.data.token); // Salvează token-ul
          toast.success("Login successful");
          navigate('/'); // Redirect la pagina principală
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error("An error occurred while logging in");
      }
    }
  };

  return (
    <section className="h-screen flex flex-col md:flex-row justify-center space-y-10 md:space-y-0 md:space-x-16 items-center my-2 mx-5 md:mx-0 md:my-0">
      <div className="md:w-1/3 max-w-sm">
        <img
          src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
          alt="Sample image"
        />
      </div>
      <div className="md:w-1/3 max-w-sm">
        <div className="text-center md:text-left">
          <label className="mr-1">Sign in with</label>
          <button
            type="button"
            className="mx-1 h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_9px_-4px_#3b71ca]"
          >
            <BiLogoFacebook
              size={20}
              className="flex justify-center items-center w-full"
            />
          </button>
          <button
            type="button"
            className="inline-block mx-1 h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca]"
          >
            <AiOutlineTwitter
              size={20}
              className="flex justify-center items-center w-full"
            />
          </button>
        </div>
        <div className="my-5 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
          <p className="mx-4 mb-0 text-center font-semibold text-slate-500">
            Or
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            className="text-sm w-full px-4 py-2 border border-solid border-gray-300 rounded text-black" // Adaugă text-black
            type="text"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="text-sm w-full px-4 py-2 border border-solid border-gray-300 rounded mt-4 text-black" // Adaugă text-black
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isRegister && (
            <input
              className="text-sm w-full px-4 py-2 border border-solid border-gray-300 rounded mt-4 text-black" // Adaugă text-black
              type="text"
              placeholder="Security Token"
              value={securityToken}
              onChange={(e) => setSecurityToken(e.target.value)}
            />
          )}
          <div className="mt-4 flex justify-between font-semibold text-sm">
            <label className="flex text-slate-500 hover:text-slate-600 cursor-pointer">
              <input className="mr-1" type="checkbox" />
              <span>Remember Me</span>
            </label>
            <a
              className="text-blue-600 hover:text-blue-700 hover:underline hover:underline-offset-4"
              href="#"
            >
              Forgot Password?
            </a>
          </div>
          <div className="text-center md:text-left">
            <button
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white uppercase rounded text-xs tracking-wider"
              type="submit"
            >
              {isRegister ? "Register" : "Login"}
            </button>
          </div>
        </form>
        <div className="mt-4 font-semibold text-sm text-slate-500 text-center md:text-left">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <button 
                onClick={() => setIsRegister(false)}
                className="text-blue-600 hover:underline hover:underline-offset-4"
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button 
                onClick={() => setIsRegister(true)}
                className="text-red-600 hover:underline hover:underline-offset-4"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Login;
