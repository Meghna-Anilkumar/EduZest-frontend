import React, { useState, useEffect } from 'react';

interface Lesson {
  lessonNumber: string;
  title: string;
  description: string;
  objectives?: string[];
  video: string;
  duration?: string;
  content?: string;
  resources?: string[];
}

interface Module {
  moduleTitle: string;
  lessons: Lesson[];
}

interface ModuleViewModalProps {
  module: Module;
  onClose: () => void;
  onSaveLesson?: (updatedLesson: Lesson, videoFile?: File) => void; // Updated to include videoFile
  onSaveModule?: (updatedModule: Module, originalModuleTitle?: string, videoFile?: File) => void; // Updated to include videoFile
  onRemoveModule?: (moduleTitle: string) => void;
  isAddingNewModule?: boolean;
}

const ModuleViewModal: React.FC<ModuleViewModalProps> = ({
  module,
  onClose,
  onSaveLesson,
  onSaveModule,
  onRemoveModule,
  isAddingNewModule = false,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [editedLesson, setEditedLesson] = useState<Lesson | null>(null);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [editedModuleTitle, setEditedModuleTitle] = useState(module.moduleTitle);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [newLesson, setNewLesson] = useState<Lesson>({
    lessonNumber: (module.lessons.length + 1).toString(),
    title: '',
    description: '',
    video: '',
    duration: '',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(isAddingNewModule);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  useEffect(() => {
    if (isAddingNewModule) {
      setIsAddingModule(true);
    }
  }, [isAddingNewModule]);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setEditedLesson({ ...lesson });
    setIsEditingLesson(false);
    setIsAddingLesson(false);
    setIsAddingModule(false);
  };

  const handleEditLesson = () => {
    setIsEditingLesson(true);
    setIsAddingLesson(false);
    setIsAddingModule(false);
  };

  const handleEditModule = () => {
    setIsEditingModule(true);
    setIsAddingModule(false);
  };

  const handleInputChange = (field: keyof Lesson, value: string) => {
    if (editedLesson) {
      setEditedLesson({ ...editedLesson, [field]: value });
    }
  };

  const handleNewLessonChange = (field: keyof Lesson, value: string) => {
    setNewLesson({ ...newLesson, [field]: value });
  };

  const handleModuleTitleChange = (value: string) => {
    setEditedModuleTitle(value);
  };

  const handleNewModuleTitleChange = (value: string) => {
    setNewModuleTitle(value);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleSaveLesson = () => {
    if (editedLesson && onSaveLesson) {
      onSaveLesson(editedLesson, videoFile);
      setVideoFile(null);
      setSelectedLesson(editedLesson);
      setIsEditingLesson(false);
    }
  };

  const handleSaveModule = () => {
    if (onSaveModule) {
      const updatedModule = { ...module, moduleTitle: editedModuleTitle };
      onSaveModule(updatedModule, module.moduleTitle);
      setIsEditingModule(false);
    }
  };

  const handleAddLesson = () => {
    if (onSaveModule && newLesson.title && newLesson.description) {
      const updatedModule = {
        ...module,
        lessons: [...module.lessons, { ...newLesson }],
      };
      onSaveModule(updatedModule, undefined, videoFile);
      setNewLesson({
        lessonNumber: (module.lessons.length + 2).toString(),
        title: '',
        description: '',
        video: '',
        duration: '',
      });
      setVideoFile(null);
      setIsAddingLesson(false);
    }
  };

  const handleRemoveLesson = (lessonNumber: string) => {
    if (onSaveModule) {
      const updatedModule = {
        ...module,
        lessons: module.lessons.filter((lesson) => lesson.lessonNumber !== lessonNumber),
      };
      onSaveModule(updatedModule);
      setSelectedLesson(null);
    }
  };

  const handleRemoveModule = () => {
    if (onRemoveModule) {
      onRemoveModule(module.moduleTitle);
      onClose();
    }
  };

  const handleAddModule = () => {
    setIsAddingModule(true);
    setIsEditingModule(false);
    setIsAddingLesson(false);
    setSelectedLesson(null);
    setNewModuleTitle('');
  };

  const handleSaveNewModule = () => {
    if (onSaveModule && newModuleTitle.trim()) {
      const newModule = { moduleTitle: newModuleTitle, lessons: [] };
      onSaveModule(newModule);
      setIsAddingModule(false);
      setNewModuleTitle('');
    }
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
            {!isEditingLesson && (
              <>
                <button
                  onClick={handleEditLesson}
                  className="text-[#49BBBD] hover:bg-[#49BBBD] hover:text-white border border-[#49BBBD] px-3 py-1 rounded-md transition-colors"
                >
                  Edit Lesson
                </button>
                <button
                  onClick={() => handleRemoveLesson(selectedLesson.lessonNumber)}
                  className="text-red-500 hover:bg-red-500 hover:text-white border border-red-500 px-3 py-1 rounded-md transition-colors"
                >
                  Remove Lesson
                </button>
              </>
            )}
            <button
              onClick={() => setSelectedLesson(null)}
              className="text-gray-600 hover:bg-gray-200 border border-gray-300 px-3 py-1 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {isEditingLesson && editedLesson ? (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Lesson Title</label>
              <input
                type="text"
                value={editedLesson.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 h-24"
                value={editedLesson.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Duration (hours)</label>
              <input
                type="text"
                value={editedLesson.duration || ''}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Upload Video</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="w-full border rounded-md px-3 py-2"
              />
              {videoFile && <p className="text-sm text-gray-600">Selected: {videoFile.name}</p>}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditingLesson(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLesson}
                className="px-4 py-2 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c]"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedLesson.video ? (
              <div className="bg-black rounded-lg overflow-hidden">
                <video controls className="w-full h-[450px] object-cover" src={selectedLesson.video}>
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-600">No video available for this lesson</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Lesson Overview</h4>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Duration: {selectedLesson.duration || 'N/A'} hours</span>
                <span>Lesson Number: {selectedLesson.lessonNumber}</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
              <p className="text-gray-700">{selectedLesson.description}</p>
            </div>
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

  const renderAddLessonForm = () => (
    <div className="mt-6 bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Lesson</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Lesson Title</label>
          <input
            type="text"
            value={newLesson.title}
            onChange={(e) => handleNewLessonChange('title', e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Description</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 h-24"
            value={newLesson.description}
            onChange={(e) => handleNewLessonChange('description', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Upload Video</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="w-full border rounded-md px-3 py-2"
          />
          {videoFile && <p className="text-sm text-gray-600">Selected: {videoFile.name}</p>}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setIsAddingLesson(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAddLesson}
            className="px-4 py-2 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c]"
            disabled={!newLesson.title || !newLesson.description}
          >
            Add Lesson
          </button>
        </div>
      </div>
    </div>
  );

  const renderAddModuleForm = () => (
    <div className="mt-6 bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Module</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Module Title</label>
          <input
            type="text"
            value={newModuleTitle}
            onChange={(e) => handleNewModuleTitleChange(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Enter module title"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setIsAddingModule(false);
              onClose();
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveNewModule}
            disabled={!newModuleTitle.trim()}
            className="px-4 py-2 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Save Module
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl p-6 m-4 overflow-auto">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          {isEditingModule ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editedModuleTitle}
                onChange={(e) => handleModuleTitleChange(e.target.value)}
                className="text-xl font-bold text-gray-800 border rounded-md px-2 py-1 w-full"
              />
              <button
                onClick={handleSaveModule}
                className="px-3 py-1 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c]"
              >
                Save Module
              </button>
              <button
                onClick={() => setIsEditingModule(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <h2 className="text-xl font-bold text-gray-800">{isAddingModule ? 'New Module' : module.moduleTitle}</h2>
          )}
          {!isEditingModule && (
            <div className="flex space-x-2">
              {!isAddingModule && (
                <>
                  <button
                    onClick={handleEditModule}
                    className="text-[#49BBBD] hover:bg-[#49BBBD] hover:text-white border border-[#49BBBD] px-3 py-1 rounded-md transition-colors"
                  >
                    Edit Module
                  </button>
                  <button
                    onClick={handleRemoveModule}
                    className="text-red-500 hover:bg-red-500 hover:text-white border border-red-500 px-3 py-1 rounded-md transition-colors"
                  >
                    Remove Module
                  </button>
                  <button
                    onClick={() => setIsAddingLesson(true)}
                    className="text-green-500 hover:bg-green-500 hover:text-white border border-green-500 px-3 py-1 rounded-md transition-colors"
                  >
                    Add Lesson
                  </button>
                  <button
                    onClick={handleAddModule}
                    className="text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500 px-3 py-1 rounded-md transition-colors"
                  >
                    Add Module
                  </button>
                </>
              )}
              <button onClick={onClose} className="text-gray-600 hover:text-gray-900 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 bg-gray-50 rounded-lg p-4 max-h-[70vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Lessons</h3>
            {isAddingModule ? (
              <div className="text-center text-gray-500 py-4">No lessons yet. Save the module to add lessons.</div>
            ) : module.lessons.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No lessons available. Add a lesson to get started.</div>
            ) : (
              module.lessons.map((lesson, index) => (
                <div
                  key={lesson.lessonNumber + index}
                  onClick={() => handleLessonSelect(lesson)}
                  className={`border-b last:border-b-0 py-4 hover:bg-gray-100 transition-colors cursor-pointer ${
                    selectedLesson?.lessonNumber === lesson.lessonNumber ? 'bg-[#49BBBD] bg-opacity-10' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">Lesson {lesson.lessonNumber}</span>
                        <span className="text-[#49BBBD] bg-[#49BBBD] bg-opacity-10 px-2 py-1 rounded-full text-xs">
                          {lesson.duration || 'N/A'} hrs
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-800 mt-1">{lesson.title}</h4>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="col-span-2">
            {isAddingModule ? (
              renderAddModuleForm()
            ) : isAddingLesson ? (
              renderAddLessonForm()
            ) : selectedLesson ? (
              renderLessonDetails()
            ) : (
              <div className="text-center text-gray-500 py-10">Select a lesson to view its details</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleViewModal;