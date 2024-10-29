import { useState } from "react";
import routesConstants from "../constants/routeConstants";
import { Link } from "react-router-dom";
import { Icons } from "../assets/icons";
import { IoMdClose } from "react-icons/io";
import { MdMenu } from "react-icons/md";

const Header = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  return (
    <div className="container mx-auto flex flex-col">
      <div className="group relative flex w-full shrink-0 flex-wrap items-center justify-between bg-white py-7">
        <div>
          <img className="h-25" src={Icons.original_logo} alt="Logo" />
        </div>
        <div className={`hidden items-center justify-between gap-12 text-black md:flex ${isNavbarOpen ? 'block' : 'hidden'}`}>
          <Link to={routesConstants.product} className="text-sm font-medium text-dark-grey-900">
            Product
          </Link>
          <Link to={routesConstants.features} className="text-sm font-medium text-dark-grey-900">
            Features
          </Link>
          <Link to={routesConstants.pricing} className="text-sm font-medium text-dark-grey-900">
            Pricing
          </Link>
          <Link to={routesConstants.company} className="text-sm font-medium text-dark-grey-900">
            Company
          </Link>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <button className="flex items-center text-sm font-medium text-black">Log In</button>
          <button className="flex items-center rounded-xl bg-purple-blue-100 px-4 py-2 text-sm font-medium text-purple-blue-600 transition hover:bg-opacity-80 focus:bg-opacity-70">
            Sign Up
          </button>
        </div>
        <button onClick={toggleNavbar} className="flex md:hidden">
          {isNavbarOpen ? <IoMdClose size={24} /> : <MdMenu size={24} />}
        </button>
        <div className={`absolute top-full flex max-h-0 w-full flex-col items-start justify-center gap-3 overflow-hidden rounded-2xl bg-white px-4 shadow-main transition-all duration-300 ease-in-out ${isNavbarOpen ? 'max-h-64 py-4' : ''}`}>
          <Link to={routesConstants.product} className="text-sm font-medium text-dark-grey-900">
            Product
          </Link>
          <Link to={routesConstants.features} className="text-sm font-medium text-dark-grey-900">
            Features
          </Link>
          <Link to={routesConstants.pricing} className="text-sm font-medium text-dark-grey-900">
            Pricing
          </Link>
          <Link to={routesConstants.company} className="text-sm font-medium text-dark-grey-900">
            Company
          </Link>
          <button className="flex items-center text-sm font-medium text-black">Log In</button>
          <button className="flex items-center rounded-xl bg-purple-blue-100 px-4 py-2 text-sm font-medium text-purple-blue-600 transition hover:bg-opacity-80 focus:bg-opacity-70">
            Sign Up
          </button>
        </div>
      </div>
      <div className="my-auto mb-8 mt-12 w-full grid-cols-1 justify-center md:flex md:gap-5 lg:grid lg:grid-cols-2">
        <div className="col-span-1 flex flex-col justify-center text-center md:w-3/5 lg:w-full lg:justify-center lg:text-left">
          <div className="mb-4 flex items-center justify-center lg:justify-start">
            <img className="h-5" src="../../img/logos/logo-1.png" alt="logo" />
            <h4 className="ml-2 text-sm font-bold tracking-widest text-primary">
              TRENDIEST TAILWIND TEMPLATES
            </h4>
          </div>
          <h1 className="mb-8 text-4xl font-extrabold leading-tight text-dark-grey-900 lg:text-5xl xl:w-11/12 xl:text-6xl">
            Take your website to the next level with Horizon UI
          </h1>
          <p className="mb-10 text-base font-medium leading-7 text-dark-grey-600 xl:w-3/4">
            Save hundreds of hours trying to create and develop a dashboard from scratch. The fastest, most responsive & trendiest dashboard is here. Seriously.
          </p>
          <div className="flex flex-col items-center lg:flex-row">
            <button className="flex items-center rounded-xl bg-purple-blue-500 px-5 py-4 text-sm font-medium text-white transition hover:bg-purple-blue-600 focus:bg-purple-blue-700">
              Get started now
            </button>
            <button className="flex items-center rounded-xl px-5 py-4 text-sm font-medium text-dark-grey-900">
              <img className="mr-2 h-6" src="../../img/icons/phone.png" alt="phone icon" />
              Book a free call
            </button>
          </div>
        </div>
        <div className="col-span-1 hidden items-center justify-end lg:flex">
          <img className="w-4/5 rounded-2xl" src="../../img/header-1.png" alt="header image" />
        </div>
      </div>
    </div>
  );
};

export default Header;
