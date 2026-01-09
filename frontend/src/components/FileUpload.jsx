import { useFileUpload } from '../hooks/useFileUpload';
import { Alert, Card, CardBody, Button, Select, SelectItem, Input, Form } from '@heroui/react';
import FileInput from './FileInput';
import MetricResult from './MetricResult';
import { SparklesIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

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
    isUsingSampleData,
    handleJsonFileChange,
    handleExposuresFileChange,
    handleEventsFileChange,
    handleUsersFileChange,
    handleSubmit,
    handleLoadSampleData,
    handleDownloadSamples,
  } = useFileUpload();

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4">
      {/* Sample Data Card */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <SparklesIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">
                New to AB testing analysis?
              </h3>
              <p className="text-sm text-gray-600">
                See how it works with a demo dataset showing homepage redesign test results.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              color="primary"
              variant="solid"
              onPress={handleLoadSampleData}
              isDisabled={loading}
              startContent={<SparklesIcon className="w-4 h-4" />}
            >
              Try with Sample Data
            </Button>
            
            <Button
              color="default"
              variant="bordered"
              onPress={handleDownloadSamples}
              startContent={<ArrowDownTrayIcon className="w-4 h-4" />}
            >
              Download Samples
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Sample Data Banner */}
      {isUsingSampleData && (
        <Alert 
          variant="faded"
          color="primary" 
          title="You're viewing a demo dataset. Upload your own files to analyze real data." />
      )}

      <Card>
        <CardBody>
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm">
              <strong>This tool is designed for event-based A/B test data (web/mobile analytics).</strong>
            </p>
            <ul className="text-xs mt-2 ml-4 list-disc">
              <li>Exposures: user_id, experiment_id, variant, exposure_time</li>
              <li>Events: user_id, event_name, event_time, event_value (optional)</li>
              <li>Users: user_id + any demographic columns (optional)</li>
            </ul>
          </div>

          {/* Alerts */}
          {error && <Alert variant="faded" color="danger" title={error} />}
          {success && <Alert variant="faded" color="success" title={success} />}

          {/* Form */}
          <Form validationBehavior="native" onSubmit={handleSubmit} className="space-y-6">
          {/* Experiment Details Group */}
            <div className="space-y-4 pb-6 border-b">
              <h3 className="text-md font-semibold">Experiment Details</h3>
            {/* Data Source Type */}
            <Select
              label="Data Source Type"
              placeholder="Select data source"
              selectedKeys={[selectedOption]}
              onChange={(e) => setSelectedOption(e.target.value)}
              isRequired
              variant="faded"
              color="default"
            >
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>

            {/* Experiment Name */}
            <Input
              type="text"
              label="Experiment Name"
              placeholder="e.g., Homepage Redesign Test"
              value={experimentName}
              onChange={(e) => setExperimentName(e.target.value)}
              isRequired
              variant="bordered"
            />

            {/* Experiment ID */}
            <Input
              type="text"
              label="Experiment ID"
              placeholder="e.g., 0 or exp_123"
              value={experimentId}
              onChange={(e) => setExperimentId(e.target.value)}
              description="This should match the experiment_id in your exposures CSV"
              isRequired
              variant="bordered"
            />
          </div>

          {/* File Upload Group */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Upload Files</h3>
            
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
            color="primary"
            variant="solid"
            isDisabled={loading}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Upload & Run Analysis'}
          </Button>
          </Form>

          {/* Display Results */}
          {analysisResults && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Analysis Results</h3>
              <div className="space-y-4">
                {Object.entries(analysisResults).map(([metricId, data]) => (
                  <MetricResult key={metricId} metricId={metricId} data={data} />
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default FileUpload;
