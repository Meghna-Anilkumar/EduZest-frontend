import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IAssessment, IQuestion } from '../../../interface/IAssessment';

interface AssessmentFormProps {
  assessment?: IAssessment | null;
  onSave: (assessment: IAssessment) => void;
  onCancel: () => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ assessment, onSave, onCancel }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const [title, setTitle] = useState(assessment?.title || '');
  const [description, setDescription] = useState(assessment?.description || '');
  const [questions, setQuestions] = useState<IQuestion[]>(
    assessment?.questions || []
  );

  // Calculate total marks dynamically
  const totalMarks = questions.reduce((sum, question) => sum + (question.marks || 0), 0);

  const addQuestion = () => {
    const newQuestion: IQuestion = {
      id: `q${questions.length + 1}`,
      text: '',
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
      ],
      correctOption: 'A',
      marks: 1, // Default marks for new question
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updatedQuestion: IQuestion) => {
    const updatedQuestions = questions.map((q, i) => (i === index ? updatedQuestion : q));
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) {
      toast.error('Course ID is missing');
      console.error('courseId is missing');
      return;
    }

    // Validate questions
    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // Check for empty questions, options, or invalid marks
    const hasInvalidFields = questions.some(
      (q) =>
        !q.text.trim() ||
        q.options.some((opt) => !opt.text.trim()) ||
        !q.marks ||
        q.marks < 1
    );

    if (hasInvalidFields) {
      toast.error('Please fill in all fields and ensure marks are at least 1');
      return;
    }

    const newAssessment: IAssessment = {
      _id: assessment?._id,
      courseId,
      moduleTitle: assessment?.moduleTitle || '',
      title,
      description,
      questions,
      totalMarks,
      createdAt: assessment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(newAssessment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {assessment ? 'Edit Assessment' : 'Create Assessment'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-md p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-md p-2"
              rows={4}
            />
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Questions</h3>
            {questions.map((question, qIndex) => (
              <div key={question.id} className="mb-4 border p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700">Question {qIndex + 1}</label>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) =>
                    updateQuestion(qIndex, { ...question, text: e.target.value })
                  }
                  className="w-full border rounded-md p-2 mb-2"
                  placeholder="Enter question text"
                  required
                />
                <div className="mb-2">
                  <label className="block text-gray-700">Marks</label>
                  <input
                    type="number"
                    value={question.marks || 1}
                    onChange={(e) =>
                      updateQuestion(qIndex, {
                        ...question,
                        marks: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full border rounded-md p-2"
                    min="1"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {question.options.map((option, oIndex) => (
                    <div key={option.id} className="flex items-center">
                      <span className="mr-2">{option.id}:</span>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => {
                          const updatedOptions = question.options.map((opt, i) =>
                            i === oIndex ? { ...opt, text: e.target.value } : opt
                          );
                          updateQuestion(qIndex, {
                            ...question,
                            options: updatedOptions,
                          });
                        }}
                        className="w-full border rounded-md p-2"
                        placeholder={`Option ${option.id}`}
                        required
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center">
                  <label className="mr-2">Correct Option:</label>
                  <select
                    value={question.correctOption}
                    onChange={(e) =>
                      updateQuestion(qIndex, {
                        ...question,
                        correctOption: e.target.value,
                      })
                    }
                    className="border rounded-md p-2"
                  >
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addQuestion}
              className="text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500 px-3 py-1 rounded-md"
            >
              Add Question
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Total Marks</label>
            <input
              type="text"
              value={totalMarks}
              className="w-full border rounded-md p-2 bg-gray-100"
              readOnly
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#49BBBD] text-white px-4 py-2 rounded-md hover:bg-[#3a9a9c]"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentForm;