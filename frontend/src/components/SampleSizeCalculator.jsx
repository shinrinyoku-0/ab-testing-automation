import { useState } from 'react';
import { calculateSampleSize } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Alert } from './ui/Alert';
import { Badge } from './ui/Badge';

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
        mde: parseFloat(mde) / 100,
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
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <Card className="w-full max-w-2xl">
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Sample Size Calculator</h2>
            <p className="text-gray-600 text-sm mt-2">
              Calculate how many users you need per variant to detect a meaningful change
            </p>
          </div>

          {/* Info Alert */}
          <Alert variant="info" className="space-y-2">
            <p className="text-sm font-semibold">How to use:</p>
            <p className="text-sm">
              Enter your current conversion rate and the minimum improvement you want to detect. 
              This calculator uses a two-tailed test.
            </p>
          </Alert>

          {/* Error Alert */}
          {error && <Alert variant="error" message={error} />}

          <div className="space-y-6">
            {/* Baseline Rate */}
            <div className="space-y-2">
              <Label htmlFor="baseline">Current Conversion Rate (%)</Label>
              <Input
                id="baseline"
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={baselineRate}
                onChange={(e) => setBaselineRate(e.target.value)}
                placeholder="e.g., 10 for 10%"
              />
              <p className="text-xs text-gray-500">
                Your current conversion rate (e.g., 10% = 10)
              </p>
            </div>

            {/* MDE */}
            <div className="space-y-2">
              <Label htmlFor="mde">Minimum Detectable Effect (%)</Label>
              <Input
                id="mde"
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={mde}
                onChange={(e) => setMde(e.target.value)}
                placeholder="e.g., 5 for 5% relative change"
              />
              <p className="text-xs text-gray-500">
                Relative change you want to detect (e.g., 5% means detecting 10% → 10.5%)
              </p>
            </div>

            {/* Advanced Options Toggle */}
            <details className="group">
              <summary className="text-sm font-semibold text-gray-700 cursor-pointer py-2 hover:text-primary transition-colors">
                Advanced Options
              </summary>

              <div className="pl-0 sm:pl-4 space-y-4 mt-4 pt-4 border-t border-gray-200">
                {/* Alpha */}
                <div className="space-y-2">
                  <Label htmlFor="alpha">Significance Level (α) %</Label>
                  <Input
                    id="alpha"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="20"
                    value={alpha}
                    onChange={(e) => setAlpha(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Probability of false positive (standard: 5%)
                  </p>
                </div>

                {/* Power */}
                <div className="space-y-2">
                  <Label htmlFor="power">Statistical Power (%)</Label>
                  <Input
                    id="power"
                    type="number"
                    step="1"
                    min="50"
                    max="99"
                    value={power}
                    onChange={(e) => setPower(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Probability of detecting real effect (standard: 80%)
                  </p>
                </div>
              </div>
            </details>

            {/* Submit Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleCalculate}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Calculating...' : 'Calculate Sample Size'}
            </Button>
          </div>

          {/* Results */}
          {result && (
            <Card className="bg-green-50 border-green-200 mt-6">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-green-900">Results</h3>
                  <Badge variant="success">Complete</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-green-800">
                      Sample size per variant:
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-green-900">
                      {result.sample_size_per_variant.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-green-800">
                      Total sample size needed:
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-green-900">
                      {result.total_sample_size.toLocaleString()}
                    </p>
                  </div>
                </div>

                <Alert variant="info" className="bg-white border-green-300">
                  <p className="text-xs sm:text-sm text-gray-700">
                    {result.interpretation}
                  </p>
                </Alert>

                <Alert variant="success">
                  <p className="text-xs sm:text-sm text-green-800">
                    <strong>Next step:</strong> Collect at least{' '}
                    {result.sample_size_per_variant.toLocaleString()} users in each variant 
                    before analyzing results.
                  </p>
                </Alert>
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SampleSizeCalculator;
