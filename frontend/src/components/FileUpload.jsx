import { useFileUpload } from '../hooks/useFileUpload';
import AlertMessage from './AlertMessage';
import FileInput from './FileInput';
import MetricResult from './MetricResult';

const FileUpload = () => {
  const {
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
    handleJsonFileChange,
    handleExposuresFileChange,
    handleEventsFileChange,
    handleUsersFileChange,
    handleSubmit,
    handleLogout,
  } = useFileUpload();

  return (
    <div className="">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Upload Files</h2>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>This tool is designed for event-based A/B test data (web/mobile analytics).</strong>
              <br />
              Expected format: 
            </p>
            <ul className="text-xs text-blue-700 mt-2 ml-4 list-disc">
              <li>Exposures:  user_id, experiment_id, variant, exposure_time</li>
              <li>Events: user_id, event_name, event_time, event_value (optional)</li>
              <li>Users: user_id + any demographic columns (optional)</li>
            </ul>
          </div>

          {/* Alerts */}
          <AlertMessage type="error" message={error} />
          <AlertMessage type="success" message={success} />

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Data Source Type */}
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

            {/* Experiment Name */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Experiment Name
              </label>
              <input
                type="text"
                value={experimentName}
                onChange={(e) => setExperimentName(e.target.value)}
                placeholder="e.g., Homepage Redesign Test"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Experiment ID */}
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

            {/* File Inputs */}
            <FileInput
              id="jsonFile"
              label="Metrics Config (JSON)"
              accept=".json"
              required
              file={jsonFile}
              onChange={handleJsonFileChange}
            />

            <FileInput
              id="exposuresFile"
              label="Exposures CSV"
              accept=".csv"
              required
              file={exposuresFile}
              onChange={handleExposuresFileChange}
            />

            <FileInput
              id="eventsFile"
              label="Events CSV"
              accept=".csv"
              required
              file={eventsFile}
              onChange={handleEventsFileChange}
            />

            <FileInput
              id="usersFile"
              label="Users CSV (Optional)"
              accept=".csv"
              file={usersFile}
              onChange={handleUsersFileChange}
              helperText="For future segmentation features"
            />

            {/* Submit Button */}
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
<<<<<<< HEAD
                <MetricResult key={metricId} metricId={metricId} data={data} />
=======
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
>>>>>>> 01a9e895b8284d7f502e14012bdf0fb864c1a0c4
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
