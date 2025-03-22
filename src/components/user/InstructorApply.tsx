import React, { useState, useEffect, Suspense, lazy } from "react";
import { Upload, UserCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { applyForInstructorThunk } from "../../redux/actions/userActions";
import { AppDispatch, RootState } from "../../redux/store";
import { toast } from "react-toastify";
import { fetchUserData } from "../../redux/actions/auth/fetchUserdataAction";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Loader } from "../Loader"; 

const Header = lazy(() => import("../common/users/Header"));

interface FormValues {
  name: string;
  email: string;
  gender: "Male" | "Female" | "Other" | "";
  dob: string;
  phone: string;
  qualification: string;
  aboutMe: string;
  address: string;
  experience: "0" | "1-2" | "3-5" | "5+" | "";
  linkedinUrl: string;
  githubUrl: string;
  profilePic?: File;
  cv?: File;
}

const InstructorApplicationForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { userData, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    error: null as string | null,
    success: false,
  });
  const [isLoading, setIsLoading] = useState(false); 

  const fieldNameMapping: Record<string, string> = {
    mobileNumber: "phone",
    name: "name",
    email: "email",
    gender: "gender",
    dob: "dob",
    qualification: "qualification",
    aboutMe: "aboutMe",
    cv: "cv",
    profilePic: "profilePic",
    experience: "experience",
    address: "address",
    "socialMedia.linkedin": "linkedinUrl",
    "socialMedia.github": "githubUrl",
  };

  // Fetch user data only once on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      const fetchData = async () => {
        setIsLoading(true); 
        try {
          await dispatch(fetchUserData()).unwrap();
        } catch (error) {
          toast.error("Failed to fetch user data. Please try again.");
        } finally {
          setIsLoading(false); 
        }
      };
      fetchData();
    }
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (userData?.profile?.profilePic) {
      setProfilePreview(userData.profile.profilePic);
    }
  }, [userData]);

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name is required")
      .trim()
      .min(3, "Name must be at least 3 characters long.")
      .matches(/^[a-zA-Z]{3,20}(?: [a-zA-Z]+)*$/, "Invalid name format."),
    email: Yup.string()
      .required("Email is required")
      .trim()
      .matches(
        /^(?=.{11,100}$)([a-zA-Z\d]+([.-_]?[a-zA-Z\d]+)*)\@([a-zA-Z]{4,9})+\.com$/,
        "Invalid email address."
      ),
    gender: Yup.string().required("Gender is required"),
    dob: Yup.string()
      .required("Date of birth is required")
      .test("dob", "You must be at least 16 years old", function (value) {
        if (!value) return false;

        const birthDate = new Date(value);
        const today = new Date();

        if (isNaN(birthDate.getTime())) {
          return this.createError({
            message: "Invalid date format",
          });
        }

        if (birthDate > today) {
          return this.createError({
            message: "Date of birth cannot be in the future",
          });
        }

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--;
        }

        return age >= 16;
      }),
    phone: Yup.string()
      .required("Phone number is required")
      .trim()
      .matches(/^\d{10}$/, "Mobile number should be ten digits."),
    qualification: Yup.string()
      .required("Qualification is required")
      .min(3, "Qualification must be at least 3 characters long."),
    aboutMe: Yup.string()
      .required("About Me is required")
      .min(20, "Please provide at least 20 characters about yourself."),
    address: Yup.string()
      .required("Address is required")
      .min(5, "Address must be at least 5 characters long."),
    experience: Yup.string().required("Experience is required"),
    linkedinUrl: Yup.string()
      .url("Please enter a valid LinkedIn URL")
      .matches(/linkedin\.com/, "Please enter a valid LinkedIn URL"),
    githubUrl: Yup.string()
      .url("Please enter a valid GitHub URL")
      .matches(/github\.com/, "Please enter a valid GitHub URL"),
    profilePic: Yup.mixed().test(
      "profilePicRequired",
      "Profile picture is required",
      function (value) {
        return !!value || !!profilePreview;
      }
    ),
    cv: Yup.mixed().required("CV is required"),
  });

  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
    setFieldTouched: (field: string, isTouched?: boolean) => void,
    validateField: (field: string) => void
  ) => {
    setFieldTouched("profilePic", true);

    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        setFieldValue("profilePic", undefined);
        validateField("profilePic");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        setFieldValue("profilePic", undefined);
        validateField("profilePic");
        return;
      }

      setFieldValue("profilePic", file);
      validateField("profilePic");

      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFieldValue("profilePic", undefined);
      validateField("profilePic");
    }
  };

  const handleCVChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
    setFieldTouched: (field: string, isTouched?: boolean) => void,
    validateField: (field: string) => void
  ) => {
    setFieldTouched("cv", true);

    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      const acceptedTypes = [".pdf", ".doc", ".docx"];
      const fileExtension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      if (!acceptedTypes.includes(fileExtension)) {
        toast.error("Please upload a PDF or Word document");
        setFieldValue("cv", undefined);
        validateField("cv");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("CV file size should be less than 10MB");
        setFieldValue("cv", undefined);
        validateField("cv");
        return;
      }

      setFieldValue("cv", file);
      validateField("cv");
    } else {
      setFieldValue("cv", undefined);
      validateField("cv");
    }
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setErrors }: FormikHelpers<FormValues>
  ) => {
    setSubmitStatus({ loading: true, error: null, success: false });

    if (!values.profilePic && !userData?.profile?.profilePic) {
      setErrors({ profilePic: "Profile picture is required" });
      setSubmitStatus({
        loading: false,
        error: "Profile picture is required",
        success: false,
      });
      return;
    }

    if (!values.cv) {
      setErrors({ cv: "CV is required" });
      setSubmitStatus({
        loading: false,
        error: "CV is required",
        success: false,
      });
      return;
    }

    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (
        value &&
        key !== "gender" &&
        key !== "dob" &&
        key !== "profilePic" &&
        key !== "cv" &&
        key !== "linkedinUrl" &&
        key !== "githubUrl"
      ) {
        data.append(key, value);
      }
    });

    if (values.profilePic) {
      data.append("profilePic", values.profilePic);
    } else if (userData?.profile?.profilePic) {
      data.append("profilePic", userData.profile.profilePic);
    }

    if (values.cv) {
      data.append("cv", values.cv);
    }

    const socialMedia = {
      linkedin: values.linkedinUrl || "",
      github: values.githubUrl || "",
    };

    data.append("socialMedia", JSON.stringify(socialMedia));

    const profile = {
      gender: values.gender,
      dob: values.dob,
      address: values.address,
      ...(userData?.profile?.profilePic && !values.profilePic
        ? { profilePic: userData.profile.profilePic }
        : {}),
    };
    data.append("profile", JSON.stringify(profile));

    try {
      const result = await dispatch(applyForInstructorThunk(data)).unwrap();
      if (result.success) {
        if (userData?.email) {
          await dispatch(fetchUserData()); 
        }
        setSubmitStatus({ loading: false, error: null, success: true });
        toast.success(result.message || "Application submitted successfully");
      } else {
        throw result;
      }
    } catch (error: any) {
      console.error("Submission error:", error);

      const errorMessage = error.message || "Failed to submit application";
      const fieldErrors: Record<string, string> = {};

      if (
        error.success === false &&
        error.error?.field &&
        error.error?.message
      ) {
        const frontendField =
          fieldNameMapping[error.error.field] || error.error.field;
        fieldErrors[frontendField] = error.error.message;
        setErrors(fieldErrors);
      }

      setSubmitStatus({
        loading: false,
        error: Object.keys(fieldErrors).length === 0 ? errorMessage : null,
        success: false,
      });

      if (Object.keys(fieldErrors).length === 0) {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!userData) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        User data not available. Please try again later.
      </div>
    );
  }

  const initialValues: FormValues = {
    name: userData.name || "",
    email: userData.email || "",
    phone: userData.phone ? String(userData.phone) : "",
    qualification: userData.qualification || "",
    aboutMe: userData.aboutMe || "",
    gender: (userData.profile?.gender as "Male" | "Female" | "Other") || "",
    dob: userData.profile?.dob
      ? new Date(userData.profile.dob).toISOString().split("T")[0]
      : "",
    address: userData.profile?.address || "",
    experience: (userData.experience as "" | "0" | "1-2" | "3-5" | "5+") || "",
    linkedinUrl: userData.socialMedia?.linkedin || "",
    githubUrl: userData.socialMedia?.github || "",
  };

  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <Header />
      <div className="flex justify-center bg-gray-50 px-4 pt-24 pb-8">
        {userData.isRequested ? (
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden mx-6 mt-6 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
               Success
              </h2>
              <p className="text-gray-600 mb-6">
                You have successfully submitted your instructor application.
                Please wait for our response while we review your application.
              </p>
              {/* <button
                onClick={() => navigate("/dashboard")} // Replace with your desired route
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Continue
              </button> */}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-md overflow-hidden">
            {submitStatus.success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mx-6 mt-6">
                Application submitted successfully! We will review your
                application and get back to you soon.
              </div>
            )}
            {submitStatus.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-6 mt-6">
                Error: {submitStatus.error}
              </div>
            )}

            <div className="bg-gradient-to-r from-[#49bbbd] to-gray-500 p-6">
              <h1 className="text-2xl font-bold text-white">
                Apply to be an Instructor
              </h1>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({
                errors,
                touched,
                setFieldValue,
                setFieldTouched,
                validateField,
                isSubmitting,
              }) => (
                <Form className="p-6">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                        {profilePreview ? (
                          <img
                            src={profilePreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCircle className="w-20 h-20 text-gray-400" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleProfileImageChange(
                              e,
                              setFieldValue,
                              setFieldTouched,
                              validateField
                            )
                          }
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          id="profilePic"
                          name="profilePic"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-[#49bbbd] p-2 rounded-full text-white">
                          <Upload size={16} />
                        </div>
                      </div>
                      {errors.profilePic && (
                        <div className="text-red-500 text-sm mt-2 text-center">
                          {errors.profilePic}
                        </div>
                      )}
                      {!profilePreview && !errors.profilePic && (
                        <div className="text-gray-700 text-sm mt-2 text-center">
                          Profile picture is required
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name*{" "}
                        <span className="text-xs text-gray-500">
                          (min 3 chars, letters only)
                        </span>
                      </label>
                      <Field
                        type="text"
                        id="name"
                        name="name"
                        className={`w-full border ${
                          errors.name && touched.name
                            ? "border-red-500"
                            : "border-gray-400"
                        } rounded p-2.5 bg-white`}
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email*
                      </label>
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        className="w-full border border-gray-400 rounded p-2.5 bg-gray-100"
                        disabled
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        htmlFor="gender"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Gender*
                      </label>
                      <Field
                        as="select"
                        id="gender"
                        name="gender"
                        className={`w-full border ${
                          errors.gender && touched.gender
                            ? "border-red-500"
                            : "border-gray-400"
                        } rounded p-2.5 bg-white`}
                      >
                        <option value="">Select</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </Field>
                      <ErrorMessage
                        name="gender"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="dob"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Date of Birth*{" "}
                        <span className="text-xs text-gray-500">
                          (must be 16+ years old)
                        </span>
                      </label>
                      <Field
                        type="date"
                        id="dob"
                        name="dob"
                        className={`w-full border ${
                          errors.dob && touched.dob
                            ? "border-red-500"
                            : "border-gray-400"
                        } rounded p-2.5 bg-white`}
                      />
                      <ErrorMessage
                        name="dob"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number*{" "}
                        <span className="text-xs text-gray-500">
                          (10 digits)
                        </span>
                      </label>
                      <Field
                        type="tel"
                        id="phone"
                        name="phone"
                        className={`w-full border ${
                          errors.phone && touched.phone
                            ? "border-red-500"
                            : "border-gray-400"
                        } rounded p-2.5 bg-white`}
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="qualification"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Qualification*
                      </label>
                      <Field
                        type="text"
                        id="qualification"
                        name="qualification"
                        className={`w-full border ${
                          errors.qualification && touched.qualification
                            ? "border-red-500"
                            : "border-gray-400"
                        } rounded p-2.5 bg-white`}
                      />
                      <ErrorMessage
                        name="qualification"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        htmlFor="experience"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Experience (years)*
                      </label>
                      <Field
                        as="select"
                        id="experience"
                        name="experience"
                        className={`w-full border ${
                          errors.experience && touched.experience
                            ? "border-red-500"
                            : "border-gray-400"
                        } rounded p-2.5 bg-white`}
                      >
                        <option value="">Select</option>
                        <option value="0">0</option>
                        <option value="1-2">1-2 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5+">Above 5 years</option>
                      </Field>
                      <ErrorMessage
                        name="experience"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Address*
                      </label>
                      <Field
                        type="text"
                        id="address"
                        name="address"
                        className={`w-full border ${
                          errors.address && touched.address
                            ? "border-red-500"
                            : "border-gray-400"
                        } rounded p-2.5 bg-white`}
                      />
                      <ErrorMessage
                        name="address"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        htmlFor="linkedinUrl"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        LinkedIn Profile
                      </label>
                      <Field
                        type="url"
                        id="linkedinUrl"
                        name="linkedinUrl"
                        placeholder="https://linkedin.com/in/your-profile"
                        className={`w-full border ${
                          errors.linkedinUrl && touched.linkedinUrl
                            ? "border-red-500"
                            : "border-gray-400"
                        } rounded p-2.5 bg-white`}
                      />
                      <ErrorMessage
                        name="linkedinUrl"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="githubUrl"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        GitHub Profile
                      </label>
                      <Field
                        type="url"
                        id="githubUrl"
                        name="githubUrl"
                        placeholder="https://github.com/your-username"
                        className={`w-full border ${
                          errors.githubUrl && touched.githubUrl
                            ? "border-red-500"
                            : "border-gray-400"
                        } rounded p-2.5 bg-white`}
                      />
                      <ErrorMessage
                        name="githubUrl"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="aboutMe"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      About Me: Describe yourself briefly*{" "}
                      <span className="text-xs text-gray-500">
                        (min 20 chars)
                      </span>
                    </label>
                    <Field
                      as="textarea"
                      id="aboutMe"
                      name="aboutMe"
                      rows={4}
                      className={`w-full border ${
                        errors.aboutMe && touched.aboutMe
                          ? "border-red-500"
                          : "border-gray-400"
                      } rounded p-2.5 bg-white`}
                      placeholder="Your teaching experience and qualifications..."
                    />
                    <ErrorMessage
                      name="aboutMe"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Your CV*{" "}
                      <span className="text-xs text-gray-500">
                        (.pdf, .doc, .docx, max 10MB)
                      </span>
                    </label>
                    <div
                      className={`border-2 ${
                        errors.cv ? "border-red-500" : "border-gray-400"
                      } border-dashed rounded p-6 text-center`}
                    >
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                          handleCVChange(
                            e,
                            setFieldValue,
                            setFieldTouched,
                            validateField
                          )
                        }
                        className="w-full text-center"
                        id="cv"
                        name="cv"
                      />
                      {errors.cv && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.cv}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-md text-white bg-[#49bbbd] hover:bg-gray-600 disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={isSubmitting || submitStatus.loading}
                    >
                      {isSubmitting || submitStatus.loading
                        ? "Submitting..."
                        : "Submit Application"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default InstructorApplicationForm;