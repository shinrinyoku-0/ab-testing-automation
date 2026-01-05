import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import FileUpload from './FileUpload';
import SampleSizeCalculator from './SampleSizeCalculator';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const navigate = useNavigate();

  const tabs = [
    { id: 'upload', label: 'Upload & Analyze'},
    { id: 'sample-size', label: 'Sample Size Calculator'},
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upload': 
        return <FileUpload />;
      case 'sample-size':
        return <SampleSizeCalculator />;
      default:
        return <FileUpload />;
    }
  };

  return (
  <div className="min-h-screen bg-gray-50">
    {/* Header */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              A/B Testing Platform
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Analyze experiments, calculate sample sizes, and make data-driven decisions
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="primary"
            className="w-full sm:w-auto"
          >
            Logout
          </Button>
        </div>
      </div>


      {/* Tab Navigation */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? "primary" : "default"}
              className="px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 gap-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
