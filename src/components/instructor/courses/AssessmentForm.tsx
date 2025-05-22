import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { IAssessment, IQuestion } from "../../../interface/IAssessment";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface AssessmentFormProps {
  assessment?: IAssessment | null;
  onSave: (assessment: IAssessment) => void;
  onCancel: () => void;
}

// Validation schema using Yup
const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters")
    .required("Description is required"),
  questions: Yup.array()
    .of(
      Yup.object({
        text: Yup.string()
          .min(5, "Question must be at least 5 characters")
          .max(300, "Question must not exceed 300 characters")
          .required("Question text is required"),
        marks: Yup.number()
          .min(1, "Marks must be at least 1")
          .max(100, "Marks must not exceed 100")
          .required("Marks are required"),
        options: Yup.array()
          .of(
            Yup.object({
              text: Yup.string()
                .min(1, "Option text is required")
                .max(150, "Option must not exceed 150 characters")
                .required("Option text is required"),
            })
          )
          .min(4, "Must have exactly 4 options")
          .max(4, "Must have exactly 4 options"),
        correctOption: Yup.string()
          .oneOf(["A", "B", "C", "D"], "Must select a valid option")
          .required("Correct option is required"),
      })
    )
    .min(1, "At least one question is required")
    .required("Questions are required"),
});

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  assessment,
  onSave,
  onCancel,
}) => {
  const { courseId } = useParams<{ courseId: string }>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formValues, setFormValues] = useState<any>(null);

  // Initial values for Formik
  const initialValues = {
    title: assessment?.title || "",
    description: assessment?.description || "",
    questions:
      assessment?.questions.length > 0
        ? assessment.questions
        : [
            {
              id: "q1",
              text: "",
              options: [
                { id: "A", text: "" },
                { id: "B", text: "" },
                { id: "C", text: "" },
                { id: "D", text: "" },
              ],
              correctOption: "A",
              marks: 1,
            },
          ],
  };

  const handleSubmit = (values: any) => {
    if (!courseId) {
      toast.error("Course ID is missing");
      return;
    }
    setFormValues(values);
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    if (!formValues || !courseId) return;

    const totalMarks = formValues.questions.reduce(
      (sum: number, question: IQuestion) => sum + (question.marks || 0),
      0
    );

    const newAssessment: IAssessment = {
      _id: assessment?._id || "",
      courseId,
      moduleTitle: assessment?.moduleTitle || "",
      title: formValues.title,
      description: formValues.description,
      questions: formValues.questions,
      totalMarks,
      createdAt: assessment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newAssessment);
    setShowConfirmation(false);
    setFormValues(null);
  };

  const addQuestion = (questions: IQuestion[], push: (obj: any) => void) => {
    const newQuestion: IQuestion = {
      id: `q${questions.length + 1}`,
      text: "",
      options: [
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" },
      ],
      correctOption: "A",
      marks: 1,
    };
    push(newQuestion);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">
            {assessment ? "Edit Assessment" : "Create Assessment"}
          </h2>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, isValid, dirty }) => {
              const totalMarks = values.questions.reduce(
                (sum: number, question: IQuestion) =>
                  sum + (question.marks || 0),
                0
              );

              return (
                <Form>
                  {/* Title Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="title"
                      className="block text-gray-700 font-medium mb-1"
                    >
                      Title *
                    </label>
                    <Field
                      type="text"
                      id="title"
                      name="title"
                      className={`w-full border rounded-md p-2 ${
                        errors.title && touched.title
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter assessment title"
                    />
                    <ErrorMessage
                      name="title"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Description Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="description"
                      className="block text-gray-700 font-medium mb-1"
                    >
                      Description *
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows={4}
                      className={`w-full border rounded-md p-2 ${
                        errors.description && touched.description
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter assessment description"
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Questions Section */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Questions *</h3>
                    <FieldArray name="questions">
                      {({ push, remove }) => (
                        <>
                          {values.questions.map(
                            (question: IQuestion, qIndex: number) => (
                              <div
                                key={qIndex}
                                className="mb-6 border border-gray-200 p-4 rounded-md bg-gray-50"
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <label className="block text-gray-700 font-medium">
                                    Question {qIndex + 1} *
                                  </label>
                                  {values.questions.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => remove(qIndex)}
                                      className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>

                                {/* Question Text */}
                                <div className="mb-3">
                                  <Field
                                    type="text"
                                    name={`questions.${qIndex}.text`}
                                    className={`w-full border rounded-md p-2 ${
                                      errors.questions?.[qIndex]?.text &&
                                      touched.questions?.[qIndex]?.text
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }`}
                                    placeholder="Enter question text"
                                  />
                                  <ErrorMessage
                                    name={`questions.${qIndex}.text`}
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                  />
                                </div>

                                {/* Marks */}
                                <div className="mb-3">
                                  <label className="block text-gray-700 font-medium mb-1">
                                    Marks *
                                  </label>
                                  <Field
                                    type="number"
                                    name={`questions.${qIndex}.marks`}
                                    min="1"
                                    max="100"
                                    className={`w-full border rounded-md p-2 ${
                                      errors.questions?.[qIndex]?.marks &&
                                      touched.questions?.[qIndex]?.marks
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }`}
                                  />
                                  <ErrorMessage
                                    name={`questions.${qIndex}.marks`}
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                  />
                                </div>

                                {/* Options */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  {question.options.map((option, oIndex) => (
                                    <div key={option.id}>
                                      <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Option {option.id} *
                                      </label>
                                      <Field
                                        type="text"
                                        name={`questions.${qIndex}.options.${oIndex}.text`}
                                        className={`w-full border rounded-md p-2 ${
                                          errors.questions?.[qIndex]?.options?.[
                                            oIndex
                                          ]?.text &&
                                          touched.questions?.[qIndex]
                                            ?.options?.[oIndex]?.text
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        }`}
                                        placeholder={`Enter option ${option.id}`}
                                      />
                                      <ErrorMessage
                                        name={`questions.${qIndex}.options.${oIndex}.text`}
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                      />
                                    </div>
                                  ))}
                                </div>

                                {/* Correct Option */}
                                <div className="flex items-center">
                                  <label className="mr-3 text-gray-700 font-medium">
                                    Correct Option: *
                                  </label>
                                  <Field
                                    as="select"
                                    name={`questions.${qIndex}.correctOption`}
                                    className={`border rounded-md p-2 ${
                                      errors.questions?.[qIndex]
                                        ?.correctOption &&
                                      touched.questions?.[qIndex]?.correctOption
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {["A", "B", "C", "D"].map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </Field>
                                  <ErrorMessage
                                    name={`questions.${qIndex}.correctOption`}
                                    component="div"
                                    className="text-red-500 text-sm ml-2"
                                  />
                                </div>
                              </div>
                            )
                          )}

                          <button
                            type="button"
                            onClick={() => addQuestion(values.questions, push)}
                            className="text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500 px-4 py-2 rounded-md transition-colors"
                          >
                            Add Question
                          </button>

                          {/* Global Questions Error */}
                          {typeof errors.questions === "string" && (
                            <div className="text-red-500 text-sm mt-2">
                              {errors.questions}
                            </div>
                          )}
                        </>
                      )}
                    </FieldArray>
                  </div>

                  {/* Total Marks Display */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-1">
                      Total Marks
                    </label>
                    <input
                      type="text"
                      value={totalMarks}
                      className="w-full border rounded-md p-2 bg-gray-100"
                      readOnly
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onCancel}
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!isValid || !dirty}
                      className={`px-6 py-2 rounded-md transition-colors ${
                        isValid && dirty
                          ? "bg-[#49BBBD] text-white hover:bg-[#3a9a9c]"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Save Assessment
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>


      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setFormValues(null);
        }}
        onConfirm={handleConfirmSubmit}
        message="Are you sure you want to save this assessment? Please review all questions and answers before confirming."
      />
    </>
  );
};

export default AssessmentForm;
