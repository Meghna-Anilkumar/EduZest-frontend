import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { editCourseAction } from '../../../redux/actions/courseActions';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ConfirmationModal from '@/components/common/ConfirmationModal';

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

const validationSchema = Yup.object({
  title: Yup.string()
    .max(100, 'Title must be 100 characters or less')
    .required('Course title is required'),
  description: Yup.string()
    .max(500, 'Description must be 500 characters or less')
    .nullable(),
  language: Yup.string()
    .max(50, 'Language must be 50 characters or less')
    .required('Language is required'),
  level: Yup.string()
    .oneOf(['beginner', 'intermediate', 'advanced'], 'Invalid level')
    .required('Level is required'),
  pricing: Yup.object({
    type: Yup.string()
      .oneOf(['free', 'paid'], 'Invalid pricing type')
      .required('Pricing type is required'),
    amount: Yup.number()
      .min(0, 'Amount cannot be negative')
      .when('type', {
        is: 'paid',
        then: (schema) => schema.required('Amount is required for paid courses').min(0),
        otherwise: (schema) => schema.transform(() => 0).nullable(),
      }),
  }),
  thumbnailFile: Yup.mixed<File>()
    .nullable()
    .test('fileType', 'Unsupported file type', (value) =>
      value ? ['image/jpeg', 'image/png', 'image/gif'].includes(value.type) : true
    )
    .test('fileSize', 'File size too large (max 5MB)', (value) =>
      value ? value.size <= 5 * 1024 * 1024 : true
    ),
});

const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, onClose, onSave }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const formik = useFormik({
    initialValues: {
      title: course.title,
      description: course.description,
      language: course.language,
      level: course.level,
      pricing: { type: course.pricing.type, amount: course.pricing.amount },
      thumbnailFile: null as File | null,
    },
    validationSchema,
    onSubmit: async (values) => {
      // Instead of submitting directly, show confirmation modal
      setShowConfirmation(true);
    },
  });

  const handleConfirmSubmit = async () => {
    if (isUploading) return;

    setIsUploading(true);
    try {
      const updatedCourse = {
        ...course,
        title: formik.values.title,
        description: formik.values.description,
        language: formik.values.language,
        level: formik.values.level,
        pricing: formik.values.pricing,
      };

      const formData = new FormData();
      formData.append('courseData', JSON.stringify(updatedCourse));
      if (formik.values.thumbnailFile) {
        formData.append('thumbnail', formik.values.thumbnailFile);
      }

      const response = await dispatch(
        editCourseAction({ courseId: course._id, formData })
      ).unwrap();

      if (response) {
        console.log('Course updated successfully:', response);
        onSave(response);
        onClose();
      } else {
        throw new Error('Failed to update course');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update course. Please try again.';
      console.error('Error updating course:', errorMessage);
    } finally {
      setIsUploading(false);
      setShowConfirmation(false);
    }
  };

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(course.thumbnail);

  useEffect(() => {
    if (formik.values.thumbnailFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(formik.values.thumbnailFile);
    } else {
      setThumbnailPreview(course.thumbnail);
    }
  }, [formik.values.thumbnailFile, course.thumbnail]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60 transition-opacity duration-300">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 m-4 max-h-[90vh] overflow-y-auto transform transition-transform duration-300 scale-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Edit Course</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              disabled={isUploading}
            >
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
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#49BBBD] ${
                  formik.touched.title && formik.errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isUploading}
              />
              {formik.touched.title && formik.errors.title && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full border rounded-lg px-4 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-[#49BBBD] ${
                  formik.touched.description && formik.errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isUploading}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.description}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Language <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="language"
                value={formik.values.language}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#49BBBD] ${
                  formik.touched.language && formik.errors.language ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isUploading}
              />
              {formik.touched.language && formik.errors.language && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.language}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Level <span className="text-red-500">*</span>
              </label>
              <select
                name="level"
                value={formik.values.level}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#49BBBD] ${
                  formik.touched.level && formik.errors.level ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isUploading}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {formik.touched.level && formik.errors.level && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.level}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Pricing Type <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pricing.type"
                    value="free"
                    checked={formik.values.pricing.type === 'free'}
                    onChange={() => {
                      formik.setFieldValue('pricing.type', 'free');
                      formik.setFieldValue('pricing.amount', 0);
                    }}
                    onBlur={formik.handleBlur}
                    className="mr-2"
                    disabled={isUploading}
                  />
                  Free
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pricing.type"
                    value="paid"
                    checked={formik.values.pricing.type === 'paid'}
                    onChange={() => formik.setFieldValue('pricing.type', 'paid')}
                    onBlur={formik.handleBlur}
                    className="mr-2"
                    disabled={isUploading}
                  />
                  Paid
                </label>
              </div>
              {formik.touched.pricing?.type && formik.errors.pricing?.type && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.pricing.type}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Pricing Amount{' '}
                {formik.values.pricing.type === 'paid' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="number"
                name="pricing.amount"
                value={formik.values.pricing.amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#49BBBD] ${
                  formik.touched.pricing?.amount && formik.errors.pricing?.amount
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                disabled={formik.values.pricing.type === 'free' || isUploading}
                min="0"
              />
              {formik.touched.pricing?.amount && formik.errors.pricing?.amount && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.pricing.amount}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Upload Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  formik.setFieldValue('thumbnailFile', file);
                }}
                onBlur={formik.handleBlur}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#49BBBD] ${
                  formik.touched.thumbnailFile && formik.errors.thumbnailFile ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isUploading}
              />
              {formik.touched.thumbnailFile && formik.errors.thumbnailFile && (
                <p className="text-red-500 text-sm mt-1">{String(formik.errors.thumbnailFile)}</p>
              )}
              {thumbnailPreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Thumbnail Preview:</p>
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail Preview"
                    className="mt-2 max-w-[200px] h-auto rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#3a9a9c] transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isUploading || !formik.isValid || !formik.dirty}
              >
                {isUploading ? 'Uploading...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        message="Are you sure you want to save these changes to your course?"
      />
    </>
  );
};

export default EditCourseModal;