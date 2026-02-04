import { useFileUpload } from '../hooks/useFileUpload';
import { Alert, Card, CardBody, Button, Divider, Select, SelectItem, Input, Form, Switch, Tooltip } from '@heroui/react';
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
    applyCorrectionState,
    setApplyCorrection,
    shouldShowCorrectionToggle,
    handleJsonFileChange,
    handleExposuresFileChange,
    handleEventsFileChange,
    handleUsersFileChange,
    handleSubmit,
    handleLoadSampleData,
    handleDownloadSamples,
  } = useFileUpload();

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Sample Data Card */}
        <Card className="lg:w-[45%] h-fit">
          <CardBody className="p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-1">
                  New to AB testing analysis?
                </h3>
                <p className="text-medium text-gray-700">
                  See how it works with a demo dataset showing homepage redesign test results.
                </p>
              </div>
            </div>
        
            <div className="flex flex-wrap gap-4 mt-2">
              <Button
                color="primary"
                variant="solid"
                onPress={handleLoadSampleData}
                isDisabled={loading}
                startContent={!isUsingSampleData ? <SparklesIcon className="w-4 h-4" /> : undefined}
                className="text-medium h-12"
              >
                {isUsingSampleData ? 'Use your own data' : 'Try with Sample Data'}
              </Button>
        
              <Button
                color="default"
                variant="bordered"
                onPress={handleDownloadSamples}
                startContent={<ArrowDownTrayIcon className="w-4 h-4" />}
                className="text-medium h-12"
              >
                Download Samples
              </Button>
            </div>
          </CardBody>
        </Card>
        <div className='lg:w-[55%]'>
          <div className="bg-primary-50 border border-primary-200 rounded-lg px-8 py-8 pt-4 pb-4 w-full">
            <p className="text-xl text-primary-700 font-semibold mb-2">This tool is designed for A/B test analysis from raw event logs.</p>
            <Divider className='border-primary mt-4'></Divider>
            <p className="text-lg font-semibold text-primary-700 mt-4">Expected format:</p>
            <ul className={"text-medium ml-4 list-disc text-primary-700"}>
              <li key={0} className="mb-2">
                Exposures: user_id, experiment_id, variant, exposure_time
              </li>
              <li key={1} className="mb-2">
                Events: user_id, event_name, event_time, event_value (optional)
              </li>
              <li key={2} className="mb-2">
                Users (optional): user_id + any demographic columns (optional)
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardBody className="p-8">
          <div className="mt-0 mx-4 my-4">
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

                {/* <Select
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
                </Select> */}
          
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
                  <Select
                    label="Experiment ID"
                    placeholder={availableExperimentIds.length > 0 ? "Select experiment ID" : "Upload exposures file first"}
                    selectedKeys={experimentId ? [experimentId] : []}
                    onChange={(e) => setExperimentId(e.target.value)}
                    description="Extracted from exposures CSV"
                    isRequired
                    variant="bordered"
                    size="lg"
                    classNames={{
                      trigger: "h-16"
                    }}
                    className='md:col-span-1'
                    isDisabled={availableExperimentIds.length === 0}
                  >
                    {availableExperimentIds.map((id) => (
                      <SelectItem key={id} value={id}>
                        {id}
                      </SelectItem>
                    ))}
                  </Select>
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

                <div className='w-full'>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FileInput
                      id="jsonFile"
                      label="Metrics Config (JSON)"
                      accept=".json"
                      required={!isUsingSampleData}
                      file={jsonFile}
                      onChange={handleJsonFileChange}
                      icon={DocumentTextIcon}
                    />
                    <FileInput
                      id="exposuresFile"
                      label="Exposures CSV"
                      accept=".csv"
                      required={!isUsingSampleData}
                      file={exposuresFile}
                      onChange={handleExposuresFileChange}
                      icon={TableCellsIcon}
                    />
                    <FileInput
                      id="eventsFile"
                      label="Events CSV"
                      accept=".csv"
                      required={!isUsingSampleData}
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
              {shouldShowCorrectionToggle && (
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-4">
                    <Switch
                      isSelected={applyCorrectionState}
                      onValueChange={setApplyCorrection}
                      size="sm"
                      color="warning"
                    >
                    </Switch>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-md text-warning-800">Apply Statistical Rigor (Multi-test Correction)</span>
                        <Tooltip content="When testing multiple metrics simultaneously, this adjustment prevents false positives by controlling the False Discovery Rate using the Benjamini-Hochberg method."></Tooltip>
                      </div>
                      <p className="text-sm text-warning-700">
                        {Object.keys(metricDefinitions || {}).length} metrics detected. 
                        Recommended to keep this enabled to avoid misleading results.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Alert - show at top */}
              {error && <Alert variant="faded" color="danger" title={error} className="mb-4 mt-0" />}

              {/* Submit Button */}
              <div className="w-full flex items-center justify-center mb-4">
                <Button
                  type="submit"
                  color="primary"
                  variant="shadow"
                  size="lg"
                  isDisabled={loading}
                  className="font-semibold h-14 px-8"
                >
                  {loading ? 'Processing...' : 'Upload & Run Analysis'}
                </Button>
              </div>
            </Form>
            
            {/* Success Alert - show below button */}
            {success && <Alert variant="faded" color="success" title={success} className="mt-4" classNames={{title: "text-md"}}/>}
            
            {/* Display Results */}
            {analysisResults && (
              <div className="mt-8 pt-8 border-t border-divider">
                
                {/* Multiple Testing Correction Info Banner*/}
                {analysisResults._correction_info?.applied && (
                  <Alert color="primary" variant="faded" className="mb-6">
                    <div className="flex items-start gap-2">
                      <div>
                        <strong>Multiple testing correction applied:</strong> {analysisResults._correction_info.description}
                      </div>
                    </div>
                  </Alert>
                )}
                
                <h3 className="text-2xl font-bold mb-2">
                  Analysis Results for <span className="text-primary">{submittedExperimentName}</span> - Experiment ID: <span className="text-primary">{submittedExperimentId}</span>
                </h3>
                <div className="space-y-6 mt-6">
                  {Object.entries(analysisResults).filter(([metricId]) => !metricId.startsWith('_')).map(([metricId, data]) => (
                    <MetricResult 
                      key={metricId} 
                      metricId={metricId} 
                      data={data}
                      metricDefinitions={metricDefinitions}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default FileUpload;
