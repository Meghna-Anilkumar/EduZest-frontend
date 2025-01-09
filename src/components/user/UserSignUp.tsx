import React from "react";
import bgImage from "@/assets/learning_img.jpg"; 

const UserSignUp: React.FC = (): JSX.Element => {
  return (
    <div
      className="flex justify-center items-center min-h-screen bg-[#49bbbd] bg-cover"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundPosition: 'center 30%', // Move the image slightly down
        backgroundSize: 'cover', // Resize to cover the area, or you can use 'contain' to fit the image within the container
      }}
    >
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
        {/* Header Section */}
        <h2 className="text-2xl font-bold text-center text-black mb-2">
          Hello, friend!
        </h2>
        <p className="text-sm text-center text-gray-600 mb-6">
          Welcome to EduZest
        </p>

        {/* Signup Form */}
        <form>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 font-medium mb-2"
            >
              Username
            </label>
            <div className="flex items-center px-4 py-2 border border-gray-300 rounded-lg">
              <img
                src="https://i.postimg.cc/1zgS8WTF/user.png"
                alt="icon"
                className="w-5 h-5 mr-3"
              />
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Email
            </label>
            <div className="flex items-center px-4 py-2 border border-gray-300 rounded-lg">
              <img
                src="https://i.postimg.cc/DZBPRgvC/email.png"
                alt="icon"
                className="w-4 h-4 mr-3"
              />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Password
            </label>
            <div className="flex items-center px-4 py-2 border border-gray-300 rounded-lg">
              <img
                src="https://i.postimg.cc/Nj5SDK4q/password.png"
                alt="icon"
                className="w-5 h-5 mr-3"
              />
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirm-password"
              className="block text-gray-700 font-medium mb-2"
            >
              Confirm Password
            </label>
            <div className="flex items-center px-4 py-2 border border-gray-300 rounded-lg">
              <img
                src="https://i.postimg.cc/Nj5SDK4q/password.png"
                alt="icon"
                className="w-5 h-5 mr-3"
              />
              <input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#49bbbd] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#3aa8a3] transition duration-200"
          >
            Create Account
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 text-gray-500 text-sm">Or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button className="w-full flex items-center justify-center border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition duration-200">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
            alt="Google Logo"
            className="w-5 h-5 mr-2"
          />
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-[#49bbbd] font-bold hover:underline"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default UserSignUp;
