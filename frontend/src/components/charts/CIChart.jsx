import Plot from "react-plotly.js";
import { Card, CardBody, Alert } from "@heroui/react";

const CIChart = ({ ciTimeseries, metricId }) => {
  if (!ciTimeseries || ciTimeseries.length === 0) {
    return <Alert variant="faded" color="primary" title="No confidence interval data available" className="mt-4" />;
  }

  const variants = [...new Set(ciTimeseries.map(d => d.variant))];
  const colors = { A: "#8884d8", B: "#82ca9d", C: "#ffc658", D: "#ff7c7c" };

  const traces = [];

  variants.forEach(variant => {
    const variantData = ciTimeseries
      .filter(d => d.variant === variant)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const dates = variantData.map(d => d.date.split("T")[0]);
    const values = variantData.map(d => d.metric_value);
    const ciUpper = variantData.map(d => d.ci_upper);
    const ciLower = variantData.map(d => d.ci_lower);

    // Upper CI bound (invisible line, just for fill)
    traces.push({
      x: dates,
      y: ciUpper,
      type: "scatter",
      mode: "lines",
      name: `Variant ${variant} CI Upper`,
      line: { color: "transparent" },
      showlegend: false,
      hoverinfo: 'skip',
    });

    // Lower CI bound (with fill to upper)
    traces.push({
      x: dates,
      y: ciLower,
      type: "scatter",
      mode: "lines",
      name: `Variant ${variant} 95% CI`,
      line: { color: "transparent" },
      fill: 'tonexty',
      fillcolor: `rgba(${hexToRgb(colors[variant] || "#000")}, 0.2)`,
      showlegend: true,
      hoverinfo: 'skip',
    });

    // Main line (mean)
    traces.push({
      x: dates,
      y: values,
      type: "scatter",
      mode: "lines",
      name: `Variant ${variant}`,
      line: { color: colors[variant] || "#000", width: 2 },
      hovertemplate:
        `<b>Variant ${variant}</b><br>` +
        'Date: %{x}<br>' +
        'Value: %{y:.4f}<br>' +
        `CI: [${ciLower.map(v => v.toFixed(4))[0]}, ${ciUpper.map(v => v.toFixed(4))[0]}]<br>` +
        '<extra></extra>',
    });
  });

  const layout = {
    title: { 
      text: "Confidence Intervals Over Time (95% CI)", 
      font: { size: 16, weight: 600 } 
    },
    xaxis: { 
      title: { text: "Date", font: { size: 14 } },
      showgrid: true, 
      gridcolor: "#e5e7eb" 
    },
    yaxis: { 
      title: { text: "Metric Value", font: { size: 14 } },
      showgrid: true, 
      gridcolor: "#e5e7eb" 
    },
    hovermode: "closest",
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
      filename: `${metricId}_confidence_intervals`,
      height: 600,
      width: 1000,
      scale: 2,
    },
  };

  // Check if CIs are overlapping at the end (suggests no significance)
  const lastDateData = variants.map(variant => {
    const variantData = ciTimeseries
      .filter(d => d.variant === variant)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return variantData[variantData.length - 1];
  });

  let overlapping = false;
  if (lastDateData.length === 2) {
    const [dataA, dataB] = lastDateData;
    overlapping = !(dataA.ci_upper < dataB.ci_lower || dataB.ci_upper < dataA.ci_lower);
  }

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
        
        {/* Interpretation help */}
        <div className="mt-4 pt-4 border-t text-sm space-y-2">
          <div className="font-semibold">Interpretation:</div>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Shaded areas represent 95% confidence intervals</li>
            <li>When CIs don't overlap, the difference is likely significant</li>
            <li>CIs narrow as sample size increases (more certainty)</li>
          </ul>
          {lastDateData.length === 2 && (
            <div className={`mt-2 p-2 rounded ${overlapping ? 'bg-yellow-50' : 'bg-green-50'}`}>
              <span className="font-semibold">Current status:</span>{' '}
              {overlapping ? (
                <span className="text-yellow-700">
                  Confidence intervals are overlapping - difference may not be significant yet
                </span>
              ) : (
                <span className="text-green-700">
                  Confidence intervals are not overlapping - difference is likely significant
                </span>
              )}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Helper to convert hex to rgb for transparency
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "0, 0, 0";
}

export default CIChart;
