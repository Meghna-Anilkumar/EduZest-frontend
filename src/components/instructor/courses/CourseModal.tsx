import React, { useState } from 'react';

interface Lesson {
  lessonNumber: number;
  title: string;
  duration: string;
  description: string;
  videoUrl?: string;
  content?: string;
  resources?: string[];
}

interface ModuleViewModalProps {
  module: {
    moduleTitle: string;
    lessons: Lesson[];
  };
  onClose: () => void;
}

const ModuleViewModal: React.FC<ModuleViewModalProps> = ({ module, onClose }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsEditing(false);
  };

  const handleEditLesson = () => {
    setIsEditing(true);
  };

  const renderLessonDetails = () => {
    if (!selectedLesson) return null;

    return (
      <div className="mt-6 bg-white rounded-lg p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Lesson {selectedLesson.lessonNumber}: {selectedLesson.title}
          </h3>
          <div className="space-x-2">
            <button 
              onClick={handleEditLesson}
              className="text-[#49BBBD] hover:bg-[#49BBBD] hover:text-white border border-[#49BBBD] px-3 py-1 rounded-md transition-colors"
            >
              Edit Lesson
            </button>
            <button 
              onClick={() => setSelectedLesson(null)}
              className="text-gray-600 hover:bg-gray-200 border border-gray-300 px-3 py-1 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Lesson Title</label>
              <input 
                type="text" 
                value={selectedLesson.title}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea 
                className="w-full border rounded-md px-3 py-2 h-24"
                value={selectedLesson.description}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Video URL</label>
              <input 
                type="text" 
                value={selectedLesson.videoUrl || ''}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter video URL"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c]"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Video Player */}
            {selectedLesson.videoUrl ? (
              <div className="bg-black rounded-lg overflow-hidden">
                <video 
                  controls 
                  className="w-full h-[450px] object-cover"
                  src={selectedLesson.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-600">No video available for this lesson</p>
              </div>
            )}

            {/* Lesson Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Lesson Overview</h4>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Duration: {selectedLesson.duration} hours</span>
                <span>Lesson Number: {selectedLesson.lessonNumber}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
              <p className="text-gray-700">{selectedLesson.description}</p>
            </div>

            {/* Additional Resources */}
            {selectedLesson.resources && selectedLesson.resources.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Additional Resources</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {selectedLesson.resources.map((resource, index) => (
                    <li key={index}>{resource}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl p-6 m-4 overflow-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">{module.moduleTitle}</h2>
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Container */}
        <div className="grid grid-cols-3 gap-6">
          {/* Lessons List */}
          <div className="col-span-1 bg-gray-50 rounded-lg p-4 max-h-[70vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Lessons</h3>
            {module.lessons.map((lesson) => (
              <div 
                key={lesson.lessonNumber} 
                onClick={() => handleLessonSelect(lesson)}
                className={`border-b last:border-b-0 py-4 hover:bg-gray-100 transition-colors cursor-pointer ${
                  selectedLesson?.lessonNumber === lesson.lessonNumber ? 'bg-[#49BBBD] bg-opacity-10' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">
                        Lesson {lesson.lessonNumber}
                      </span>
                      <span className="text-[#49BBBD] bg-[#49BBBD] bg-opacity-10 px-2 py-1 rounded-full text-xs">
                        {lesson.duration} hrs
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-800 mt-1">
                      {lesson.title}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lesson Details */}
          <div className="col-span-2">
            {selectedLesson ? (
              renderLessonDetails()
            ) : (
              <div className="text-center text-gray-500 py-10">
                Select a lesson to view its details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleViewModal;