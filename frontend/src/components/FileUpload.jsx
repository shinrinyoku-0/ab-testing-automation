import { useFileUpload } from '../hooks/useFileUpload';
import { useState } from 'react';
import { Alert, Card, CardBody, Button, Select, SelectItem, Input, Form } from '@heroui/react';
import FileInput from './FileInput';
import MetricResult from './MetricResult';
import { SparklesIcon, ArrowDownTrayIcon, DocumentTextIcon, TableCellsIcon, UserGroupIcon } from '@heroicons/react/24/outline';

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
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      {/* Sample Data Card */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold mb-1">
                New to AB testing analysis?
              </h3>
              <p className="text-medium text-gray-600">
                See how it works with a demo dataset showing homepage redesign test results.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 m-4">
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

      <Card className="shadow-lg">
        <CardBody className="p-8">
          <div className="mt-0 mx-4 my-4">
            {/* Alerts */}
            {error && <Alert variant="faded" color="danger" title={error} className="mb-4 mt-0" />}
            {success && <Alert variant="faded" color="success" title={success} className="mb-4 mt-0" />}
            {/* Form */}
            <Form validationBehavior="native" onSubmit={handleSubmit} className="space-y-8">
              {/* Experiment Details Group */}
              <div className="space-y-5 mb-8 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-sm">1</span>
                  </div>
                  <h3 className="text-xl font-semibold">Experiment Details</h3>
                </div>
                {/* Data Source Type - Full Width */}
                <Select
                  label="Data Source Type"
                  placeholder="Select data source"
                  selectedKeys={[selectedOption]}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  isRequired
                  variant="bordered"
                  size="lg"
                  classNames={{
                    trigger: "h-16"
                  }}
                >
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
          
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    isClearable
                    type="text"
                    label="Experiment Name"
                    placeholder="e.g., Homepage Redesign Test"
                    value={experimentName}
                    onChange={(e) => setExperimentName(e.target.value)}
                    onClear={(e) => setExperimentName("")}
                    isRequired
                    variant="bordered"
                    size="lg"
                    classNames={{
                      input: "text-base",
                      inputWrapper: "h-16"
                    }}
                    className='md:col-span-2'
                  />
                  <Input
                    type="text"
                    label="Experiment ID"
                    placeholder="e.g., 0 or exp_123"
                    value={experimentId}
                    onChange={(e) => setExperimentId(e.target.value)}
                    description="This should match the experiment_id in your exposures CSV"
                    isRequired
                    variant="bordered"
                    size="lg"
                    classNames={{
                      input: "text-base",
                      inputWrapper: "h-16"
                    }}
                    className='md:col-span-1'
                  />
                </div>
              </div>
              {/* File Upload Group */}
              <div className="space-y-5 mb-8 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <span className="text-secondary-600 font-bold text-sm">2</span>
                  </div>
                  <h3 className="text-xl font-semibold">Upload Files</h3>
                </div>
                {/* 2x2 Grid for File Uploads */}
                <div className='w-full'>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FileInput
                      id="jsonFile"
                      label="Metrics Config (JSON)"
                      accept=".json"
                      required
                      file={jsonFile}
                      onChange={handleJsonFileChange}
                      icon={DocumentTextIcon}
                    />
                    <FileInput
                      id="exposuresFile"
                      label="Exposures CSV"
                      accept=".csv"
                      required
                      file={exposuresFile}
                      onChange={handleExposuresFileChange}
                      icon={TableCellsIcon}
                    />
                    <FileInput
                      id="eventsFile"
                      label="Events CSV"
                      accept=".csv"
                      required
                      file={eventsFile}
                      onChange={handleEventsFileChange}
                      icon={TableCellsIcon}
                    />
                    <FileInput
                      id="usersFile"
                      label="Users CSV (Optional)"
                      accept=".csv"
                      file={usersFile}
                      onChange={handleUsersFileChange}
                      helperText="For future segmentation features"
                      icon={UserGroupIcon}
                    />
                  </div>
                </div>
              </div>
              {/* Submit Button */}
              <Button
                type="submit"
                color="primary"
                variant="shadow"
                size="lg"
                isDisabled={loading}
                className="w-full font-semibold h-14"
              >
                {loading ? 'Processing...' : 'Upload & Run Analysis'}
              </Button>
            </Form>
            {/* Display Results */}
            {analysisResults && (
              <div className="mt-8 pt-8 border-t border-divider">
                <h3 className="text-xl font-semibold mb-6">Analysis Results</h3>
                <div className="space-y-6">
                  {Object.entries(analysisResults).map(([metricId, data]) => (
                    <MetricResult key={metricId} metricId={metricId} data={data} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default FileUpload;
