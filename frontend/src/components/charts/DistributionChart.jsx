import Plot from "react-plotly.js";
import { Card, CardBody, Alert } from "@heroui/react";

const DistributionChart = ({ distribution, metricId }) => {
  if (!distribution) {
    return <Alert variant="faded" color="primary" title="No distribution data available" className="mt-4" />;
  }

  const variants = Object.keys(distribution);
  if (variants.length === 0) {
    return <Alert variant="faded" color="primary" title="No distribution data available" className="mt-4" />;
  }

  // Check if this is binary or histogram type
  const firstVariant = distribution[variants[0]];
  const isBinary = firstVariant.type === 'binary';

  if (isBinary) {
    // Bar chart for binary metrics (converted vs not converted)
    const traces = variants.map((variantKey, idx) => {
      const data = distribution[variantKey];
      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];
      
      return {
        x: ['Not Converted', 'Converted'],
        y: [data.not_converted, data.converted],
        type: 'bar',
        name: variantKey.replace('variant_', 'Variant '),
        marker: { color: colors[idx] },
        text: [
          `${data.not_converted} (${((data.not_converted / (data.converted + data.not_converted)) * 100).toFixed(1)}%)`,
          `${data.converted} (${(data.conversion_rate * 100).toFixed(1)}%)`
        ],
        textposition: 'auto',
        hovertemplate: '<b>%{x}</b><br>Count: %{y}<br><extra></extra>',
      };
    });

    const layout = {
      title: { text: "Conversion Distribution", font: { size: 16, weight: 600 } },
      xaxis: { 
        title: { text: "Status", font: { size: 14 } }
      },
      yaxis: { 
        title: { text: "Number of Users", font: { size: 14 } }
      },
      barmode: 'group',
      showlegend: true,
      legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.25, yanchor: "top" },
      margin: { l: 60, r: 20, t: 50, b: 0 },
      height: 350,
      plot_bgcolor: "#ffffff",
      paper_bgcolor: "#ffffff",
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
      toImageButtonOptions: {
        format: "png",
        filename: `${metricId}_distribution`,
        height: 600,
        width: 1000,
        scale: 2,
      },
    };

    return (
      <Card className="mt-4">
        <CardBody>
          <Plot 
            data={traces} 
            layout={layout} 
            config={config} 
            style={{ width: "100%", minWidth: "300px" }} 
            useResizeHandler 
          />
          
          {/* Summary stats */}
          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
            {variants.map((variantKey) => {
              const data = distribution[variantKey];
              return (
                <div key={variantKey} className="space-y-1">
                  <div className="font-semibold">{variantKey.replace('variant_', 'Variant ')}</div>
                  <div>Conversion Rate: {(data.conversion_rate * 100).toFixed(2)}%</div>
                  <div>Total Users: {data.converted + data.not_converted}</div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    );
  }

  // Histogram for sum/count metrics
  const colors = { A: "#8884d8", B: "#82ca9d", C: "#ffc658", D: "#ff7c7c" };
  
  const traces = variants.map((variantKey) => {
    const data = distribution[variantKey];
    const variantLetter = variantKey.replace('variant_', '');
    
    return {
      x: data.values,
      type: 'histogram',
      name: `Variant ${variantLetter}`,
      opacity: 0.7,
      marker: { color: colors[variantLetter] || "#000" },
      autobinx: false,
      xbins: {
        start: data.bins[0],
        end: data.bins[data.bins.length - 1],
        size: (data.bins[1] - data.bins[0]) || 1
      },
      hovertemplate: '<b>Variant ' + variantLetter + '</b><br>Range: %{x}<br>Count: %{y}<br><extra></extra>',
    };
  });

  const layout = {
    title: { text: "Distribution of Metric Values", font: { size: 16, weight: 600 } },
    xaxis: { 
      title: { text: "Metric Value", font: { size: 14 } }
    },
    yaxis: { 
      title: { text: "Number of Users", font: { size: 14 } }
    },
    barmode: 'overlay',
    showlegend: true,
    legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.25, yanchor: "top" },
    margin: { l: 60, r: 20, t: 50, b: 0 },
    height: 350,
    plot_bgcolor: "#ffffff",
    paper_bgcolor: "#ffffff",
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
    toImageButtonOptions: {
      format: "png",
      filename: `${metricId}_distribution`,
      height: 600,
      width: 1000,
      scale: 2,
    },
  };

  return (
    <Card className="mt-4">
      <CardBody>
        <Plot 
          data={traces} 
          layout={layout} 
          config={config} 
          style={{ width: "100%", minWidth: "300px" }} 
          useResizeHandler 
        />
        
        {/* Summary statistics */}
        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
          {variants.map((variantKey) => {
            const data = distribution[variantKey];
            return (
              <div key={variantKey} className="space-y-1">
                <div className="font-semibold">{variantKey.replace('variant_', 'Variant ')}</div>
                <div>Mean: {data.mean.toFixed(2)}</div>
                <div>Median: {data.median.toFixed(2)}</div>
                <div>Std Dev: {data.std.toFixed(2)}</div>
                <div>P25-P75: {data.p25.toFixed(2)} - {data.p75.toFixed(2)}</div>
                <div>P95: {data.p95.toFixed(2)}</div>
                <div>Users with zero: {data.zero_count}</div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export default DistributionChart;
