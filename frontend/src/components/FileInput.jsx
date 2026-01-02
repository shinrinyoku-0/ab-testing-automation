import React from "react";

const FileInput = ({
  id,
  label,
  accept,
  required = false,
  file,
  onChange,
  helperText
}) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label} {required && '*'}
      </label>
      <input 
        id={id}
        type="file"
        accept={accept}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={required}
      />
      {file && (
        <p className="text-sm text-green-600 mt-2">
            Uploaded: {file.name}
        </p>
      )}
      {helperText && (
        <p className="text-xs text-gray-500 mt-1">
            {helperText}
        </p>
      )}
        </div>
    );
};

export default FileInput;
