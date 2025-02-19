import { CalendarIcon, Upload } from 'lucide-react';

const StudentRegistrationForm = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Heading */}
        <div className="bg-[#49bbbd]/10 p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Student Registration Form</h1>
        </div>

        <form className="p-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden">
                <img
                  src="/api/placeholder/96/96"
                  alt="upload profile picture"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-[#49bbbd] rounded-full cursor-pointer hover:bg-[#3da7a9] transition-colors">
                <Upload className="w-4 h-4 text-white" />
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Name of Student</label>
              <input
                type="text"
                className="mt-1 w-full px-3 py-2 bg-[#49bbbd]/5 border border-[#49bbbd]/20 rounded-md focus:ring-2 focus:ring-[#49bbbd]/20 focus:border-[#49bbbd]"
                placeholder="Enter first name"
              />
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-600">Last Name</label>
              <input
                type="text"
                className="mt-1 w-full px-3 py-2 bg-[#49bbbd]/5 border border-[#49bbbd]/20 rounded-md focus:ring-2 focus:ring-[#49bbbd]/20 focus:border-[#49bbbd]"
                placeholder="Enter last name"
              />
            </div> */}
          </div>

          {/* Date of Birth and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
              <div className="relative mt-1">
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-[#49bbbd]/5 border border-[#49bbbd]/20 rounded-md focus:ring-2 focus:ring-[#49bbbd]/20 focus:border-[#49bbbd] appearance-none"
                />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Gender</label>
              <select
                className="mt-1 w-full px-3 py-2 bg-[#49bbbd]/5 border border-[#49bbbd]/20 rounded-md focus:ring-2 focus:ring-[#49bbbd]/20 focus:border-[#49bbbd]"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Mobile Number</label>
            <input
              type="tel"
              className="mt-1 w-full px-3 py-2 bg-[#49bbbd]/5 border border-[#49bbbd]/20 rounded-md focus:ring-2 focus:ring-[#49bbbd]/20 focus:border-[#49bbbd]"
              placeholder="Enter mobile number"
            />
          </div>

          {/* Educational Qualification */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Educational Qualification</label>
            <input
              type="text"
              className="mt-1 w-full px-3 py-2 bg-[#49bbbd]/5 border border-[#49bbbd]/20 rounded-md focus:ring-2 focus:ring-[#49bbbd]/20 focus:border-[#49bbbd]"
              placeholder="Enter qualification"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Address</label>
            <textarea
              rows={3}
              className="mt-1 w-full px-3 py-2 bg-[#49bbbd]/5 border border-[#49bbbd]/20 rounded-md focus:ring-2 focus:ring-[#49bbbd]/20 focus:border-[#49bbbd]"
              placeholder="Enter your address"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#49bbbd] text-white rounded-md hover:bg-[#3da7a9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#49bbbd]/50"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistrationForm;