import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { loginAdmin } from "../../redux/actions/auth/adminLoginAction";
import { useNavigate } from "react-router-dom";

const AdminLogin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); 

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(4, "Password must be at least 4 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const response = await dispatch(loginAdmin(values)).unwrap();
      console.log("Login successful:", response);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div id="page-login" className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="login-container text-center bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">EDUZEST</h2>
        <div className="login-form text-left w-full">
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="block w-full border border-gray-300 rounded-lg p-2 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    className="block w-full border border-gray-300 rounded-lg p-2 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  {isSubmitting ? "Logging in..." : "Login to Admin Panel"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
