import Plot from "react-plotly.js";
import { Card } from "./ui/Card";
import { Alert } from "./ui/Alert";
import { Badge } from "./ui/Badge";

const TimeSeriesChart = ({ timeseries, metricId }) => {
  if (!timeseries || timeseries.length === 0) {
    return (
      <div className="mt-6">
        <Alert variant="info">
          <p className="text-sm">No time-series data available</p>
        </Alert>
      </div>
    );
  }

  // Get unique variants
  const variants = [...new Set(timeseries.map(d => d.variant))];
  
  // Color palette
  const colors = {
    A: '#8884d8',
    B: '#82ca9d',
    C: '#ffc658',
    D: '#ff7c7c',
  };

  // Prepare traces for metric values
  const metricTraces = variants.map(variant => {
    const variantData = timeseries
      .filter(d => d.variant === variant)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      x: variantData.map(d => d.date.split('T')[0]),
      y: variantData.map(d => d.metric_value),
      type: 'scatter',
      mode: 'lines+markers',
      name: `Variant ${variant}`,
      line: { 
        color: colors[variant] || '#000',
        width: 2 
      },
      marker: { 
        size: 6,
        color: colors[variant] || '#000'
      },
      hovertemplate: 
        '<b>Variant ' + variant + '</b><br>' +
        'Date: %{x}<br>' +
        'Value: %{y:.4f}<br>' +
        '<extra></extra>'
    };
  });

  // Prepare traces for sample size
  const sampleTraces = variants.map(variant => {
    const variantData = timeseries
      .filter(d => d.variant === variant)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      x: variantData.map(d => d.date.split('T')[0]),
      y: variantData.map(d => d.user_count),
      type: 'scatter',
      mode: 'lines+markers',
      name: `Variant ${variant}`,
      line: { 
        color: colors[variant] || '#000',
        width: 2 
      },
      marker: { 
        size: 6,
        color: colors[variant] || '#000'
      },
      hovertemplate: 
        '<b>Variant ' + variant + '</b><br>' +
        'Date: %{x}<br>' +
        'Users: %{y}<br>' +
        '<extra></extra>'
    };
  });

  // Layout for metric chart
  const metricLayout = {
    title: {
      text: 'Metric Over Time',
      font: { size: 16, weight: 600 }
    },
    xaxis: {
      title: 'Date',
      showgrid: true,
      gridcolor: '#e5e7eb'
    },
    yaxis: {
      title: 'Metric Value',
      showgrid: true,
      gridcolor: '#e5e7eb'
    },
    hovermode: 'closest',
    showlegend: true,
    legend: {
      x: 1,
      xanchor: 'right',
      y: 1
    },
    margin: { l: 60, r: 20, t: 50, b: 60 },
    height: 350,
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff'
  };

  // Layout for sample size chart
  const sampleLayout = {
    title: {
      text: 'Sample Size Over Time',
      font: { size: 16, weight: 600 }
    },
    xaxis: {
      title: 'Date',
      showgrid: true,
      gridcolor: '#e5e7eb'
    },
    yaxis: {
      title: 'User Count',
      showgrid: true,
      gridcolor: '#e5e7eb'
    },
    hovermode: 'closest',
    showlegend: true,
    legend: {
      x: 1,
      xanchor: 'right',
      y: 1
    },
    margin: { l: 60, r: 20, t: 50, b: 60 },
    height: 250,
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff'
  };

  // Configuration for both charts
  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    toImageButtonOptions: {
      format: 'png',
      filename: `${metricId}_timeseries`,
      height: 600,
      width: 1000,
      scale: 2
    }
  };

  return (
    <div className="mt-6 space-y-4 md:space-y-6 px-4 sm:px-0">
      {/* Metric value chart */}
      <Card className="p-4 md:p-6">
        <div className="w-full overflow-x-auto">
          <Plot
            data={metricTraces}
            layout={metricLayout}
            config={config}
            style={{ width: '100%', minWidth: '300px' }}
            useResizeHandler={true}
          />
        </div>
      </Card>

      {/* Sample size chart */}
      <Card className="p-4 md:p-6">
        <div className="w-full overflow-x-auto">
          <Plot
            data={sampleTraces}
            layout={sampleLayout}
            config={config}
            style={{ width: '100%', minWidth: '300px' }}
            useResizeHandler={true}
          />
        </div>
      </Card>

      {/* Data summary */}
      <Alert variant="info" className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <p className="font-semibold">Chart Tips</p>
        </div>
        <ul className="ml-4 space-y-2 list-disc text-sm">
          <li>Hover over points to see exact values</li>
          <li>Use zoom tools to focus on specific time periods</li>
          <li>Double-click to reset zoom</li>
          <li>Click legend items to show/hide variants</li>
          <li>Download as PNG using the camera icon</li>
        </ul>
      </Alert>

      {/* Variant badges */}
      <Card className="p-4 md:p-6">
        <p className="text-sm font-semibold mb-3">Active Variants</p>
        <div className="flex flex-wrap gap-2">
          {variants.map(variant => (
            <Badge key={variant} variant="secondary">
              Variant {variant}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TimeSeriesChart;
