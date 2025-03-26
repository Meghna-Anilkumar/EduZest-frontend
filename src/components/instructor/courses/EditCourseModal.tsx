import React, { useState } from 'react';

interface Course {
  _id: string;
  title: string;
  description: string;
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  pricing: { type: 'free' | 'paid'; amount: number };
  thumbnail: string;
}

interface EditCourseModalProps {
  course: Course;
  onClose: () => void;
  onSave: (updatedCourse: Course) => void;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, onClose, onSave }) => {
  const [editedCourse, setEditedCourse] = useState({ ...course });

  const handleInputChange = (field: keyof Course | 'amount', value: string | number) => {
    if (field === 'amount') {
      setEditedCourse({
        ...editedCourse,
        pricing: { ...editedCourse.pricing, amount: Number(value) },
      });
    } else {
      setEditedCourse({ ...editedCourse, [field]: value });
    }
  };

  const handleSave = () => {
    onSave(editedCourse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 m-4 overflow-auto">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Edit Course</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Course Title</label>
            <input
              type="text"
              value={editedCourse.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              value={editedCourse.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full border rounded-md px-3 py-2 h-24"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Language</label>
            <input
              type="text"
              value={editedCourse.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Level</label>
            <select
              value={editedCourse.level}
              onChange={(e) => handleInputChange('level', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Pricing Amount</label>
            <input
              type="number"
              value={editedCourse.pricing.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              disabled={editedCourse.pricing.type === 'free'}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c]"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCourseModal;