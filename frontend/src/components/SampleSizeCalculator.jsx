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
      } else if (err.response?.status === 422) {
        return;
      } else {
        // Handle other errors (400, 500, etc.)
        const errorMessage = err.response?.data?.detail || 'Calculation failed';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardBody className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Sample Size Calculator</h2>
          <p className="text-medium text-gray-700 mt-2">
            Calculate how many users you need per variant to detect a meaningful change
          </p>
        </div>

        {/* Info Alert */}
        <Alert variant="faded" color="secondary" 
          title="This calculator uses a two-tailed test - it detects changes in either direction (increases or decreases)." 
          className="mb-4" 
          classNames={{title: "text-medium",}}/>

        {/* Error Alert */}
        {error && <Alert variant="faded" color="danger" title={error} className="mb-4" classNames={{title: "text-medium",}}/>}

        <div className="space-y-6">
          {/* Baseline Rate and MDE - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-0">
            <Input
              label="Current Conversion Rate (%)"
              type="number"
              step="0.1"
              min="0.1"
              max="99"
              value={baselineRate}
              onChange={(e) => setBaselineRate(e.target.value)}
              placeholder="e.g., 10 for 10%"
              description="Your current conversion rate (e.g., 10% = 10)"
              variant="bordered"
              classNames={{
                label: "text-base text-medium font-semibold",
                description: "text-sm text-zinc-500"
              }}
            />

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
              classNames={{
                label: "text-base text-medium font-semibold",
                description: "text-sm text-zinc-500"
              }}
            />
          </div>

          {/* Advanced Options Toggle */}
          <details className="group">
            <summary className="text-medium font-semibold cursor-pointer py-2 hover:text-secondary transition-colors">
              Advanced Options
            </summary>

            <div className="space-y-4 pt-4">
              {/* Alpha and Power - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Significance Level (α) %"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="20"
                  value={alpha}
                  onChange={(e) => setAlpha(e.target.value)}
                  description="Probability of false positive (standard: 5%, max: 20%)"
                  variant="bordered"
                  classNames={{
                    label: "text-base text-medium font-semibold",
                    description: "text-sm text-zinc-500"
                  }}
                />

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
                  classNames={{
                    label: "text-base text-medium font-semibold",
                    description: "text-sm text-zinc-500"
                  }}
                />
              </div>
            </div>
          </details>

          {/* Submit Button */}
          <Button
            color="secondary"
            variant="flat"
            size="lg"
            onPress={handleCalculate}
            isDisabled={loading}
            className="w-full font-semibold"
          >
            {loading ? 'Calculating...' : 'Calculate Sample Size'}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <Card className="bg-green-50 mt-6">
            <CardBody className="space-y-4">
              <div className="mt-4 mb-4 mx-8 my-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-green-900">Results</h3>
                  <Chip color="success" variant="flat">
                    Complete
                  </Chip>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-medium font-medium text-green-800">
                      Sample size per variant:
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {result.sample_size_per_variant.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-medium font-medium text-green-800">
                      Total sample size needed:
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {result.total_sample_size.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Alert variant="faded" color="primary" title={result.interpretation} className='mt-8' classNames={{title: "text-medium"}}/>
              </div>
            </CardBody>
          </Card>
        )}
      </CardBody>
    </Card>
  );
};

export default SampleSizeCalculator;
