import { useState } from 'react';
import { Card, CardBody } from "@heroui/react";
import { ArrowUpTrayIcon, EyeIcon } from "@heroicons/react/24/outline";
import FilePreviewModal from './FilePreviewModal';

const FileInput = ({
  id,
  label,
  accept,
  required = false,
  file,
  onChange,
  helperText
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const getFileType = () => {
    if (accept === '.json') return 'json';
    return 'csv';
  };

  return (
    <>
      <Card>
        <CardBody>
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              
              <input
                id={id}
                type="file"
                accept={accept}
                onChange={onChange}
                className="hidden"
                required={required}
              />
              
              <label
                htmlFor={id}
                className="flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-gray-50"
              >
                <ArrowUpTrayIcon className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {file ? file.name : 'Browse... No file selected.'}
                </span>
              </label>

              {helperText && (
                <p className="text-xs text-gray-500 mt-2">{helperText}</p>
              )}
            </div>

            {file && (
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="mt-7 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                title="Preview file"
              >
                <EyeIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </CardBody>
      </Card>

      {showPreview && file && (
        <FilePreviewModal
          file={file}
          fileType={getFileType()}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};

export default FileInput;
