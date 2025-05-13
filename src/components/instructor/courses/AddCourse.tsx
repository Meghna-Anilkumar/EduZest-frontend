import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Sidebar from "../InstructorSidebar";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategoriesAction } from "../../../redux/actions/categoryActions";
import { fetchUserData } from "../../../redux/actions/auth/fetchUserdataAction";
import { AppDispatch, RootState } from "../../../redux/store";
import { useCourseForm } from "../../context/CourseFormContext";
import InstructorNavbar from "../InstructorNavbar";

const CourseSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, "Course title must be at least 5 characters")
    .max(100, "Course title must be less than 100 characters")
    .required("Course title is required"),
  description: Yup.string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be less than 1000 characters")
    .required("Description is required"),
  categoryRef: Yup.string().required("Category is required"),
  language: Yup.string().required("Language is required"),
  level: Yup.string().required("Level is required"),
  pricing: Yup.object().shape({
    type: Yup.string().required("Pricing option is required"),
    amount: Yup.number().when("type", {
      is: "paid",
      then: (schema) =>
        schema
          .min(1, "Price must be at least 1")
          .max(999, "Price must be less than 999")
          .required("Price is required for paid courses"),
      otherwise: (schema) => schema.notRequired(),
    }),
  }),
  thumbnail: Yup.mixed().required("Course thumbnail is required"),
});

interface Category {
  _id: string;
  categoryName: string;
  isActive: boolean;
}

const AddCoursePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("courses");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { data: categories, error: categoryError } = useSelector(
    (state: RootState) => state.category
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { formData, updateFormData, resetFormData } = useCourseForm();

  const courseDataFromNavigation = location.state?.courseData;

  useEffect(() => {
    dispatch(getAllCategoriesAction({ page: 1, limit: 100 }));

    const fetchData = async () => {
      if (!isAuthenticated) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await dispatch(fetchUserData()).unwrap();
      } catch (err: any) {
        setError(err.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    if (courseDataFromNavigation) {
      console.log(
        "Restoring courseData from navigation state:",
        courseDataFromNavigation
      );
      updateFormData({
        title: courseDataFromNavigation.title || "",
        description: courseDataFromNavigation.description || "",
        categoryRef: courseDataFromNavigation.categoryRef || "",
        language: courseDataFromNavigation.language || "",
        level: courseDataFromNavigation.level || "",
        pricing: courseDataFromNavigation.pricing || {
          type: "free",
          amount: 0,
        },
        thumbnail: courseDataFromNavigation.thumbnail || null,
        thumbnailPreview: courseDataFromNavigation.thumbnailPreview || null,
        isSubmitted: false,
      });
    }
  }, [dispatch, courseDataFromNavigation, updateFormData, isAuthenticated]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: any
  ) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      console.log("Thumbnail file selected:", file.name);
      setFieldValue("thumbnail", file);
      const reader = new FileReader();
      reader.onload = () => {
        console.log("Thumbnail preview generated");
        updateFormData({
          thumbnail: file,
          thumbnailPreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        open={sidebarOpen}
        currentPage={currentPage}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        setCurrentPage={setCurrentPage}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                Create New Course
              </h1>
              <InstructorNavbar loading={loading} error={error} />{" "}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg px-8 py-6">
            {categoryError && (
              <div className="mb-4 text-red-600">{categoryError}</div>
            )}
            <Formik
              initialValues={{
                title: formData.title || "",
                description: formData.description || "",
                categoryRef: formData.categoryRef || "",
                language: formData.language || "",
                level: formData.level || "",
                pricing: formData.pricing || { type: "free", amount: 0 },
                thumbnail: formData.thumbnail || null,
              }}
              validationSchema={CourseSchema}
              validateOnMount={false}
              validateOnChange={true}
              validateOnBlur={true}
              onSubmit={(values, { setErrors }) => {
                console.log("Form submitted with values:", values);
                const courseData = {
                  title: values.title,
                  description: values.description,
                  categoryRef: values.categoryRef,
                  language: values.language,
                  level: values.level,
                  pricing: {
                    type: values.pricing.type as "free" | "paid",
                    amount:
                      values.pricing.type === "paid"
                        ? Number(values.pricing.amount)
                        : 0,
                  },
                  thumbnail: values.thumbnail,
                  thumbnailPreview: formData.thumbnailPreview,
                };

                console.log("Updating formData in context:", courseData);
                updateFormData({
                  ...courseData,
                  thumbnailPreview: formData.thumbnailPreview,
                  isSubmitted: true,
                });

                const navigationPath = "/instructor/courses/addLesson";
                console.log("Navigating to:", navigationPath);
                console.log(
                  "Passing courseData in navigation state:",
                  courseData
                );
                navigate(navigationPath, { state: { courseData } });
              }}
            >
              {({ errors, touched, setFieldValue, values }) => (
                <Form
                  className="space-y-6"
                  onChange={() => {
                    console.log("Form values changed:", values);
                    updateFormData({
                      title: values.title,
                      description: values.description,
                      categoryRef: values.categoryRef,
                      language: values.language,
                      level: values.level,
                      pricing: {
                        type: values.pricing.type as "free" | "paid",
                        amount: values.pricing.amount,
                      },
                    });
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left column */}
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Course Title
                        </label>
                        <Field
                          type="text"
                          name="title"
                          id="title"
                          className={`mt-1 block w-full rounded-md shadow-sm py-3 px-4 border ${
                            errors.title && touched.title
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:border-[#49BBBD] focus:ring-[#49BBBD]"
                          }`}
                          placeholder="Enter an engaging title for your course"
                        />
                        <ErrorMessage
                          name="title"
                          component="div"
                          className="mt-1 text-sm text-red-600"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Description
                        </label>
                        <Field
                          as="textarea"
                          name="description"
                          id="description"
                          rows={6}
                          className={`mt-1 block w-full rounded-md shadow-sm py-3 px-4 border ${
                            errors.description && touched.description
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:border-[#49BBBD] focus:ring-[#49BBBD]"
                          }`}
                          placeholder="Provide a detailed description of your course"
                        />
                        <ErrorMessage
                          name="description"
                          component="div"
                          className="mt-1 text-sm text-red-600"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Category */}
                        <div>
                          <label
                            htmlFor="categoryRef"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Category
                          </label>
                          <Field
                            as="select"
                            name="categoryRef"
                            id="categoryRef"
                            className={`mt-1 block w-full rounded-md shadow-sm py-3 px-4 border ${
                              errors.categoryRef && touched.categoryRef
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:border-[#49BBBD] focus:ring-[#49BBBD]"
                            }`}
                          >
                            <option value="">Select a category</option>
                            {categories
                              ?.filter(
                                (category: Category) => category.isActive
                              )
                              .map((category: Category) => (
                                <option key={category._id} value={category._id}>
                                  {category.categoryName}
                                </option>
                              ))}
                          </Field>
                          <ErrorMessage
                            name="categoryRef"
                            component="div"
                            className="mt-1 text-sm text-red-600"
                          />
                        </div>

                        {/* Language */}
                        <div>
                          <label
                            htmlFor="language"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Language
                          </label>
                          <Field
                            as="select"
                            name="language"
                            id="language"
                            className={`mt-1 block w-full rounded-md shadow-sm py-3 px-4 border ${
                              errors.language && touched.language
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:border-[#49BBBD] focus:ring-[#49BBBD]"
                            }`}
                          >
                            <option value="">Select a language</option>
                            <option value="english">English</option>
                            <option value="spanish">Spanish</option>
                            <option value="french">French</option>
                            <option value="german">German</option>
                            <option value="hindi">Hindi</option>
                            <option value="mandarin">Mandarin</option>
                            <option value="arabic">Arabic</option>
                          </Field>
                          <ErrorMessage
                            name="language"
                            component="div"
                            className="mt-1 text-sm text-red-600"
                          />
                        </div>

                        {/* Level */}
                        <div>
                          <label
                            htmlFor="level"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Level
                          </label>
                          <Field
                            as="select"
                            name="level"
                            id="level"
                            className={`mt-1 block w-full rounded-md shadow-sm py-3 px-4 border ${
                              errors.level && touched.level
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:border-[#49BBBD] focus:ring-[#49BBBD]"
                            }`}
                          >
                            <option value="">Select a level</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="all">All Levels</option>
                          </Field>
                          <ErrorMessage
                            name="level"
                            component="div"
                            className="mt-1 text-sm text-red-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Course Thumbnail
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            {formData.thumbnailPreview ? (
                              <div className="mb-3">
                                <img
                                  src={formData.thumbnailPreview}
                                  alt="Thumbnail preview"
                                  className="mx-auto h-40 w-full object-cover rounded"
                                />
                              </div>
                            ) : (
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="thumbnail"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-[#49BBBD] hover:text-[#3e9da0] focus-within:outline-none"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="thumbnail"
                                  name="thumbnail"
                                  type="file"
                                  className="sr-only"
                                  onChange={(e) =>
                                    handleFileChange(e, setFieldValue)
                                  }
                                  accept="image/*"
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                        </div>
                        {touched.thumbnail && errors.thumbnail && (
                          <div className="mt-1 text-sm text-red-600">
                            {errors.thumbnail as string}
                          </div>
                        )}
                      </div>

                      <div>
                        <fieldset>
                          <legend className="block text-sm font-medium text-gray-700">
                            Pricing
                          </legend>
                          <div className="mt-4 space-y-4">
                            <div className="flex items-center">
                              <Field
                                type="radio"
                                id="free"
                                name="pricing.type"
                                value="free"
                                className="h-4 w-4 text-[#49BBBD] border-gray-300 focus:ring-[#49BBBD]"
                              />
                              <label
                                htmlFor="free"
                                className="ml-3 block text-sm font-medium text-gray-700"
                              >
                                Free
                              </label>
                            </div>
                            <div className="flex items-center">
                              <Field
                                type="radio"
                                id="paid"
                                name="pricing.type"
                                value="paid"
                                className="h-4 w-4 text-[#49BBBD] border-gray-300 focus:ring-[#49BBBD]"
                              />
                              <label
                                htmlFor="paid"
                                className="ml-3 block text-sm font-medium text-gray-700"
                              >
                                Paid
                              </label>
                            </div>
                          </div>
                        </fieldset>
                      </div>

                      {values.pricing.type === "paid" && (
                        <div>
                          <label
                            htmlFor="pricing.amount"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Price ($)
                          </label>
                          <Field
                            type="number"
                            name="pricing.amount"
                            id="pricing.amount"
                            className={`mt-1 block w-full rounded-md shadow-sm py-3 px-4 border ${
                              errors.pricing?.amount && touched.pricing?.amount
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:border-[#49BBBD] focus:ring-[#49BBBD]"
                            }`}
                            placeholder="29.99"
                          />
                          <ErrorMessage
                            name="pricing.amount"
                            component="div"
                            className="mt-1 text-sm text-red-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        console.log(
                          "Cancel button clicked, resetting form data"
                        );
                        resetFormData();
                        navigate("/instructor/courses");
                      }}
                      className="px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#49BBBD]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#49BBBD] hover:bg-[#3e9da0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#49BBBD]"
                    >
                      Add Lessons
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddCoursePage;
