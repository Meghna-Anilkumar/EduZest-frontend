import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import { Camera, Search, User, Lock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../redux/store";
import { updateInstructorProfileThunk } from "../../redux/actions/userActions";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const Header = lazy(() => import("../../components/common/users/Header"));

interface FormValues {
  username: string;
  email: string;
  dob: string;
  gender: string;
  qualification: string;
}

const InstructorProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.user.userData);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | undefined>(undefined);

  const getMinDate = () => {
    const today = new Date();
    return new Date(today.getFullYear() - 16, today.getMonth(), today.getDate())
      .toISOString()
      .split("T")[0];
  };

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    dob: Yup.date()
      .nullable()
      .max(getMinDate(), "You must be at least 16 years old")
      .transform((curr, orig) => (orig === "" ? null : curr)),
    gender: Yup.string().oneOf(["Male", "Female", "Other", ""], "Invalid gender selection"),
    qualification: Yup.string(),
  });

  const [initialValues, setInitialValues] = useState<FormValues>({
    username: "",
    email: "",
    dob: "",
    gender: "",
    qualification: "",
  });

  useEffect(() => {
    if (userData) {
      setInitialValues({
        username: userData.name || "",
        email: userData.email || "",
        dob: userData.profile?.dob
          ? new Date(userData.profile.dob).toISOString().split("T")[0]
          : "",
        gender: userData.profile?.gender || "",
        qualification: userData.qualification?.toString() || "",
      });
      setProfilePic(userData.profile?.profilePic || null);
    }
  }, [userData]);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
        setProfileFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("username", values.username);
      formData.append("dob", values.dob || "");
      formData.append("gender", values.gender || "");
      formData.append("qualification", values.qualification || "");

      if (profileFile) {
        formData.append("profilePic", profileFile);
      }

      await dispatch(updateInstructorProfileThunk(formData)).unwrap();

      setIsSaved(true);
      setErrorMessage(null);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      const errorObj = err as { message?: string };
      const errorMsg = errorObj.message ?? "An error occurred while updating profile";
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleChangePassword = () => {
    navigate("/change-password");
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
          <div className="relative">
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
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="max-w-2xl mx-auto">
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Profile Picture</h3>
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
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
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
              </div>
            </div>

            <Formik
              enableReinitialize
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <Field
                      type="text"
                      id="username"
                      name="username"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter username"
                    />
                    <ErrorMessage name="username" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Email
                    </label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      readOnly
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50 cursor-not-allowed"
                    />
                    <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <Field
                      type="date"
                      id="dob"
                      name="dob"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="dob" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <Field
                      as="select"
                      id="gender"
                      name="gender"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Field>
                    <ErrorMessage name="gender" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-2">
                      Qualifications
                    </label>
                    <Field
                      type="text"
                      id="qualification"
                      name="qualification"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your qualifications"
                    />
                    <ErrorMessage name="qualification" component="div" className="mt-1 text-sm text-red-600" />
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
                      {isSaved ? "Saved!" : isSubmitting ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfilePage;