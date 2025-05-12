import React, { useState, useEffect } from 'react';

interface SubtitleFileInputProps {
  onChange: (file: File | null) => void;
  initialValue?: File | null;
}

const SubtitleFileInput: React.FC<SubtitleFileInputProps> = ({
  onChange,
  initialValue = null,
}) => {
  const [subtitleFile, setSubtitleFile] = useState<File | null>(initialValue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSubtitleFile(initialValue);
  }, [initialValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (only .vtt files allowed)
      if (file.type !== 'text/vtt' && !file.name.endsWith('.vtt')) {
        setError('Only WebVTT (.vtt) files are allowed');
        setSubtitleFile(null);
        onChange(null);
        return;
      }

      setError(null);
      setSubtitleFile(file);
      onChange(file);
    }
  };

  const handleRemove = () => {
    setSubtitleFile(null);
    setError(null);
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        {subtitleFile ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-gray-600">
              <span>{subtitleFile.name}</span>
              <button
                type="button"
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z"
              />
            </svg>
            <div className="flex text-sm justify-center">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-teal-500 hover:text-teal-600">
                <span>Upload subtitles</span>
                <input
                  type="file"
                  className="sr-only"
                  accept=".vtt"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1 text-gray-600">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">WebVTT (.vtt) files up to 1MB</p>
          </div>
        )}
      </div>
      {error && <div className="text-red-600 text-xs">{error}</div>}
    </div>
  );
};

export default SubtitleFileInput;