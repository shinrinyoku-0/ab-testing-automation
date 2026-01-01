import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFiles, getUploadOptions } from '../services/api';

const FileUpload = () => {
  const [jsonFile, setJsonFile] = useState(null);
  const [csvFiles, setCsvFiles] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [options, setOptions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await getUploadOptions();
        setOptions(data.options);
        if (data.options.length > 0) {
          setSelectedOption(data.options[0].value);
        }
      } catch (err) {
        console.error('Failed to fetch options', err);
      }
    };
    fetchOptions();
  }, []);

  const handleJsonFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.json')) {
      setJsonFile(file);
      setError('');
    } else {
      setError('Please select a valid JSON file');
      setJsonFile(null);
    }
  };

  const handleCsvFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      setError('Maximum 3 CSV files allowed');
      return;
    }
    
    const allCsv = files.every(file => file.name.endsWith('.csv'));
    if (!allCsv) {
      setError('All files must be CSV');
      setCsvFiles([]);
      return;
    }
    
    setCsvFiles(files);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!jsonFile) {
      setError('Please select a JSON file');
      return;
    }

    if (csvFiles.length === 0) {
      setError('Please select at least one CSV file');
      return;
    }

    setLoading(true);

    try {
      await uploadFiles(jsonFile, csvFiles, selectedOption);
      setSuccess('Files uploaded successfully!');
      setJsonFile(null);
      setCsvFiles([]);
      // Reset file inputs
      document.getElementById('jsonFile').value = '';
      document.getElementById('csvFiles').value = '';
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || 'Upload failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Upload Files</h2>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Processing Type
              </label>
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                JSON File
              </label>
              <input
                id="jsonFile"
                type="file"
                accept=".json"
                onChange={handleJsonFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus: ring-blue-500"
                required
              />
              {jsonFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {jsonFile.name}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                CSV Files (Max 3)
              </label>
              <input
                id="csvFiles"
                type="file"
                accept=".csv"
                multiple
                onChange={handleCsvFilesChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {csvFiles.length > 0 && (
                <div className="text-sm text-gray-600 mt-2">
                  <p className="font-semibold">Selected {csvFiles.length} file(s):</p>
                  <ul className="list-disc list-inside">
                    {csvFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ?  'Uploading...' :  'Run Analysis'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
