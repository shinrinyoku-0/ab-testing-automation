import TimeSeriesChart from "./TimeSeriesChart";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Badge } from "./ui/Badge";

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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{metricId}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Test:</span> {data.test}
            </div>
            <div>
              <span className="font-medium">P-value: </span>
              {data['p-value']?.toFixed(4)}
            </div>
            <div>
              <span className="font-medium">Significant:</span>{' '}
              <Badge variant={data.significance === 'YES' ? 'success' : 'neutral'}>
                {data.significance}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Lift:</span>{' '}
              <Badge variant={data.lift > 0 ? 'success' : 'error'}>
                {(data.lift * 100).toFixed(2)}%
              </Badge>
            </div>
          </div>

          {/* Variant Values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t pt-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t pt-4">
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
        </CardContent>
      </Card>

      {/* Time-series Chart */}
      {data.timeseries && data.timeseries.length > 0 && (
        <div className="mt-6">
          <TimeSeriesChart timeseries={data.timeseries} metricId={metricId} />
        </div>
      )}
    </div>
  );
};

export default MetricResult;
