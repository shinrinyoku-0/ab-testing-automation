import { useFileUpload } from '../hooks/useFileUpload';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';
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
  } = useFileUpload();

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <Card>
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <p className="text-xs sm:text-sm text-blue-800">
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

        {/* Alerts */}
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
        {success && <Alert variant="success" className="mb-4">{success}</Alert>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Data Source Type */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Data Source Type
            </label>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Experiment Name
            </label>
            <input
              type="text"
              value={experimentName}
              onChange={(e) => setExperimentName(e.target.value)}
              placeholder="e.g., Homepage Redesign Test"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Experiment ID */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Experiment ID
            </label>
            <input
              type="text"
              value={experimentId}
              onChange={(e) => setExperimentId(e.target.value)}
              placeholder="e.g., 0 or exp_123"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This should match the experiment_id in your exposures CSV
            </p>
          </div>

          {/* File Inputs */}
          <div className="space-y-4">
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
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Upload & Run Analysis'}
          </Button>
        </form>

        {/* Display Results */}
        {analysisResults && (
          <div className="mt-8">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Analysis Results</h3>
            <div className="space-y-4">
              {Object.entries(analysisResults).map(([metricId, data]) => (
                <MetricResult key={metricId} metricId={metricId} data={data} />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FileUpload;
