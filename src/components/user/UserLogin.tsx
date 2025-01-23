import React from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { login } from "../../redux/actions/auth/userLoginAction";

const UserLogin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { error, isAuthenticated } = useSelector((state: RootState) => state.user);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 8 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await dispatch(login(values)).unwrap();
        toast.success("Logged in successfully!");
        navigate("/");
      } catch (err) {
        console.error("Login failed:", err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#49bbbd]">
      <div className="w-full max-w-md mx-4 bg-white p-8 rounded-lg shadow-md border">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Welcome Back!
        </h2>
        <p className="text-sm text-center text-gray-600 mb-6">
          Please sign in to continue
        </p>

        {error && <div className="error-message">{error.message}</div>}

        <form onSubmit={formik.handleSubmit}>
          {/* Email Field */}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Email
            </label>
            <div
              className={`flex items-center px-4 py-3 border-2 rounded-md ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : "border-gray-300 focus-within:border-[#49bbbd]"
              }`}
            >
              <FaEnvelope className="w-5 h-5 text-gray-500 mr-2" />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full outline-none text-sm"
                {...formik.getFieldProps("email")}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Password
            </label>
            <div
              className={`flex items-center px-4 py-3 border-2 rounded-md ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500"
                  : "border-gray-300 focus-within:border-[#49bbbd]"
              }`}
            >
              <FaLock className="w-5 h-5 text-gray-500 mr-2" />
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full outline-none text-sm"
                {...formik.getFieldProps("password")}
              />
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-center text-sm mb-4">
              {error.message || "Invalid email or password"}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className={`w-full bg-[#49bbbd] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#3aa8a3] transition duration-200 ${
              formik.isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {formik.isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 text-gray-500 text-sm">Or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button className="w-full flex items-center justify-center border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-100 transition duration-200">
          <img
            src="/api/placeholder/20/20"
            alt="Google Logo"
            className="w-5 h-5 mr-2"
          />
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#49bbbd] font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UserLogin;
