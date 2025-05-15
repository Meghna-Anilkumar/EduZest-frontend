import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { editCourseAction } from '../../../redux/actions/courseActions';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

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

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
    }
  };

  const handleSave = async () => {
    if (!editedCourse.title.trim()) {
      toast.error('Course title is required.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('courseData', JSON.stringify(editedCourse));
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      console.log('Dispatching editCourseAction to update course:', course._id, editedCourse);

      const response = await dispatch(editCourseAction({ courseId: course._id, formData })).unwrap();

      console.log('editCourseAction response:', response);

      if (response) {
        toast.success('Course updated successfully!');
        onSave(response);
        onClose();
      } else {
        throw new Error('Failed to update course');
      }
    } catch (error: any) {
      console.error('Error updating course:', error);
      const errorMessage = error.message || 'Failed to update course. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 m-4 overflow-auto">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Edit Course</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900" disabled={isUploading}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
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
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              value={editedCourse.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full border rounded-md px-3 py-2 h-24"
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Language</label>
            <input
              type="text"
              value={editedCourse.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Level</label>
            <select
              value={editedCourse.level}
              onChange={(e) => handleInputChange('level', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              disabled={isUploading}
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
              disabled={editedCourse.pricing.type === 'free' || isUploading}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Upload Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="w-full border rounded-md px-3 py-2"
              disabled={isUploading}
            />
            {thumbnailFile && (
              <p className="text-sm text-gray-600 mt-2">Selected: {thumbnailFile.name}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c] disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCourseModal;