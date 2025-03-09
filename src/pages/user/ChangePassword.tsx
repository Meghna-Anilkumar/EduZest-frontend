import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import bgImage from "@/assets/newbg.jpg";
import { FaLock, FaKey, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { userClearError } from "../../redux/reducers/userReducer";
import type { AppDispatch, RootState } from "../../redux/store";
import { validationRules } from "../../utils/validation";
import { changePasswordThunk } from "../../redux/actions/userActions";

const ChangePasswordPage: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { error, userData } = useSelector((state: RootState) => state.user);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Form state
  const [formValues, setFormValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Validation errors state
  const [formErrors, setFormErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    dispatch(userClearError());
  }, [dispatch]);

  const togglePasswordVisibility = (field: keyof typeof passwordVisibility) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate on change
    validateField(name, value);
  };

  // Validation logic
  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "currentPassword") {
      error = !value ? "Current password is required" : "";
    } else if (name === "newPassword") {
      error = validationRules.password(value) || "";
    } else if (name === "confirmPassword") {
      error = !value
        ? "Please confirm your new password"
        : value !== formValues.newPassword
        ? "Passwords do not match"
        : "";
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // Validate all fields before submission
  const validateForm = () => {
    const errors = {
      currentPassword: !formValues.currentPassword ? "Current password is required" : "",
      newPassword: validationRules.password(formValues.newPassword) || "",
      confirmPassword: !formValues.confirmPassword
        ? "Please confirm your new password"
        : formValues.confirmPassword !== formValues.newPassword
        ? "Passwords do not match"
        : "",
    };

    setFormErrors(errors);
    return !Object.values(errors).some((err) => err);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    setIsLoading(true);
    setServerError(null);
    try {
      const email = userData?.email;
      if (!email) {
        throw new Error("User email is missing");
      }

      const passwordData = {
        email,
        currentPassword: formValues.currentPassword,
        newPassword: formValues.newPassword,
      };

      await dispatch(changePasswordThunk(passwordData)).unwrap();

      setShowSuccess(true); // Show success modal
    } catch (error: any) {
      console.error("Password change failed:", error);
      setIsLoading(false);

      if (error?.message) {
        setServerError(error.message);
      } else {
        setServerError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/profile"); // Redirect when OK is clicked
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-[#49bbbd] bg-cover"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundPosition: "center 30%",
        backgroundSize: "cover",
      }}
    >
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md border border-black relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg">
            <div className="w-12 h-12 border-4 border-[#49bbbd] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-700 font-medium">
              Updating your password...
            </p>
          </div>
        )}

        {/* Success Modal */}
        {showSuccess && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold text-green-600 text-center mb-4">
                Success!
              </h3>
              <p className="text-gray-700 text-center mb-6">
                Your password has been changed successfully.
              </p>
              <button
                onClick={handleSuccessClose}
                className="w-full bg-[#49bbbd] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#3aa8a3] transition duration-200"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {!showSuccess && (
          <>
            <div className="flex items-center mb-6">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-800 mr-3"
                aria-label="Go back"
              >
                <FaArrowLeft />
              </button>
              <h2 className="text-xl font-bold text-center text-black flex-1 pr-6">
                Change Password
              </h2>
            </div>

            <p className="text-sm text-center text-gray-600 mb-6">
              Update your password to keep your account secure
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error.message || "An error occurred. Please try again."}
              </div>
            )}

            {serverError && (
              <p className="text-red-500 text-sm mt-1">{serverError}</p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label
                  htmlFor="currentPassword"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Current Password
                </label>
                <div className="relative">
                  <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-md">
                    <FaKey className="w-5 h-5 text-gray-500 mr-2" />
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={passwordVisibility.current ? "text" : "password"}
                      value={formValues.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter your current password"
                      className="w-full outline-none text-sm pr-10"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => togglePasswordVisibility("current")}
                    aria-label={
                      passwordVisibility.current
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {passwordVisibility.current ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formErrors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.currentPassword}
                  </p>
                )}
              </div>

              <div className="mb-5">
                <label
                  htmlFor="newPassword"
                  className="block text-gray-700 font-medium mb-1"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-md">
                    <FaLock className="w-5 h-5 text-gray-500 mr-2" />
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={passwordVisibility.new ? "text" : "password"}
                      value={formValues.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      className="w-full outline-none text-sm pr-10"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => togglePasswordVisibility("new")}
                    aria-label={
                      passwordVisibility.new ? "Hide password" : "Show password"
                    }
                  >
                    {passwordVisibility.new ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formErrors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.newPassword}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1 pl-1">
                  Password must be at least 8 characters with lowercase,
                  uppercase, number, and special character.
                </p>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-md">
                    <FaLock className="w-5 h-5 text-gray-500 mr-2" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={passwordVisibility.confirm ? "text" : "password"}
                      value={formValues.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="w-full outline-none text-sm pr-10"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => togglePasswordVisibility("confirm")}
                    aria-label={
                      passwordVisibility.confirm
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {passwordVisibility.confirm ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  isLoading ||
                  !formValues.currentPassword ||
                  !formValues.newPassword ||
                  !formValues.confirmPassword ||
                  Object.values(formErrors).some((error) => error)
                }
                className="w-full bg-[#49bbbd] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#3aa8a3] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating Password..." : "Update Password"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/profile"
                className="text-[#49bbbd] hover:underline text-sm font-medium"
              >
                Cancel and return to profile
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordPage;