import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { userClearError } from "../../redux/reducers/userReducer";
import type { AppDispatch, RootState } from "../../redux/store";
import { signUpUser } from "../../redux/actions/auth/signupAction";
import { FaUser, FaEnvelope, FaLock, FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import bgImage from "@/assets/newbg.jpg";
import { GoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../../redux/actions/auth/googleSigninAction";
import { toast } from "react-toastify";

const UserSignUp: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, error, tempMail } = useSelector(
    (state: RootState) => state.user
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

    const handleGoogleAuth = async (token: string) => {
      try {
        await dispatch(googleAuth(token)).unwrap();
        toast.success("Logged in with Google successfully!");
        navigate("/");
      } catch (err) {
        console.error("Google login failed:", err);
        toast.error("Google login failed. Please try again.");
      }
    };

  useEffect(() => {
    dispatch(userClearError());
  }, [dispatch]);

  useEffect(() => {
    if (tempMail) navigate("/otp-verification");
  }, [tempMail, navigate]);

  useEffect(() => {
    if (error) {
      setBackendError(error.message);
    } else {
      setBackendError(null);
    }
  }, [error]);

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain a special character")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), ""], "Passwords must match")
      .required("Confirm password is required"),
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-[#49bbbd] bg-cover"
      style={{ backgroundImage: `url(${bgImage})`, backgroundPosition: "center 30%", backgroundSize: "cover" }}
    >
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md border border-black relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg">
            <div className="w-12 h-12 border-4 border-[#49bbbd] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-700 font-medium">Creating your account...</p>
          </div>
        )}
        <h2 className="text-xl font-bold text-center text-black mb-2">Hello, friend!</h2>
        <p className="text-sm text-center text-gray-600 mb-4">Welcome to EduZest</p>
        
        <Formik
          initialValues={{ name: "", email: "", password: "", confirmPassword: "" }}
          validationSchema={validationSchema}
          validateOnChange={true}
          validateOnBlur={true}
          onSubmit={async (values, { setSubmitting }) => {
            setIsLoading(true);
            try {
              await dispatch(signUpUser(values)).unwrap();
            } catch {
              setIsLoading(false);
            }
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, touched, errors, handleChange, handleBlur, values }) => (
            <Form>
              {backendError && (
                <div className="mb-4 flex justify-center">
                <p className="text-red-500 text-sm text-center">{backendError}</p>
              </div>
              
              )}
              
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-1">Name</label>
                <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-md">
                  <FaUser className="text-gray-500 mr-2" /> 
                  <Field 
                    id="name" 
                    name="name" 
                    type="text" 
                    className="w-full outline-none text-sm" 
                    placeholder="Enter your full name" 
                    disabled={isLoading} 
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    onBlur={handleBlur}
                  />
                </div>
                {(touched.name || values.name !== "") && errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
                <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-md">
                  <FaEnvelope className="text-gray-500 mr-2" /> 
                  <Field 
                    id="email" 
                    name="email" 
                    type="email" 
                    className="w-full outline-none text-sm" 
                    placeholder="Enter your email address" 
                    disabled={isLoading} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                {(touched.email || values.email !== "") && errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
                <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-md">
                  <FaLock className="text-gray-500 mr-2" /> 
                  <Field 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    className="w-full outline-none text-sm" 
                    placeholder="Create a strong password" 
                    disabled={isLoading} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <button 
                    type="button" 
                    onClick={togglePasswordVisibility} 
                    className="text-gray-500 focus:outline-none ml-2"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {(touched.password || values.password !== "") && errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">Confirm Password</label>
                <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-md">
                  <FaCheckCircle className="text-gray-500 mr-2" /> 
                  <Field 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"} 
                    className="w-full outline-none text-sm" 
                    placeholder="Confirm your password" 
                    disabled={isLoading} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <button 
                    type="button" 
                    onClick={toggleConfirmPasswordVisibility} 
                    className="text-gray-500 focus:outline-none ml-2"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {(touched.confirmPassword || values.confirmPassword !== "") && errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-[#49bbbd] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#3aa8a3] transition duration-200 disabled:opacity-50"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </Form>
          )}
        </Formik>

                {/* Google Login Button */}
                <div className="mt-6">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      if (credentialResponse.credential) {
                        handleGoogleAuth(credentialResponse.credential);
                      }
                    }}
                    onError={() => {
                      toast.error("Google authentication failed");
                    }}
                    useOneTap
                    theme="outline"
                    text="continue_with"
                    shape="rectangular"
                    width="100%"
                    logo_alignment="center"
                  />
                </div>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account? <Link to="/login" className="text-[#49bbbd] font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default UserSignUp;