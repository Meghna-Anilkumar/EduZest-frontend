import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { IExam, IQuestion } from "../courses/ExamsPage";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface ExamFormProps {
  exam?: IExam | null;
  onSave: (exam: IExam) => void;
  onCancel: () => void;
}

// Define option schema separately for clarity
const optionSchema = Yup.object({
  id: Yup.string().required("Option ID is required"),
  text: Yup.string()
    .min(1, "Option text is required")
    .max(150, "Option must not exceed 150 characters")
    .required("Option text is required"),
});

const trueFalseOptionSchema = Yup.object({
  id: Yup.string().required("Option ID is required"),
  text: Yup.string()
    .oneOf(["True", "False"], "Option must be True or False")
    .required("Option text is required"),
});

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
  duration: Yup.number()
    .min(10, "Duration must be at least 10 minutes")
    .max(180, "Duration must not exceed 180 minutes")
    .required("Duration is required"),
  passingCriteria: Yup.number()
    .min(0, "Passing criteria must be at least 0%")
    .max(100, "Passing criteria must not exceed 100%")
    .required("Passing criteria is required"),
  questions: Yup.array()
    .of(
      Yup.object({
        id: Yup.string().required("Question ID is required"),
        questionText: Yup.string()
          .min(5, "Question must be at least 5 characters")
          .max(300, "Question must not exceed 300 characters")
          .required("Question text is required"),
        marks: Yup.number()
          .min(1, "Marks must be at least 1")
          .max(100, "Marks must not exceed 100")
          .required("Marks are required"),
        options: Yup.array().when("type", {
          is: "mcq",
          then: (schema) =>
            schema
              .of(optionSchema)
              .min(4, "Must have exactly 4 options for MCQ")
              .max(4, "Must have exactly 4 options for MCQ"),
          otherwise: (schema) =>
            schema
              .of(trueFalseOptionSchema)
              .min(2, "Must have exactly 2 options for True/False")
              .max(2, "Must have exactly 2 options for True/False"),
        }),
        correctAnswerIndex: Yup.number().when("type", {
          is: "mcq",
          then: (schema) =>
            schema
              .min(0, "Must select a valid option")
              .max(3, "Must select a valid option")
              .required("Correct option is required"),
          otherwise: (schema) =>
            schema
              .min(0, "Must select a valid option")
              .max(1, "Must select a valid option")
              .required("Correct option is required"),
        }),
        explanation: Yup.string()
          .max(500, "Explanation must not exceed 500 characters")
          .required("Explanation is required"),
        type: Yup.string()
          .oneOf(["mcq", "true_false"], "Invalid question type")
          .required("Question type is required"),
      })
    )
    .min(1, "At least one question is required")
    .required("Questions are required"),
});

const ExamForm: React.FC<ExamFormProps> = ({ exam, onSave, onCancel }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formValues, setFormValues] = useState<any>(null);

  // Initial values for Formik
  const initialValues = {
    title: exam?.title || "",
    description: exam?.description || "",
    duration: exam?.duration || 60,
    passingCriteria: exam?.passingCriteria || 70,
    questions:
      exam?.questions?.length > 0
        ? exam.questions.map((q) => ({
            ...q,
            options:
              q.type === "true_false"
                ? [
                    { id: "1", text: "True" },
                    { id: "2", text: "False" },
                  ]
                : q.options,
          }))
        : [
            {
              id: `q1`,
              questionText: "",
              options: [
                { id: "1", text: "" },
                { id: "2", text: "" },
                { id: "3", text: "" },
                { id: "4", text: "" },
              ],
              correctAnswerIndex: 0,
              explanation: "",
              type: "mcq",
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

    const newExam: IExam = {
      _id: exam?._id || "",
      courseId,
      title: formValues.title,
      description: formValues.description,
      duration: formValues.duration,
      passingCriteria: formValues.passingCriteria,
      questions: formValues.questions,
      totalMarks,
      createdAt: exam?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newExam);
    setShowConfirmation(false);
    setFormValues(null);
  };

  const addQuestion = (
    questions: IQuestion[],
    push: (obj: any) => void,
    type: "mcq" | "true_false" = "mcq"
  ) => {
    const newQuestion: IQuestion = {
      id: `q${questions.length + 1}`,
      questionText: "",
      options:
        type === "true_false"
          ? [
              { id: "1", text: "True" },
              { id: "2", text: "False" },
            ]
          : [
              { id: "1", text: "" },
              { id: "2", text: "" },
              { id: "3", text: "" },
              { id: "4", text: "" },
            ],
      correctAnswerIndex: 0,
      explanation: "",
      type,
      marks: 1,
    };
    push(newQuestion);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">
            {exam ? "Edit Exam" : "Create Exam"}
          </h2>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, isValid, dirty, setFieldValue }) => {
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
                      placeholder="Enter exam title"
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
                      placeholder="Enter exam description"
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Duration Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="duration"
                      className="block text-gray-700 font-medium mb-1"
                    >
                      Duration (minutes) *
                    </label>
                    <Field
                      type="number"
                      id="duration"
                      name="duration"
                      min="10"
                      max="180"
                      className={`w-full border rounded-md p-2 ${
                        errors.duration && touched.duration
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter duration in minutes"
                    />
                    <ErrorMessage
                      name="duration"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Passing Criteria Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="passingCriteria"
                      className="block text-gray-700 font-medium mb-1"
                    >
                      Passing Criteria (%) *
                    </label>
                    <Field
                      type="number"
                      id="passingCriteria"
                      name="passingCriteria"
                      min="0"
                      max="100"
                      className={`w-full border rounded-md p-2 ${
                        errors.passingCriteria && touched.passingCriteria
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter passing percentage"
                    />
                    <ErrorMessage
                      name="passingCriteria"
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
                                    name={`questions.${qIndex}.questionText`}
                                    className={`w-full border rounded-md p-2 ${
                                      errors.questions?.[qIndex]?.questionText &&
                                      touched.questions?.[qIndex]?.questionText
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }`}
                                    placeholder="Enter question text"
                                  />
                                  <ErrorMessage
                                    name={`questions.${qIndex}.questionText`}
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

                                {/* Question Type */}
                                <div className="mb-3">
                                  <label className="block text-gray-700 font-medium mb-1">
                                    Question Type *
                                  </label>
                                  <Field
                                    as="select"
                                    name={`questions.${qIndex}.type`}
                                    className={`w-full border rounded-md p-2 ${
                                      errors.questions?.[qIndex]?.type &&
                                      touched.questions?.[qIndex]?.type
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }`}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLSelectElement>
                                    ) => {
                                      const value = e.target
                                        .value as "mcq" | "true_false";
                                      setFieldValue(
                                        `questions.${qIndex}.type`,
                                        value
                                      );
                                      if (value === "true_false") {
                                        setFieldValue(
                                          `questions.${qIndex}.options`,
                                          [
                                            { id: "1", text: "True" },
                                            { id: "2", text: "False" },
                                          ]
                                        );
                                        setFieldValue(
                                          `questions.${qIndex}.correctAnswerIndex`,
                                          0
                                        );
                                      } else {
                                        setFieldValue(
                                          `questions.${qIndex}.options`,
                                          [
                                            { id: "1", text: "" },
                                            { id: "2", text: "" },
                                            { id: "3", text: "" },
                                            { id: "4", text: "" },
                                          ]
                                        );
                                        setFieldValue(
                                          `questions.${qIndex}.correctAnswerIndex`,
                                          0
                                        );
                                      }
                                    }}
                                  >
                                    <option value="mcq">Multiple Choice</option>
                                    <option value="true_false">
                                      True/False
                                    </option>
                                  </Field>
                                  <ErrorMessage
                                    name={`questions.${qIndex}.type`}
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                  />
                                </div>

                                {/* Options */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  {question.options.map((option, oIndex) => (
                                    <div key={option.id}>
                                      <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Option {oIndex + 1} *
                                      </label>
                                      {question.type === "true_false" ? (
                                        <input
                                          type="text"
                                          value={option.text}
                                          className="w-full border rounded-md p-2 bg-gray-100"
                                          readOnly
                                        />
                                      ) : (
                                        <Field
                                          type="text"
                                          name={`questions.${qIndex}.options.${oIndex}.text`}
                                          className={`w-full border rounded-md p-2 ${
                                            errors.questions?.[qIndex]?.options?.[
                                              oIndex
                                            ]?.text &&
                                            touched.questions?.[qIndex]?.options?.[
                                              oIndex
                                            ]?.text
                                              ? "border-red-500"
                                              : "border-gray-300"
                                          }`}
                                          placeholder={`Enter option ${oIndex + 1}`}
                                        />
                                      )}
                                      <ErrorMessage
                                        name={`questions.${qIndex}.options.${oIndex}.text`}
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                      />
                                    </div>
                                  ))}
                                </div>

                                {/* Correct Answer */}
                                <div className="flex items-center mb-3">
                                  <label className="mr-3 text-gray-700 font-medium">
                                    Correct Answer: *
                                  </label>
                                  <Field
                                    as="select"
                                    name={`questions.${qIndex}.correctAnswerIndex`}
                                    className={`border rounded-md p-2 ${
                                      errors.questions?.[qIndex]
                                        ?.correctAnswerIndex &&
                                      touched.questions?.[qIndex]
                                        ?.correctAnswerIndex
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {question.options.map((_, idx) => (
                                      <option key={idx} value={idx}>
                                        {question.type === "true_false"
                                          ? idx === 0
                                            ? "True"
                                            : "False"
                                          : `Option ${idx + 1}`}
                                      </option>
                                    ))}
                                  </Field>
                                  <ErrorMessage
                                    name={`questions.${qIndex}.correctAnswerIndex`}
                                    component="div"
                                    className="text-red-500 text-sm ml-2"
                                  />
                                </div>

                                {/* Explanation */}
                                <div className="mb-3">
                                  <label className="block text-gray-700 font-medium mb-1">
                                    Explanation *
                                  </label>
                                  <Field
                                    as="textarea"
                                    name={`questions.${qIndex}.explanation`}
                                    rows={3}
                                    className={`w-full border rounded-md p-2 ${
                                      errors.questions?.[qIndex]?.explanation &&
                                      touched.questions?.[qIndex]?.explanation
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }`}
                                    placeholder="Enter explanation for the correct answer"
                                  />
                                  <ErrorMessage
                                    name={`questions.${qIndex}.explanation`}
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                  />
                                </div>
                              </div>
                            )
                          )}

                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => addQuestion(values.questions, push, "mcq")}
                              className="text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500 px-4 py-2 rounded-md transition-colors"
                            >
                              Add MCQ Question
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                addQuestion(values.questions, push, "true_false")
                              }
                              className="text-green-500 hover:bg-green-500 hover:text-white border border-green-500 px-4 py-2 rounded-md transition-colors"
                            >
                              Add True/False Question
                            </button>
                          </div>

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
                      Save Exam
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
        message="Are you sure you want to save this exam? Please review all questions and answers before confirming."
      />
    </>
  );
};

export default ExamForm;