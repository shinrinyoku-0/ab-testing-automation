import { useState } from 'react';
import { calculateSampleSize } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Input, Chip, Alert } from '@heroui/react';

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
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardBody className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Sample Size Calculator</h2>
            <p className="text-sm text-gray-600 mt-2">
              Calculate how many users you need per variant to detect a meaningful change
            </p>
          </div>

          {/* Info Alert */}
          <Alert variant="faded" color="primary" title="Enter your current conversion rate and the minimum improvement you want to detect. This calculator uses a two-tailed test." />

          {/* Error Alert */}
          {error && <Alert variant="faded" color="danger" title={error} />}

          <div className="space-y-6">
            {/* Baseline Rate */}
            <Input
              label="Current Conversion Rate (%)"
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={baselineRate}
              onChange={(e) => setBaselineRate(e.target.value)}
              placeholder="e.g., 10 for 10%"
              description="Your current conversion rate (e.g., 10% = 10)"
              variant="bordered"
            />

            {/* MDE */}
            <Input
              label="Minimum Detectable Effect (%)"
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={mde}
              onChange={(e) => setMde(e.target.value)}
              placeholder="e.g., 5 for 5% relative change"
              description="Relative change you want to detect (e.g., 5% means detecting 10% → 10.5%)"
              variant="bordered"
            />

            {/* Advanced Options Toggle */}
            <details className="group">
              <summary className="text-sm font-semibold cursor-pointer py-2 hover:text-primary transition-colors">
                Advanced Options
              </summary>

              <div className="space-y-4 mt-4 pt-4 border-t">
                {/* Alpha */}
                <Input
                  label="Significance Level (α) %"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="20"
                  value={alpha}
                  onChange={(e) => setAlpha(e.target.value)}
                  description="Probability of false positive (standard: 5%)"
                  variant="bordered"
                />

                {/* Power */}
                <Input
                  label="Statistical Power (%)"
                  type="number"
                  step="1"
                  min="50"
                  max="99"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  description="Probability of detecting real effect (standard: 80%)"
                  variant="bordered"
                />
              </div>
            </details>

            {/* Submit Button */}
            <Button
              color="primary"
              variant="solid"
              size="lg"
              onPress={handleCalculate}
              isDisabled={loading}
              className="w-full"
            >
              {loading ? 'Calculating...' : 'Calculate Sample Size'}
            </Button>
          </div>

          {/* Results */}
          {result && (
            <Card className="bg-green-50 mt-6">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-green-900">Results</h3>
                  <Chip color="success" variant="flat">
                    Complete
                  </Chip>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Sample size per variant:
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {result.sample_size_per_variant.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Total sample size needed:
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {result.total_sample_size.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Alert variant="faded" color="primary" title={result.interpretation} />
                  <Alert 
                    variant="faded"
                    color="success" 
                    title={`Next step: Collect at least ${result.sample_size_per_variant.toLocaleString()} users in each variant before analyzing results.`} 
                  />
                </div>
              </CardBody>
            </Card>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default SampleSizeCalculator;
