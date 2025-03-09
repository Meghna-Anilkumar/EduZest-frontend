import React, { useState, useEffect, Suspense, lazy } from "react";
import { Upload, UserCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { applyForInstructorThunk } from "../../redux/actions/userActions";
import { AppDispatch, RootState } from "../../redux/store";
import { toast } from "react-toastify";
import { fetchUserData } from "../../redux/actions/auth/fetchUserdataAction";
const Header = lazy(() => import("../common/users/Header"));

interface FormData {
  name: string;
  email: string;
  gender: "Male" | "Female" | "Other" | "";
  dob: string;
  phone: string;
  qualification: string;
  aboutMe: string;
}

const InstructorApplicationForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); // Add useNavigate hook
  const { userData, isAuthenticated } = useSelector((state: RootState) => state.user);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    error: null as string | null,
    fieldErrors: {} as Record<string, string>,
    success: false,
  });

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    gender: "",
    dob: "",
    phone: "",
    qualification: "",
    aboutMe: "",
  });

  // Mapping of backend field names to frontend field names
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
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login"); 
    } else if (!userData) {
      dispatch(fetchUserData());
    }
  }, [dispatch, isAuthenticated, userData, navigate]);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        qualification: userData.qualification || "",
        aboutMe: userData.aboutMe || "",
        gender: userData.profile?.gender || "",
        dob: userData.profile?.dob
          ? new Date(userData.profile.dob).toISOString().split("T")[0]
          : "",
      });
      if (userData.profile?.profilePic) {
        setProfilePreview(userData.profile.profilePic);
      }
    }
  }, [userData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (submitStatus.fieldErrors[id]) {
      setSubmitStatus((prev) => ({
        ...prev,
        fieldErrors: { ...prev.fieldErrors, [id]: "" },
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCvFile(file);
      setSubmitStatus((prev) => ({ ...prev, fieldErrors: { ...prev.fieldErrors, cv: "" } }));
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result as string);
      reader.readAsDataURL(file);
      setSubmitStatus((prev) => ({
        ...prev,
        fieldErrors: { ...prev.fieldErrors, profilePic: "" },
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!profileImage && !userData?.profile?.profilePic) {
      errors.profilePic = "Profile picture is required";
    }
    if (!cvFile) {
      errors.cv = "CV is required";
    }
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    if (!formData.gender) {
      errors.gender = "Gender is required";
    }
    if (!formData.dob) {
      errors.dob = "Date of birth is required";
    }
    if (!formData.phone) {
      errors.phone = "Phone number is required";
    }
    if (!formData.qualification.trim()) {
      errors.qualification = "Qualification is required";
    }
    if (!formData.aboutMe.trim()) {
      errors.aboutMe = "About Me is required";
    }

    if (Object.keys(errors).length > 0) {
      setSubmitStatus((prev) => ({ ...prev, fieldErrors: errors }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitStatus({ loading: true, error: null, fieldErrors: {}, success: false });

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value && key !== "gender" && key !== "dob") {
        data.append(key, value);
      }
    });

    if (profileImage) {
      data.append("profilePic", profileImage);
    } else if (userData?.profile?.profilePic) {
      data.append("profilePic", userData.profile.profilePic);
    }

    if (cvFile) {
      data.append("cv", cvFile);
    }

    const profile = {
      gender: formData.gender,
      dob: formData.dob,
      ...(userData?.profile?.profilePic && !profileImage
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
        setSubmitStatus({ loading: false, error: null, fieldErrors: {}, success: true });
        toast.success(result.message || "Application submitted successfully");
      } else {
        throw result;
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      
      const errorMessage = error.message || "Failed to submit application";
      const fieldErrors: Record<string, string> = {};

      if (error.success === false && error.error?.field && error.error?.message) {
        const frontendField = fieldNameMapping[error.error.field] || error.error.field;
        fieldErrors[frontendField] = error.error.message;
      } else if (error.success === false && error.message) {
        setSubmitStatus((prev) => ({ ...prev, error: error.message }));
      } else {
        setSubmitStatus((prev) => ({ ...prev, error: errorMessage }));
      }

      setSubmitStatus({
        loading: false,
        error: Object.keys(fieldErrors).length === 0 ? errorMessage : null,
        fieldErrors,
        success: false,
      });

      if (Object.keys(fieldErrors).length === 0) {
        toast.error(errorMessage);
      }
    }
  };

  // Move authentication check to useEffect to avoid rendering issues
  // Removed from here since it's handled in useEffect
  // if (!isAuthenticated) {
  //   return <div className="w-full h-screen flex items-center justify-center">Please log in to apply as an instructor.</div>;
  // }

  if (!userData) {
    return <div className="w-full h-screen flex items-center justify-center">Loading user data...</div>;
  }

  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading...</div>}>
      <Header />
      <div className="flex justify-center bg-gray-50 px-4 pt-24 pb-8">
        {userData.isRequested ? (
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-6 rounded relative mx-6 mt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Application Submitted Successfully</h2>
              <p>Please wait for our response while we review your application.</p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-md overflow-hidden">
            {submitStatus.success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mx-6 mt-6">
                Application submitted successfully! We will review your application and get back to you soon.
              </div>
            )}
            {submitStatus.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-6 mt-6">
                Error: {submitStatus.error}
              </div>
            )}
            <div className="bg-gradient-to-r from-[#49bbbd] to-gray-500 p-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Apply to be an Instructor</h1>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-20 h-20 text-gray-400" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    id="profilePic"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-[#49bbbd] p-2 rounded-full text-white">
                    <Upload size={16} />
                  </div>
                </div>
                {submitStatus.fieldErrors.profilePic && (
                  <p className="text-red-500 text-sm">{submitStatus.fieldErrors.profilePic}</p>
                )}
              </div>
            </div>
            <form className="p-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-400 rounded p-2.5 bg-white"
                    required
                  />
                  {submitStatus.fieldErrors.name && (
                    <p className="text-red-500 text-sm">{submitStatus.fieldErrors.name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-400 rounded p-2.5 bg-gray-100"
                    required
                    disabled
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-gray-400 rounded p-2.5 bg-white"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                  {submitStatus.fieldErrors.gender && (
                    <p className="text-red-500 text-sm">{submitStatus.fieldErrors.gender}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    id="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full border border-gray-400 rounded p-2.5 bg-white"
                    required
                  />
                  {submitStatus.fieldErrors.dob && (
                    <p className="text-red-500 text-sm">{submitStatus.fieldErrors.dob}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-400 rounded p-2.5 bg-white"
                    required
                  />
                  {submitStatus.fieldErrors.phone && (
                    <p className="text-red-500 text-sm">{submitStatus.fieldErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    id="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full border border-gray-400 rounded p-2.5 bg-white"
                    required
                  />
                  {submitStatus.fieldErrors.qualification && (
                    <p className="text-red-500 text-sm">{submitStatus.fieldErrors.qualification}</p>
                  )}
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700 mb-1">Describe yourself briefly</label>
                <textarea
                  id="aboutMe"
                  value={formData.aboutMe}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-400 rounded p-2.5 bg-white"
                  placeholder="Your teaching experience and qualifications..."
                  required
                />
                {submitStatus.fieldErrors.aboutMe && (
                  <p className="text-red-500 text-sm">{submitStatus.fieldErrors.aboutMe}</p>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Your CV</label>
                <div className="border-2 border-gray-400 border-dashed rounded p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="w-full text-center"
                    required={!cvFile}
                  />
                  {cvFile && <p className="mt-2 text-sm text-gray-600">Selected: {cvFile.name}</p>}
                  {submitStatus.fieldErrors.cv && (
                    <p className="text-red-500 text-sm">{submitStatus.fieldErrors.cv}</p>
                  )}
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-md text-white bg-[#49bbbd] hover:bg-gray-600 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={submitStatus.loading}
                >
                  {submitStatus.loading ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default InstructorApplicationForm;