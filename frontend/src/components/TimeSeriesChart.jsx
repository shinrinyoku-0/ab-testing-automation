import Plot from "react-plotly.js";
import { Card, CardBody, Chip, Alert } from "@heroui/react";

const TimeSeriesChart = ({ timeseries, metricId }) => {
  if (!timeseries || timeseries.length === 0) {
    return (
      <div className="mt-6">
        <Alert variant="faded" color="primary" title="No time-series data available" />
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
    <div className="space-y-4">
      {/* Metric value chart */}
      <Card>
        <CardBody>
          <Plot
            data={metricTraces}
            layout={metricLayout}
            config={config}
            style={{ width: '100%', minWidth: '300px' }}
            useResizeHandler={true}
          />
        </CardBody>
      </Card>

      {/* Sample size chart */}
      <Card>
        <CardBody>
          <Plot
            data={sampleTraces}
            layout={sampleLayout}
            config={config}
            style={{ width: '100%', minWidth: '300px' }}
            useResizeHandler={true}
          />
        </CardBody>
      </Card>

      {/* Data summary */}
      <Alert 
        variant="faded"
        color="primary" 
        title="Chart Tips: Hover over points to see exact values. Use zoom tools to focus on specific time periods. Double-click to reset zoom. Click legend items to show/hide variants. Download as PNG using the camera icon." 
      />

      {/* Variant badges */}
      <Card>
        <CardBody>
          <p className="text-sm font-semibold mb-3">Active Variants</p>
          <div className="flex flex-wrap gap-2">
            {variants.map(variant => (
              <Chip key={variant} color="secondary" variant="flat">
                Variant {variant}
              </Chip>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TimeSeriesChart;
