import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFiles, getUploadOptions } from '../services/api';

const FileUpload = () => {
  const [jsonFile, setJsonFile] = useState(null);
  const [exposuresFile, setExposuresFile] = useState(null);
  const [eventsFile, setEventsFile] = useState(null);
  const [usersFile, setusersFile] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [experimentName, setExperimentName] = useState('');
  const [experimentId, setExperimentId] = useState('');
  const [options, setOptions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
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

  const handleExposuresFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setExposuresFile(file);
      setError('');
    } else {
      setError('Exposures file must be CSV');
      setExposuresFile(null);
    }
  };

  const handleEventsFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setEventsFile(file);
      setError('');
    } else {
      setError('Events file must be CSV');
      setEventsFile(null);
    }
  };

  const handleUsersFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setUsersFile(file);
      setError('');
    } else {
      setError('Users file must be CSV');
      setUsersFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAnalysisResults(null);

    if (!experimentId.trim()) {
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
        experimentName, experimentId,
        jsonFile, exposuresFile, eventsFile,
        usersFile, selectedOption
      );

      if (response.processing_error) {
        setError(`Analysis error: ${response.processing_error}`)
        setSuccess('Files uploaded, but analysis failed');
      } else {
        setSuccess('Files uploaded and analyzed successfully!');
        setAnalysisResults(response.analysis)
      }

      // reset form
      setJsonFile(null);
      setExposuresFile(null);
      setEventsFile(null);
      setUsersFile(null);
      setExperimentName('');
      setExperimentId('');

      // Reset file inputs
      document.getElementById('jsonFile').value = '';
      document.getElementById('exposuresFile').value = '';
      document.getElementById('eventsFile').value = '';
      document.getElementById('usersFile').value = '';
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
  
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>This tool is designed for event-based A/B test data (web/mobile analytics).</strong>
              <br />
              Expected format:
            </p>
            <ul className="text-xs text-blue-700 mt-2 ml-4 list-disc">
              <li>Exposures: user_id, experiment_id, variant, exposure_time</li>
              <li>Events: user_id, event_name, event_time, event_value (optional)</li>
              <li>Users: user_id + any demographic columns (optional)</li>
            </ul>
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
                Data Source Type
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

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Experiment Name
                </label>
                <input type="text"
                value={experimentName}
                onChange={(e) => setExperimentName(e.target.value)}
                placeholder="e.g, Homepage Redesign Test"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Experiment ID
              </label>
              <input
                type="text"
                value={experimentId}
                onChange={(e) => setExperimentId(e.target.value)}
                placeholder="e.g., 0 or exp_123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This should match the experiment_id in your exposures CSV
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Metrics Config (JSON) *
              </label>
              <input
                id="jsonFile"
                type="file"
                accept=".json"
                onChange={handleJsonFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {jsonFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {jsonFile.name}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Exposures CSV *
              </label>
              <input
                id="exposuresFile"
                type="file"
                accept=".csv"
                onChange={handleExposuresFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {exposuresFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {exposuresFile.name}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Events CSV *
              </label>
              <input
                id="eventsFile"
                type="file"
                accept=".csv"
                onChange={handleEventsFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {eventsFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {eventsFile.name}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Users CSV (Optional)
              </label>
              <input
                id="usersFile"
                type="file"
                accept=".csv"
                onChange={handleUsersFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {usersFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {usersFile.name}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                For future segmentation features
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300 font-semibold"
            >
              {loading ? 'Processing...' : 'Upload & Run Analysis'}
            </button>
          </form>

          {/* Display Results */}
          {analysisResults && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-4">Analysis Results</h3>
              {Object.entries(analysisResults).map(([metricId, data]) => (
                <div key={metricId} className="mb-6 p-4 bg-white rounded border">
                  <h4 className="font-semibold text-lg mb-2">{metricId}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Test:</span> {data.test}
                    </div>
                    <div>
                      <span className="font-medium">P-value:</span>{' '}
                      {data['p-value']?.toFixed(4)}
                    </div>
                    <div>
                      <span className="font-medium">Significant:</span>{' '}
                      <span
                        className={
                          data.significance === 'YES'
                            ? 'text-green-600 font-bold'
                            : 'text-gray-600'
                        }
                      >
                        {data.significance}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Lift:</span>{' '}
                      {(data.lift * 100).toFixed(2)}%
                    </div>
                    {data.test === 'chi-square' ? (
                      <>
                        <div>
                          <span className="font-medium">Variant A Rate:</span>{' '}
                          {(data.variant_a_rate * 100).toFixed(2)}%
                        </div>
                        <div>
                          <span className="font-medium">Variant B Rate:</span>{' '}
                          {(data.variant_b_rate * 100).toFixed(2)}%
                        </div>
                        {data.variant_a_ci && (
                          <div>
                            <span>Variant A 95% CI:</span>{' '}
                            [{(data.variant_a_ci[0] * 100).toFixed(2)}%, {(data.variant_a_ci[1] * 100).toFixed(2)}%]
                          </div>
                        )}
                        {data.variant_b_ci && (
                          <div>
                            <span>Variant B 95% CI:</span>{' '}
                            [{(data.variant_b_ci[0] * 100).toFixed(2)}%, {(data.variant_b_ci[1] * 100).toFixed(2)}%]
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium">Variant A Mean:</span>{' '}
                          {data.variant_a_mean?.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Variant B Mean:</span>{' '}
                          {data.variant_b_mean?.toFixed(2)}
                        </div>
                        {data.variant_a_ci && (
                          <div>
                            <span>Variant A 95% CI:</span>{' '}
                            [{data.variant_a_ci[0]?.toFixed(2)}, {data.variant_a_ci[1]?.toFixed(2)}]
                          </div>
                        )}
                        {data.variant_b_ci && (
                          <div>
                            <span>Variant B 95% CI:</span>{' '}
                            [{data.variant_b_ci[0]?.toFixed(2)}, {data.variant_b_ci[1]?.toFixed(2)}]
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
