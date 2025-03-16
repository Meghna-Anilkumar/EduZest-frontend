import { useState } from "react";
import { FaLock, FaCheckCircle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { AppDispatch} from "../../redux/store";
import { resetPasswordThunk } from "../../redux/actions/userActions";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function ResetPassword() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.userEmail;

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    newPassword: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters long")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("newPassword")], "Passwords must match"),
  });

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!email) {
        setMessage("Email is missing. Please request a reset link again.");
        return;
      }

      setLoading(true);
      console.log("Sending request:", {
        email,
        password: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

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
          const errorPayload = resultAction.payload as {
            success?: boolean;
            message?: string;
          };
          setMessage(errorPayload?.message || "An error occurred.");
        }
      } catch (error) {
        setMessage("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="bg-gradient-to-r from-[#49bbbd] via-gray-400 to-white flex items-center justify-center min-h-screen">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md border border-black relative">
        <h2 className="text-xl font-bold text-center text-black mb-2">
          Reset Password
        </h2>
        <p className="text-sm text-center text-gray-600 mb-4">
          Enter your new password below
        </p>

        {message && (
          <p className="text-center text-red-600 font-semibold mb-2">
            {message}
          </p>
        )}

        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="newPassword"
              className="block text-gray-700 font-medium mb-1"
            >
              New Password
            </label>
            <div
              className={`flex items-center px-4 py-3 border-2 ${
                formik.touched.newPassword && formik.errors.newPassword
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md`}
            >
              <FaLock className="w-5 h-5 text-gray-500 mr-2" />
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter new password"
                className="w-full outline-none text-sm"
              />
            </div>
            {formik.touched.newPassword && formik.errors.newPassword && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.newPassword}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 font-medium mb-1"
            >
              Confirm Password
            </label>
            <div
              className={`flex items-center px-4 py-3 border-2 ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md`}
            >
              <FaCheckCircle className="w-5 h-5 text-gray-500 mr-2" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Confirm your password"
                className="w-full outline-none text-sm"
              />
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.confirmPassword}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#49bbbd] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#3aa8a3] transition duration-200"
            disabled={loading || !formik.isValid}
          >
            {loading ? "Resetting..." : "Reset"}
          </button>
        </form>
        
      </div>
    </div>
  );
}