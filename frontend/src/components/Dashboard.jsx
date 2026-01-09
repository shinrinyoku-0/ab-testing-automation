import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tabs, Tab } from '@heroui/react';
import FileUpload from './FileUpload';
import SampleSizeCalculator from './SampleSizeCalculator';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
  <div className="min-h-screen bg-gray-50">
    {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              A/B Testing Platform
            </h1>
            <p className="text-medium text-gray-600 mt-2">
              Analyze experiments, calculate sample sizes, and make data-driven decisions
            </p>
          </div>
          <Button
            onPress={handleLogout}
            color="primary"
            variant="solid"
            className="w-full sm:w-auto"
          >
            Logout
          </Button>
        </div>
      </div>


      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 mb-4">
        <Tabs 
          selectedKey={activeTab} 
          onSelectionChange={setActiveTab}
          variant="solid"
          color="primary"
          classNames={{
            tabList: "w-full",
            tab: "w-full"
          }}
        >
          <Tab key="upload" title="Upload & Analyze" />
          <Tab key="sample-size" title="Sample Size Calculator" />
        </Tabs>
      </div>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {activeTab === 'upload' && <FileUpload />}
        {activeTab === 'sample-size' && <SampleSizeCalculator />}
      </main>
    </div>
  );
};

export default Dashboard;
