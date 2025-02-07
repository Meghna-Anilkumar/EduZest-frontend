import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/store";
import { userSetIsAuthenticated, setUserData } from "../../../redux/reducers/userReducer";
import Cookies from "js-cookie";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();

  const { isAuthenticated, userData } = useSelector((state: RootState) => state.user);
  console.log(isAuthenticated);
  console.log(userData?.name)


  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
  };

  const handleLogout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    dispatch(userSetIsAuthenticated(false));
    dispatch(setUserData(null));
  };

  const navLinks = [
    { href: "/home", text: "Home" },
    { href: "/all-courses", text: "All Courses" },
    { href: "/teach", text: "Teach" },
    { href: "/about", text: "About" },
    { href: "/contact", text: "Contact" },
    { href: "/my-account", text: "My Account" },
  ];

  return (
    <header className="bg-black py-4 md:py-6 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex flex-wrap justify-between items-center px-4 md:px-6">
        <div className="flex items-center">
          <h1 className="text-white text-2xl md:text-3xl font-bold flex items-center">
            Edu<span className="text-[#49bbbd]">Zest</span>
          </h1>
        </div>

        <button
          onClick={toggleMenu}
          className="md:hidden text-white p-2 focus:outline-none"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-4 relative flex flex-col justify-between">
            <span
              className={`w-full h-0.5 bg-white transform transition duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            />
            <span
              className={`w-full h-0.5 bg-white transition duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-full h-0.5 bg-white transform transition duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            />
          </div>
        </button>

        {/* Navigation */}
        <nav
          className={`${
            isMenuOpen ? "flex" : "hidden"
          } md:flex w-full md:w-auto mt-4 md:mt-0`}
        >
          <ul className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 w-full md:w-auto">
            {navLinks.map((link, index) => (
              <li key={index} className="text-center">
                <a
                  href={link.href}
                  className="text-white text-lg hover:text-[#49bbbd] transition duration-300 block md:inline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sign-In/Logout and Profile */}
        <div
          className={`${
            isMenuOpen ? "flex" : "hidden"
          } md:flex items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto mt-4 md:mt-0 flex-col md:flex-row`}
        >
          {isAuthenticated ? (
            <>
              {/* Profile Button */}
              <a
                href="/profile"
                className="text-white text-lg hover:text-[#49bbbd] transition duration-300 text-center w-full md:w-auto"
                onClick={() => setIsMenuOpen(false)}
              >
                Welcome, {userData?.name || "User"}
              </a>
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-[#49bbbd] text-black px-5 py-2 rounded-full text-lg font-semibold hover:bg-white hover:text-[#49bbbd] transition duration-300 text-center w-full md:w-auto"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login Button */}
              <a
                href="/login"
                className="text-white text-lg hover:text-[#49bbbd] transition duration-300 text-center w-full md:w-auto"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </a>
              {/* Get Started Button */}
              <a
                href="/signup"
                className="bg-[#49bbbd] text-black px-5 py-2 rounded-full text-lg font-semibold hover:bg-white hover:text-[#49bbbd] transition duration-300 text-center w-full md:w-auto"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
