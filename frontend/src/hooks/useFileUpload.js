import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFiles, getUploadOptions, loadSampleData, downloadSampleFiles } from '../services/api';
import { isTokenExpired, getTokenTimeRemaining } from '../utils/auth';

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
  const [availableExperimentIds, setAvailableExperimentIds] = useState([]);
  const [submittedExperimentName, setSubmittedExperimentName] = useState('');
  const [submittedExperimentId, setSubmittedExperimentId] = useState('');
  const [metricDefinitions, setMetricDefinitions] = useState(null);
  const navigate = useNavigate();
  const FORM_STORAGE_KEY = 'unsaved_form_data';

  // auto save form data to localStorage
  useEffect(() => {
    if (experimentName || experimentId || selectedOption) {
      const formData = {
        experimentName,
        experimentId,
        selectedOption,
        timestamp: Date.now()
      };
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    }
  }, [experimentName, experimentId, selectedOption]);

  // restore form data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Only restore if less than 24 hours old
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setExperimentName(parsed.experimentName || '');
          setExperimentId(parsed.experimentId || '');
          setSelectedOption(parsed.selectedOption || '');
          setSuccess('Your previous form data has been restored');
        } else {
          localStorage.removeItem(FORM_STORAGE_KEY);
        }
      } catch (e) {
        console.error('Failed to restore form data', e);
        localStorage.removeItem(FORM_STORAGE_KEY);
      }
    }
  }, []);


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

  // Parse CSV to extract experiment IDs
  const parseExperimentIds = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n');
          
          if (lines.length < 2) {
            resolve([]);
            return;
          }

          // Find the experiment_id column index
          const headers = lines[0].split(',').map(h => h.trim());
          const expIdIndex = headers.findIndex(h => h.toLowerCase() === 'experiment_id');
          
          if (expIdIndex === -1) {
            resolve([]);
            return;
          }

          // Extract unique experiment IDs
          const experimentIds = new Set();
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = line.split(',');
            if (values[expIdIndex]) {
              experimentIds.add(values[expIdIndex].trim());
            }
          }

          resolve(Array.from(experimentIds).sort());
        } catch (error) {
          console.error('Error parsing CSV:', error);
          resolve([]);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // file change handlers
  const handleJsonFileChange = async (e) => {
    const file = e.target.files[0];
    if (validateFile(file, '.json', 'Please select a valid JSON file')) {
      setJsonFile(file);
      
      // Parse JSON to get metric definitions
      try {
        const text = await file.text();
        const definitions = JSON.parse(text);
        setMetricDefinitions(definitions);
      } catch (err) {
        console.error('Error parsing metric definitions:', err);
        setMetricDefinitions(null);
      }
    } else {
      setJsonFile(null);
      setMetricDefinitions(null);
    }
  };

  const handleExposuresFileChange = async (e) => {
    const file = e.target.files[0];
    if (validateFile(file, '.csv', 'Exposures file must be CSV')) {
      setExposuresFile(file);
      
      // Parse the file to extract experiment IDs
      try {
        const experimentIds = await parseExperimentIds(file);
        setAvailableExperimentIds(experimentIds);
        
        // Auto-select the first experiment ID if available and no ID is set
        if (experimentIds.length > 0 && !experimentId) {
          setExperimentId(experimentIds[0]);
        }
      } catch (err) {
        console.error('Error extracting experiment IDs:', err);
        setAvailableExperimentIds([]);
      }
    } else {
      setExposuresFile(null);
      setAvailableExperimentIds([]);
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
    // If already using sample data, clear the form instead
    if (isUsingSampleData) {
      resetForm();
      setSuccess('');
      return;
    }

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

      // Parse exposures file to get available experiment IDs
      try {
        const experimentIds = await parseExperimentIds(sampleData.exposuresFile);
        setAvailableExperimentIds(experimentIds);
      } catch (err) {
        console.error('Error extracting experiment IDs from sample data:', err);
        setAvailableExperimentIds([sampleData.experimentId]); // Fallback to hardcoded ID
      }
      
      // Parse JSON file for metric definitions
      try {
        const text = await sampleData.jsonFile.text();
        const definitions = JSON.parse(text);
        setMetricDefinitions(definitions);
      } catch (err) {
        console.error('Error parsing sample metric definitions:', err);
        setMetricDefinitions(null);
      }

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
    setAvailableExperimentIds([]);
    setIsUsingSampleData(false);
    setMetricDefinitions(null);

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
      // Store the values before resetting
      setSubmittedExperimentName(experimentName);
      setSubmittedExperimentId(experimentId);
      
      // Save metric definitions before reset
      const savedMetricDefinitions = metricDefinitions;
      
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

        localStorage.removeItem(FORM_STORAGE_KEY);
      }
      resetForm();
      
      // Restore metric definitions after reset so they can be used for display names
      setMetricDefinitions(savedMetricDefinitions);
    } catch (err) {
      if (err.response?.status !== 401) {
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
    availableExperimentIds,
    submittedExperimentName,
    submittedExperimentId,
    metricDefinitions,
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
