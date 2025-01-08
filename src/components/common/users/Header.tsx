import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-black py-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-white text-3xl font-bold flex items-center">
            Edu<span className="text-[#49bbbd]">Zest</span>
            <span
              className="ml-2 text-white text-4xl font-extrabold"
              style={{
                fontFamily: "'Courier New', monospace",
                fontStyle: "italic",
                fontSize: "2.8rem",
              }}
            >
              e
            </span>
          </h1>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="flex space-x-8">
            <li>
              <a
                href="/home"
                className="text-white text-lg hover:text-[#49bbbd] transition duration-300"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/all-courses"
                className="text-white text-lg hover:text-[#49bbbd] transition duration-300"
              >
                All Courses
              </a>
            </li>
            <li>
              <a
                href="/teach"
                className="text-white text-lg hover:text-[#49bbbd] transition duration-300"
              >
                Teach
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="text-white text-lg hover:text-[#49bbbd] transition duration-300"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="text-white text-lg hover:text-[#49bbbd] transition duration-300"
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="/my-account"
                className="text-white text-lg hover:text-[#49bbbd] transition duration-300"
              >
                My Account
              </a>
            </li>
          </ul>
        </nav>

        {/* Sign-In and Login */}
        <div className="flex items-center space-x-4">
          <a
            href="/login"
            className="text-white text-lg hover:text-[#49bbbd] transition duration-300"
          >
            Login
          </a>
          <a
            href="/get-started"
            className="bg-[#49bbbd] text-black px-5 py-2 rounded-full text-lg font-semibold hover:bg-white hover:text-[#49bbbd] transition duration-300"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
