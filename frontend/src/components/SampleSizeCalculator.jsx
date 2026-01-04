import { useState } from 'react';
import { calculateSampleSize } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AlertMessage from './AlertMessage';

const SampleSizeCalculator = () => {
  const [baselineRate, setBaselineRate] = useState('10');
  const [mde, setMde] = useState('5');
  const [alpha, setAlpha] = useState('5');
  const [power, setPower] = useState('80');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await calculateSampleSize({
        baseline_rate: parseFloat(baselineRate) / 100,
        mde:  parseFloat(mde) / 100,
        alpha: parseFloat(alpha) / 100,
        power: parseFloat(power) / 100,
      });

      setResult(data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || 'Calculation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2">Sample Size Calculator</h2>
        <p className="text-gray-600 text-sm mb-6">
          Calculate how many users you need per variant to detect a meaningful change
        </p>

        {/* Info Box */}
        <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-6">
          <p className="text-sm text-purple-800">
            <strong>How to use:</strong> Enter your current conversion rate and the minimum 
            improvement you want to detect.  This calculator uses a two-tailed test. 
          </p>
        </div>

        {/* Alert */}
        <AlertMessage type="error" message={error} />

        <div>
          {/* Baseline Rate */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Current Conversion Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={baselineRate}
              onChange={(e) => setBaselineRate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 10 for 10%"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your current conversion rate (e.g., 10% = 10)
            </p>
          </div>

          {/* MDE */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Minimum Detectable Effect (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={mde}
              onChange={(e) => setMde(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus: outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 5 for 5% relative change"
            />
            <p className="text-xs text-gray-500 mt-1">
              Relative change you want to detect (e.g., 5% means detecting 10% → 10. 5%)
            </p>
          </div>

          {/* Advanced Options Toggle */}
          <details className="mb-4">
            <summary className="text-sm font-semibold text-gray-700 cursor-pointer mb-2 hover:text-purple-600">
              Advanced Options
            </summary>
            
            <div className="pl-4 space-y-4">
              {/* Alpha */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Significance Level (α) %
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="20"
                  value={alpha}
                  onChange={(e) => setAlpha(e.target. value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Probability of false positive (standard:  5%)
                </p>
              </div>

              {/* Power */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Statistical Power (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="50"
                  max="99"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus: ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Probability of detecting real effect (standard: 80%)
                </p>
              </div>
            </div>
          </details>

          {/* Submit Button */}
          <button
            type='button'
            onClick={handleCalculate}
            disabled={loading}
            className="w-full bg-purple-500 text-white py-3 px-4 rounded-md hover:bg-purple-600 disabled:bg-purple-300 font-semibold transition-colors"
          >
            {loading ? 'Calculating...' :  'Calculate Sample Size'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-bold text-green-900 mb-4">Results</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-sm font-medium text-green-800">
                  Sample size per variant:
                </span>
                <span className="text-2xl font-bold text-green-900">
                  {result. sample_size_per_variant. toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-green-800">
                  Total sample size needed:
                </span>
                <span className="text-xl font-bold text-green-900">
                  {result.total_sample_size.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded border border-green-300">
              <p className="text-xs text-gray-700">
                {result.interpretation}
              </p>
            </div>

            <div className="mt-3 p-3 bg-green-100 rounded">
              <p className="text-xs text-green-800">
                <strong>Next step:</strong> Collect at least {result.sample_size_per_variant. toLocaleString()} users 
                in each variant before analyzing results.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SampleSizeCalculator;
