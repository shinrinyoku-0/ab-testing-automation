import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFiles, getUploadOptions, loadSampleData, downloadSampleFiles } from '../services/api';

export const useFileUpload = () => {
  const [jsonFile, setJsonFile] = useState(null);
  const [exposuresFile, setExposuresFile] = useState(null);
  const [eventsFile, setEventsFile] = useState(null);
  const [usersFile, setUsersFile] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [experimentName, setExperimentName] = useState('');
  const [experimentId, setExperimentId] = useState('');
  const [options, setOptions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isUsingSampleData, setIsUsingSampleData] = useState(false);
  const navigate = useNavigate();

  // fetch upload options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await getUploadOptions();
        setOptions(data.options);
        if (data.options.length > 0) {
          setSelectedOption(data.options[0]. value);
        }
      } catch (err) {
        console.error('Failed to fetch options', err);
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchOptions();
  }, [navigate]);

  // validation helper
  const validateFile = (file, expectedExtension, errorMessage) => {
    if (file && file.name.endsWith(expectedExtension)) {
      setError('');
      return true;
    } else {
      setError(errorMessage);
      return false;
    }
  };

  // file change handlers
  const handleJsonFileChange = (e) => {
    const file = e.target.files[0];
    if (validateFile(file, '.json', 'Please select a valid JSON file')) {
      setJsonFile(file);
    } else {
      setJsonFile(null);
    }
  };

  const handleExposuresFileChange = (e) => {
    const file = e.target. files[0];
    if (validateFile(file, '.csv', 'Exposures file must be CSV')) {
      setExposuresFile(file);
    } else {
      setExposuresFile(null);
    }
  };

  const handleEventsFileChange = (e) => {
    const file = e.target.files[0];
    if (validateFile(file, '.csv', 'Events file must be CSV')) {
      setEventsFile(file);
    } else {
      setEventsFile(null);
    }
  };

  const handleUsersFileChange = (e) => {
    const file = e.target.files[0];
    if (validateFile(file, '.csv', 'Users file must be CSV')) {
      setUsersFile(file);
    } else {
      setUsersFile(null);
    }
  };

  const handleLoadSampleData = async () => {
    setLoading(true);
    setError('');

    try {
      const sampleData = await loadSampleData();

      setJsonFile(sampleData.jsonFile);
      setExposuresFile(sampleData.exposuresFile);
      setEventsFile(sampleData.eventsFile);
      setUsersFile(sampleData.usersFile);
      setExperimentName(sampleData.experimentName);
      setExperimentId(sampleData.experimentId);

      setIsUsingSampleData(true);
      setSuccess('Using sample data. Click "Upload & Run Analysis" to see results.');
    } catch (err) {
      setError('Failed to load sample data. Please try again.');
      console.error('Error loading sample data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSamples = async () => {
    try {
      await downloadSampleFiles();
    } catch (err) {
      setError('Failed to download sample files');
      console.error('Error downloading samples:', err);
    }
  };

  // reset form
  const resetForm = () => {
    setJsonFile(null);
    setExposuresFile(null);
    setEventsFile(null);
    setUsersFile(null);
    setExperimentName('');
    setExperimentId('');
    setIsUsingSampleData(false);

    // Reset file inputs
    ['jsonFile', 'exposuresFile', 'eventsFile', 'usersFile'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.value = '';
    });
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAnalysisResults(null);

    // Validation
    if (!experimentId. trim()) {
      setError('Please enter an experiment ID');
      return;
    }
    if (!experimentName.trim()) {
      setError('Please enter an experiment name');
      return;
    }
    if (!jsonFile) {
      setError('Please select a JSON metrics config file');
      return;
    }
    if (!exposuresFile) {
      setError('Please select an exposures CSV file');
      return;
    }
    if (!eventsFile) {
      setError('Please select an events CSV file');
      return;
    }

    setLoading(true);

    try {
      const response = await uploadFiles(
        experimentName, 
        experimentId,
        jsonFile, 
        exposuresFile, 
        eventsFile,
        usersFile, 
        selectedOption
      );

      if (response.processing_error) {
        setError(`Analysis error: ${response.processing_error}`);
        setSuccess('Files uploaded, but analysis failed');
      } else {
        setSuccess('Files uploaded and analyzed successfully!');
        setAnalysisResults(response.analysis);
      }
      resetForm();
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

  return {
    jsonFile,
    exposuresFile,
    eventsFile,
    usersFile,
    selectedOption,
    setSelectedOption,
    experimentName,
    setExperimentName,
    experimentId,
    setExperimentId,
    options,
    error,
    success,
    loading,
    analysisResults,
    isUsingSampleData,
    
    // Handlers
    handleJsonFileChange,
    handleExposuresFileChange,
    handleEventsFileChange,
    handleUsersFileChange,
    handleSubmit,
    handleLoadSampleData,
    handleDownloadSamples,
  };
};
