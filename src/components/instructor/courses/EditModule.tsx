import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

interface Module {
  _id?: string;
  moduleTitle: string;
  lessons: any[];
}

interface ModuleFormProps {
  module: Module;
  onSave: (updatedModule: Module, originalModuleTitle?: string) => void;
  onClose: () => void;
  isEditing: boolean;
}

const moduleValidationSchema = Yup.object({
  moduleTitle: Yup.string()
    .required("Module title is required")
    .min(3, "Module title must be at least 3 characters long"),
});

const ModuleForm: React.FC<ModuleFormProps> = ({
  module,
  onSave,
  onClose,
  isEditing,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [pendingValues, setPendingValues] = useState<{ moduleTitle: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!pendingValues) return;

    const updatedModule: Module = {
      ...module,
      moduleTitle: pendingValues.moduleTitle,
    };
    await onSave(updatedModule, isEditing ? module.moduleTitle : undefined);
    setShowModal(false);
    setPendingValues(null);
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setShowModal(false);
    setPendingValues(null);
    setIsSubmitting(false);
  };

  return (
    <div className={isEditing ? "w-full" : "mt-6 bg-white rounded-lg p-6 shadow-md"}>
      {!isEditing && (
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Add New Module
        </h3>
      )}

      <Formik
        initialValues={{ moduleTitle: module.moduleTitle || "" }}
        validationSchema={moduleValidationSchema}
        onSubmit={(values) => {
          setIsSubmitting(true);
          setPendingValues(values);
          setShowModal(true);
        }}
      >
        {() => (
          <Form className={isEditing ? "flex items-center gap-4 w-full" : "space-y-6"}>
            <div className={isEditing ? "flex-1" : ""}>
              <label className={`block text-gray-700 font-medium ${isEditing ? "mb-1" : "mb-2"}`}>
                {!isEditing && (
                  <>Module Title <span className="text-red-500">*</span></>
                )}
              </label>
              <Field
                type="text"
                name="moduleTitle"
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-[#49BBBD]"
                placeholder="Enter module title"
              />
              <ErrorMessage
                name="moduleTitle"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            
            <div className={isEditing ? "flex items-end pb-1" : "flex justify-end mt-6"}>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : isEditing ? "Save Module" : "Add Module"}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h4 className="text-lg font-semibold mb-4">Confirm Action</h4>
            <p className="mb-6">Are you sure you want to {isEditing ? "save changes" : "add this module"}?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-[#49BBBD] text-white rounded-md hover:bg-[#3a9a9c] transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleForm;