import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from './FileUpload';
import SampleSizeCalculator from './SampleSizeCalculator';
// import TestSelector from './TestSelector'; // Future component

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const navigate = useNavigate();

  const tabs = [
    { id: 'upload', label: 'Upload & Analyze', icon: '📊' },
    { id: 'sample-size', label: 'Sample Size Calculator', icon: '🧮' },
    // { id: 'test-selector', label: 'Test Selector', icon: '🔍' }, // Future
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
      // case 'test-selector': 
      //   return <TestSelector />;
      default:
        return <FileUpload />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                A/B Testing Platform
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Analyze experiments, calculate sample sizes, and make data-driven decisions
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600 transition-colors font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-3 text-sm font-medium transition-colors
                  border-b-2 whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
