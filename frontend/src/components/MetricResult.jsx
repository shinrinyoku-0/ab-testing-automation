import TimeSeriesChart from "./TimeSeriesChart";
import { Card, CardBody, CardHeader, Chip } from "@heroui/react";

const MetricResult = ({ metricId, data }) => {
  const isChiSquare = data.test === 'chi-square';
  
  const formatValue = (val) => 
    isChiSquare ?  `${(val * 100).toFixed(2)}%` : val?.toFixed(2);
  
  const variantAValue = isChiSquare 
    ? `${(data.variant_a_rate * 100).toFixed(2)}%`
    : data.variant_a_mean?.toFixed(2);
  
  const variantBValue = isChiSquare
    ? `${(data.variant_b_rate * 100).toFixed(2)}%`
    : data.variant_b_mean?.toFixed(2);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">{metricId}</h3>
      
      {/* Grid layout: Stats on left, Chart on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Statistical Results - Left Side */}
        <Card>
          <CardHeader>
            <h4 className="text-md font-semibold">Statistical Results</h4>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Test:</span> {data.test}
              </div>
              <div>
                <span className="font-medium">P-value: </span>
                {data['p-value']?.toFixed(4)}
              </div>
              <div>
                <span className="font-medium">Significant:</span>{' '}
                <Chip 
                  color={data.significance === 'YES' ? 'success' : 'default'}
                  variant="flat"
                  size="sm"
                >
                  {data.significance}
                </Chip>
              </div>
              <div>
                <span className="font-medium">Lift:</span>{' '}
                <Chip 
                  color={data.lift > 0 ? 'success' : 'danger'}
                  variant="flat"
                  size="sm"
                >
                  {(data.lift * 100).toFixed(2)}%
                </Chip>
              </div>
            </div>

            {/* Variant Values */}
            <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
              <div>
                <span className="font-medium">
                  Variant A {isChiSquare ? 'Rate' : 'Mean'}: 
                </span>{' '}
                {variantAValue}
              </div>
              <div>
                <span className="font-medium">
                  Variant B {isChiSquare ? 'Rate' : 'Mean'}:
                </span>{' '}
                {variantBValue}
              </div>
            </div>

            {/* Confidence Intervals */}
            <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
              {data.variant_a_ci && (
                <div>
                  <span className="font-medium">Variant A 95% CI:</span>{' '}
                  [{formatValue(data.variant_a_ci[0])}, {formatValue(data.variant_a_ci[1])}]
                </div>
              )}
              {data.variant_b_ci && (
                <div>
                  <span className="font-medium">Variant B 95% CI:</span>{' '}
                  [{formatValue(data.variant_b_ci[0])}, {formatValue(data.variant_b_ci[1])}]
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Time-series Chart - Right Side */}
        <div>
          {data.timeseries && data.timeseries.length > 0 ? (
            <TimeSeriesChart timeseries={data.timeseries} metricId={metricId} />
          ) : (
            <Card>
              <CardBody className="flex items-center justify-center p-8">
                <p className="text-sm text-gray-500">No time-series data available</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricResult;
