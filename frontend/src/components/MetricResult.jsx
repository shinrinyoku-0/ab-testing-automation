import ChartTabs from "./charts/ChartTabs";
import { Card, CardBody, CardHeader, Chip, Tooltip } from "@heroui/react";
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const MetricResult = ({ metricId, data, metricDefinitions }) => {
  const isChiSquare = data.test === 'chi-square';
  
  // Get display name from metric definitions, fallback to metricId
  const getDisplayName = () => {
    if (metricDefinitions) {
      // Search through all metric definitions to find matching metric_id
      const metricConfig = Object.values(metricDefinitions).find(
        (config) => config.metric_id === metricId
      );
      if (metricConfig) {
        return metricConfig.display_name || metricConfig.metric_id || metricId;
      }
    }
    return metricId;
  };
  
  const displayName = getDisplayName();
  
  const formatValue = (val) => 
    isChiSquare ?  `${(val * 100).toFixed(2)}%` : val?.toFixed(2);
  
  const variantAValue = isChiSquare 
    ? `${(data.variant_a_rate * 100).toFixed(2)}%`
    : data.variant_a_mean?.toFixed(2);
  
  const variantBValue = isChiSquare
    ? `${(data.variant_b_rate * 100).toFixed(2)}%`
    : data.variant_b_mean?.toFixed(2);

  const getEffectSizeInterpretation = (effectSize) => {
    if (!effectSize || effectSize === 'N/A') return { label: 'N/A', color: 'default' };
    const absEffect = Math.abs(parseFloat(effectSize));
    if (absEffect < 0.2) return { label: 'Small', color: 'default' };
    if (absEffect < 0.5) return { label: 'Medium', color: 'warning' };
    return { label: 'Large', color: 'success' };
  };

  const effectInterpretation = getEffectSizeInterpretation(data.effect_size);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold">{displayName}</h3>
        <Chip 
          color={data.significance === 'YES' ? 'success' : 'default'}
          variant="flat"
          size="sm"
          className="font-semibold"
        >
          {data.significance === 'YES' ? '✓ Significant' : 'Not Significant'}
        </Chip>
      </div>
    
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        
        <div className="space-y-3">
          {/* Key Metrics Card */}
          <Card className="shadow-sm">
            <CardBody className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Test Type</span>
                  <span className="font-semibold text-sm">{data.test}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">P-value</span>
                  <Chip 
                    size="sm" 
                    variant="flat"
                    color={data['p-value'] < 0.05 ? 'success' : 'default'}
                  >
                    {data['p-value']?.toFixed(4)}
                  </Chip>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lift</span>
                  <Chip 
                    size="sm"
                    color={data.lift > 0 ? 'success' : data.lift < 0 ? 'danger' : 'default'}
                    variant="flat"
                  >
                    {data.lift > 0 ? '+' : ''}{(data.lift * 100).toFixed(2)}%
                  </Chip>
                </div>

                {data.effect_size && data.effect_size !== 'N/A' && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">Effect Size</span>
                      <Tooltip content={isChiSquare 
                        ? "Cohen's h: measures difference between proportions. Small: <0.2, Medium: 0.2-0.5, Large: >0.5"
                        : "Cohen's d: measures difference in means. Small: <0.2, Medium: 0.2-0.8, Large: >0.8"
                      }>
                        <InformationCircleIcon className="w-4 h-4 text-gray-400" />
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-semibold">
                        {typeof data.effect_size === 'number' ? data.effect_size.toFixed(3) : data.effect_size}
                      </span>
                      <Chip 
                        size="sm"
                        color={effectInterpretation.color}
                        variant="flat"
                      >
                        {effectInterpretation.label}
                      </Chip>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2 pt-3 px-4">
              <h4 className="text-sm font-semibold text-gray-700">Variant Comparison</h4>
            </CardHeader>
            <CardBody className="pt-0 p-4 space-y-3">
              {/* Variant A */}
            <div 
              className="rounded-lg p-3 border" 
              style={{ backgroundColor: "#EBEBFF", borderColor: "#5253A1" }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium" style={{ color: "#5253A1" }}>
                  Variant A (Control)
                </span>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: "#5253A1" }}>
                {variantAValue}
              </div>
              {data.variant_a_ci && (
                <div className="text-xs" style={{ color: "#5253A1" }}>
                  95% CI: [{formatValue(data.variant_a_ci[0])}, {formatValue(data.variant_a_ci[1])}]
                </div>
              )}
            </div>

              {/* Variant B */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-green-900">Variant B (Treatment)</span>
                </div>
                <div className="text-2xl font-bold text-green-900 mb-1">
                  {variantBValue}
                </div>
                {data.variant_b_ci && (
                  <div className="text-xs text-green-900">
                    95% CI: [{formatValue(data.variant_b_ci[0])}, {formatValue(data.variant_b_ci[1])}]
                  </div>
                )}
              </div>

              {/* Sample Sizes */}
              {data.variant_a_n && data.variant_b_n && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Sample Sizes:</span>
                    <span>A: {data.variant_a_n.toLocaleString()} | B: {data.variant_b_n.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="min-h-100">
          {(data.daily_timeseries && data.daily_timeseries.length > 0) ||
          (data.cumulative_timeseries && data.cumulative_timeseries.length > 0) ||
          (data.distribution && Object.keys(data.distribution).length > 0) ||
          (data.lift_timeseries && data.lift_timeseries.length > 0) ||
          (data.ci_timeseries && data.ci_timeseries.length > 0) ? (
            <ChartTabs
              metricId={metricId}
              dailyTimeseries={data.daily_timeseries}
              cumulativeTimeseries={data.cumulative_timeseries}
              distribution={data.distribution}
              liftTimeseries={data.lift_timeseries}
              ciTimeseries={data.ci_timeseries}
              windowEndMarker={data.window_end_marker}
            />
          ) : (
            <Card className="h-full shadow-sm">
              <CardBody className="flex items-center justify-center p-8">
                <p className="text-sm text-gray-500">No chart data available</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricResult;
