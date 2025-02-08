import { useState } from "react";
import { FaLock, FaCheckCircle } from "react-icons/fa";
// import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [values, setValues] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-[#49bbbd] bg-cover"
      style={{ backgroundImage: "url(/path-to-your-bg-image.jpg)", backgroundPosition: "center 30%" }}
    >
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md border border-black relative">
        <h2 className="text-xl font-bold text-center text-black mb-2">Reset Password</h2>
        <p className="text-sm text-center text-gray-600 mb-4">Enter your new password below</p>

        <form>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-1">New Password</label>
            <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-md">
              <FaLock className="w-5 h-5 text-gray-500 mr-2" />
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={values.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">Confirm Password</label>
            <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-md">
              <FaCheckCircle className="w-5 h-5 text-gray-500 mr-2" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={values.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#49bbbd] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#3aa8a3] transition duration-200"
          >
            Reset
          </button>
        </form>

      </div>
    </div>
  );
}
