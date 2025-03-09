import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import bgImage from "@/assets/newbg.jpg";
import { useDispatch, useSelector } from "react-redux";
import { userClearError } from "../../redux/reducers/userReducer";
import type { AppDispatch, RootState } from "../../redux/store";
import { useForm } from "../../hooks/UseForm";
import { signUpUser } from "../../redux/actions/auth/signupAction";
import { validationRules } from "../../utils/validation";
import { UserSignUpData } from "../../interface/user/IUserData";
import { FaUser, FaEnvelope, FaLock, FaCheckCircle } from "react-icons/fa";

const UserSignUp: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated,error, tempMail } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = React.useState(false);
  

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    dispatch(userClearError());
  }, [dispatch]);

  useEffect(() => {
    if (tempMail) {
      navigate("/otp-verification");
    }
  }, [tempMail, navigate]);

  const { values, errors, handleChange } = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationRules: {
      name: (value: string) => validationRules.name(value),
      email: (value: string) => validationRules.email(value),
      password: (value: string) => validationRules.password(value),
      confirmPassword: (value: string) =>
        validationRules.confirmPassword(value, values),
    },
    onSubmit: async () => {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData: UserSignUpData = values;
      await dispatch(signUpUser(userData)).unwrap();
    } catch {
      setIsLoading(false);
    }
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
              Creating your account...
            </p>
          </div>
        )}

        <h2 className="text-xl font-bold text-center text-black mb-2">
          Hello, friend!
        </h2>
        <p className="text-sm text-center text-gray-600 mb-4">
          Welcome to EduZest
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-1"
            >
              Username
            </label>
            <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-md">
              <FaUser className="w-5 h-5 text-gray-500 mr-2" />
              <input
                id="name"
                name="name"
                type="text"
                value={values.name}
                onChange={handleChange}
                placeholder="Enter your username"
                className="w-full outline-none text-sm"
                disabled={isLoading}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-1"
            >
              Email
            </label>
            <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-md">
              <FaEnvelope className="w-5 h-5 text-gray-500 mr-2" />
              <input
                id="email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full outline-none text-sm"
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-1"
            >
              Password
            </label>
            <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-md">
              <FaLock className="w-5 h-5 text-gray-500 mr-2" />
              <input
                id="password"
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full outline-none text-sm"
                disabled={isLoading}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 font-medium mb-1"
            >
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
                disabled={isLoading}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#49bbbd] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#3aa8a3] transition duration-200 disabled:opacity-50"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 text-gray-500 text-sm">Or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* <button
          className="w-full flex items-center justify-center border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition duration-200"
          disabled={isLoading}
        >
          <img
            src="/api/placeholder/20/20"
            alt="Google Logo"
            className="w-5 h-5 mr-2"
          />
          Continue with Google
        </button> */}

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#49bbbd] font-bold hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UserSignUp;
