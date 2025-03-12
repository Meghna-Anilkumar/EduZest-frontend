import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import { Camera, Search, User, Menu, X, Lock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../redux/store";
import { updateStudentProfileThunk } from "../../redux/actions/userActions";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
const Header = lazy(() => import("../../components/common/users/Header"));

// Validation schema using Yup
const ProfileValidationSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters long")
    .matches(/^[a-zA-Z]{3,20}(?: [a-zA-Z]+)*$/, "Invalid username format"),
  
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format")
    .matches(
      /^(?=.{11,100}$)([a-zA-Z\d]+([.-_]?[a-zA-Z\d]+)*)\@([a-zA-Z]{4,9})+\.com$/,
      "Invalid email address format"
    ),
  
  additionalEmail: Yup.string()
    .email("Invalid email format")
    .matches(
      /^(?=.{11,100}$)([a-zA-Z\d]+([.-_]?[a-zA-Z\d]+)*)\@([a-zA-Z]{4,9})+\.com$/,
      "Invalid email address format"
    )
    .nullable(),
  
  dob: Yup.date()
    .nullable()
    .test("dob", "You must be at least 16 years old", function(value) {
      if (!value) return true; // Allow empty value
      
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 16);
      return value <= cutoff;
    })
    .test("future-date", "Date of birth cannot be in the future", function(value) {
      if (!value) return true;
      const today = new Date();
      return value <= today;
    }),
  
  gender: Yup.string().nullable(),
  
  profilePic: Yup.mixed().nullable()
});

interface ProfileFormValues {
  username: string;
  email: string;
  additionalEmail: string;
  dob: string;
  gender: string;
  profilePic: string | null;
  file?: File;
}

const StudentProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.user.userData);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("Profile");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialValues: ProfileFormValues = {
    username: "",
    email: "",
    additionalEmail: "",
    dob: "",
    gender: "",
    profilePic: null,
    file: undefined,
  };

  const [formInitialValues, setFormInitialValues] = useState<ProfileFormValues>(initialValues);

  useEffect(() => {
    console.log("User Data from Redux:", userData);
    if (userData) {
      setFormInitialValues({
        username: userData.name || "",
        email: userData.email || "",
        additionalEmail: userData.studentDetails?.additionalEmail || "",
        dob: userData.profile?.dob
          ? new Date(userData.profile.dob).toISOString().split("T")[0]
          : "",
        gender: userData.profile?.gender || "",
        profilePic: userData.profile?.profilePic || null,
        file: undefined,
      });
    }
  }, [userData]);

  const handleProfilePicChange = (setFieldValue: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFieldValue("profilePic", reader.result as string);
        setFieldValue("file", file);
      };
      reader.readAsDataURL(file);
    }
    setError(null);
  };

  const handleSubmit = async (
    values: ProfileFormValues,
    { setSubmitting }: FormikHelpers<ProfileFormValues>
  ) => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("username", values.username);
      formData.append("additionalEmail", values.additionalEmail || "");
      formData.append("dob", values.dob || "");
      formData.append("gender", values.gender || "");
      if (values.file) {
        formData.append("profilePic", values.file);
      }

      await dispatch(updateStudentProfileThunk(formData)).unwrap();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update profile. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="h-16 bg-white border-b shadow-sm flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <Header />
      </Suspense>

      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Settings</h1>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Find anything here"
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow flex flex-col md:flex-row">
          <div className="md:hidden p-4 border-b">
            <button
              onClick={toggleMobileMenu}
              className="flex items-center justify-between w-full py-2 px-4 rounded-lg bg-gray-50 text-gray-700"
            >
              <span className="font-medium">{activeTab}</span>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <div className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"} border-b`}>
            <div className="p-4 space-y-1">
              {["Profile", "Account", "Notifications"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
                    activeTab === tab ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block w-64 border-r p-4 space-y-1">
            {["Profile", "My Courses", "Assessments"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
                  activeTab === tab ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 md:p-6">
            <div className="max-w-2xl mx-auto md:mx-0">
              {/* Error Message Display */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Success Message Display */}
              {isSaved && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  Profile updated successfully!
                </div>
              )}

              <Formik
                initialValues={formInitialValues}
                validationSchema={ProfileValidationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
                validateOnChange
                validateOnBlur
              >
                {({ values, errors, touched, isSubmitting, setFieldValue }) => (
                  <Form>
                    <div className="mb-8">
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Profile Picture</h3>
                      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            {values.profilePic ? (
                              <img src={values.profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-12 h-12 text-gray-400" />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full text-white hover:bg-blue-600"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-blue-500 font-medium hover:text-blue-600 text-center sm:text-left"
                          >
                            Change picture
                          </button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePicChange(setFieldValue)}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <Field
                          type="text"
                          name="username"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.username && touched.username ? "border-red-500" : ""
                          }`}
                          placeholder="Enter username"
                        />
                        <ErrorMessage name="username" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Email</label>
                        <Field
                          type="email"
                          name="email"
                          readOnly
                          className="w-full px-4 py-2 border rounded-lg bg-gray-50 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Email</label>
                        <Field
                          type="email"
                          name="additionalEmail"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.additionalEmail && touched.additionalEmail ? "border-red-500" : ""
                          }`}
                          placeholder="Enter additional email"
                        />
                        <ErrorMessage name="additionalEmail" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <Field
                          type="date"
                          name="dob"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.dob && touched.dob ? "border-red-500" : ""
                          }`}
                        />
                        <ErrorMessage name="dob" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <Field
                          as="select"
                          name="gender"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </Field>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={handleChangePassword}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg border hover:bg-gray-200 w-full sm:w-auto transition-colors duration-200"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Change Password</span>
                      </button>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center sm:justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting || isSaved}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 w-full sm:w-auto"
                      >
                        {isSubmitting ? "Saving..." : isSaved ? "Saved!" : "Save changes"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;