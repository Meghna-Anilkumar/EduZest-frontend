import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { forgotPasswordThunk } from "../../redux/actions/userActions";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 

    if (email.trim() === "") {
      setError("Please enter your email.");
      return;
    }

    const response = await dispatch(forgotPasswordThunk(email));

    console.log(response);

    if (response.payload?.success) {
      navigate(response.payload.redirectURL,{ state: { email } });
    } else {
      setError(response.payload?.message || "Failed to send OTP. Please try again.");
    }
  };

  return (
    <div
      className="bg-gradient-to-r from-[#49bbbd] via-gray-400 to-white flex items-center justify-center min-h-screen"
    >
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md border border-black relative">
        <h2 className="text-xl font-bold text-center text-black mb-2">Forgot Password</h2>
        <p className="text-sm text-center text-gray-600 mb-4">
          Enter your email to receive an OTP for password reset
        </p>

        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-100 border border-red-400 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-md">
              <FaEnvelope className="w-5 h-5 text-gray-500 mr-2" />
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#49bbbd] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#3aa8a3] transition duration-200"
          >
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
}
