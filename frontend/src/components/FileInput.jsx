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
  helperText,
  icon: Icon
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const getFileType = () => {
    if (accept === '.json') return 'json';
    return 'csv';
  };

  return (
    <>
      <Card className="border-2 border-dashed border-default-300 hover:border-primary-400 transition-colors bg-default-50/50 hover:bg-primary-50/30">
        <CardBody className='p-6'>
          <div className="flex items-start gap-3 mb-3">
            <div className="shrink-0 w-10 h-10 bg-default-100 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-default-600" />
            </div>
          <div className="flex-1">
            <h4 className="font-semibold text-default-700 mb-1">
              {label}
              {required && <span className="text-danger ml-1">*</span>}
            </h4>
            {helperText && (
              <p className="text-xs text-default-500">{helperText}</p>
            )}
          </div>
        </div>
              
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
            className="flex flex-col items-center justify-center w-full py-6 cursor-pointer"
          >
          {file ? (
            <div className="text-center w-full">
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-default-700">{file.name}</p>
              <p className="text-xs text-default-500 mt-1">Click to change file</p>
              
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPreview(true);
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
              >
                <EyeIcon className="w-4 h-4" />
                Preview File
              </button>
            </div>
          ) : (
              <div className="text-center">
                <svg className="w-12 h-12 text-default-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium text-default-600">Click to browse</p>
                <p className="text-xs text-default-400 mt-1">{accept.replace('.', '').toUpperCase()} files only</p>
              </div>
            )}
          </label>
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
