import { useState } from "react";
import { FaLock, FaCheckCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { resetPasswordThunk } from "../../redux/actions/userActions";
import { useNavigate, useLocation } from "react-router-dom";

export default function ResetPassword() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { error } = useSelector((state: RootState) => state.user);

  const email = location.state?.userEmail; // Ensure email is available

  const [values, setValues] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // 🔹 Added this

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setMessage("Email is missing. Please request a reset link again.");
      return;
    }
    if (!values.newPassword || !values.confirmPassword) {
      setMessage("All fields are required.");
      return;
    }
    if (values.newPassword !== values.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true); // 🔹 Start loading
    console.log("Sending request:", { email, password: values.newPassword, confirmPassword: values.confirmPassword });

    try {
      const resultAction = await dispatch(
        resetPasswordThunk({
          email,
          newPassword: values.newPassword,
          confirmNewPassword: values.confirmPassword,
        })
      );

      if (resetPasswordThunk.fulfilled.match(resultAction)) {
        setMessage("Password reset successful! Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        const errorPayload = resultAction.payload as { success?: boolean; message?: string };
        setMessage(errorPayload?.message || "An error occurred.");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false); // 🔹 Stop loading
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-[#49bbbd] bg-cover"
      style={{ backgroundImage: "url(/path-to-your-bg-image.jpg)", backgroundPosition: "center 30%" }}
    >
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md border border-black relative">
        <h2 className="text-xl font-bold text-center text-black mb-2">Reset Password</h2>
        <p className="text-sm text-center text-gray-600 mb-4">Enter your new password below</p>

        {message && <p className="text-center text-red-600 font-semibold mb-2">{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-1">
              New Password
            </label>
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
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
              Confirm Password
            </label>
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
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset"}
          </button>
        </form>
      </div>
    </div>
  );
}
