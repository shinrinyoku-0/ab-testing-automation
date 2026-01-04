import Plot from "react-plotly.js";

const TimeSeriesChart = ({ timeseries, metricId }) => {
  if (!timeseries || timeseries.length === 0) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-sm">No time-series data available</p>
      </div>
    );
  }

  // Get unique variants
  const variants = [... new Set(timeseries.map(d => d.variant))];
  
  // Color palette
  const colors = {
    A: '#8884d8',
    B:  '#82ca9d',
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
      name:  `Variant ${variant}`,
      line: { 
        color: colors[variant] || '#000',
        width: 2 
      },
      marker:  { 
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
    title:  {
      text: 'Metric Over Time',
      font: { size: 16, weight: 600 }
    },
    xaxis:  {
      title: 'Date',
      showgrid: true,
      gridcolor: '#e5e7eb'
    },
    yaxis:  {
      title: 'Metric Value',
      showgrid: true,
      gridcolor:  '#e5e7eb'
    },
    hovermode:  'closest',
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
      title:  'Date',
      showgrid: true,
      gridcolor: '#e5e7eb'
    },
    yaxis:  {
      title: 'User Count',
      showgrid:  true,
      gridcolor: '#e5e7eb'
    },
    hovermode: 'closest',
    showlegend: true,
    legend: {
      x: 1,
      xanchor: 'right',
      y: 1
    },
    margin: { l: 60, r: 20, t: 50, b:  60 },
    height:  250,
    plot_bgcolor: '#ffffff',
    paper_bgcolor:  '#ffffff'
  };

  // Configuration for both charts
  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove:  ['pan2d', 'lasso2d', 'select2d'],
    toImageButtonOptions: {
      format: 'png',
      filename: `${metricId}_timeseries`,
      height: 600,
      width:  1000,
      scale: 2
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {/* metric value chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Plot
          data={metricTraces}
          layout={metricLayout}
          config={config}
          style={{ width: '100%' }}
          useResizeHandler={true}
        />
      </div>

      {/* sample size chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Plot
          data={sampleTraces}
          layout={sampleLayout}
          config={config}
          style={{ width: '100%' }}
          useResizeHandler={true}
        />
      </div>

      {/* data summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Chart Tips:</strong>
        </p>
        <ul className="text-xs text-blue-700 mt-2 ml-4 list-disc space-y-1">
          <li>Hover over points to see exact values</li>
          <li>Use zoom tools to focus on specific time periods</li>
          <li>Double-click to reset zoom</li>
          <li>Click legend items to show/hide variants</li>
          <li>Download as PNG using the camera icon</li>
        </ul>
      </div>
    </div>
  );
};

export default TimeSeriesChart;
