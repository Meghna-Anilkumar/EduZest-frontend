import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import { Camera, Search, User, Menu, X, Lock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../redux/store";
import { updateUserProfileThunk } from "../../redux/actions/userActions";
const Header = lazy(() => import("../../components/common/users/Header"));

const StudentProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.user.userData);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define the profile state with explicit typing
  interface ProfileState {
    username: string;
    email: string;
    additionalEmail: string;
    dob: string;
    gender: string;
    profilePic: string | null; // For preview
    file?: File; // For file upload
  }

  const [profile, setProfile] = useState<ProfileState>({
    username: "",
    email: "",
    additionalEmail: "",
    dob: "",
    gender: "",
    profilePic: null,
    file: undefined,
  });

  const [activeTab, setActiveTab] = useState("Profile");
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate profile state from Redux userData
  useEffect(() => {
    console.log("User Data from Redux:", userData);
    if (userData) {
      setProfile({
        username: userData.name || "",
        email: userData.email || "",
        additionalEmail: userData.studentDetails?.additionalEmail || "",
        dob: userData.profile?.dob
          ? new Date(userData.profile.dob).toISOString().split("T")[0]
          : "",
        gender: userData.profile?.gender || "",
        profilePic: userData.profile?.profilePic || null,
        file: undefined, // Reset file on load
      });
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({
          ...prev,
          profilePic: reader.result as string, // Preview image
          file, // Store the raw file for upload
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePic = () => {
    setProfile((prev) => ({
      ...prev,
      profilePic: null,
      file: undefined, // Clear the file as well
    }));
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("email", profile.email);
    formData.append("username", profile.username);
    formData.append("additionalEmail", profile.additionalEmail || "");
    formData.append("dob", profile.dob || "");
    formData.append("gender", profile.gender || "");
    if (profile.file) {
      formData.append("profilePic", profile.file); // Append the raw file
    }

    // Debug FormData contents (FormData doesn't log directly)
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    dispatch(updateUserProfileThunk(formData));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Suspense fallback for the Header component */}
      <Suspense
        fallback={
          <div className="h-16 bg-white border-b shadow-sm flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <Header />
      </Suspense>

      {/* Settings subheader */}
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
          {/* Mobile menu toggle button */}
          <div className="md:hidden p-4 border-b">
            <button
              onClick={toggleMobileMenu}
              className="flex items-center justify-between w-full py-2 px-4 rounded-lg bg-gray-50 text-gray-700"
            >
              <span className="font-medium">{activeTab}</span>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Sidebar navigation - mobile */}
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

          {/* Sidebar navigation - desktop */}
          <div className="hidden md:block w-64 border-r p-4 space-y-1">
            {["Profile", "Account", "Notifications"].map((tab) => (
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

          {/* Main content area */}
          <div className="flex-1 p-4 md:p-6">
            <div className="max-w-2xl mx-auto md:mx-0">
              {/* Profile Picture Section */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Profile Picture</h3>
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {profile.profilePic ? (
                        <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
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
                    <button
                      onClick={handleRemoveProfilePic}
                      className="text-red-500 font-medium hover:text-red-600 text-center sm:text-left"
                    >
                      Delete picture
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

              {/* Form Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Email</label>
                  <input
                    type="email"
                    name="additionalEmail"
                    value={profile.additionalEmail || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter additional email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={profile.dob || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={profile.gender || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Change Password Button */}
              <div className="mt-6">
                <button
                  onClick={handleChangePassword}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg border hover:bg-gray-200 w-full sm:w-auto transition-colors duration-200"
                >
                  <Lock className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center sm:justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaved}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 w-full sm:w-auto"
                >
                  {isSaved ? "Saved!" : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;