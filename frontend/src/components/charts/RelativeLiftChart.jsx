import Plot from "react-plotly.js";
import { Card, CardBody, Alert } from "@heroui/react";

const RelativeLiftChart = ({ liftTimeseries, metricId }) => {
  if (!liftTimeseries || liftTimeseries.length === 0) {
    return <Alert variant="faded" color="primary" title="No lift data available" className="mt-4" />;
  }

  const sortedData = [...liftTimeseries].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Main lift line
  const liftTrace = {
    x: sortedData.map(d => d.date.split("T")[0]),
    y: sortedData.map(d => d.lift * 100), // Convert to percentage
    type: "scatter",
    mode: "lines+markers",
    name: "Relative Lift (%)",
    line: { color: "#006FEE", width: 3 },
    marker: { size: 6, color: "#006FEE" },
    fill: 'tozeroy',
    fillcolor: 'rgba(0, 111, 238, 0.1)',
    hovertemplate:
      '<b>Lift</b><br>' +
      'Date: %{x}<br>' +
      'Lift: %{y:.2f}%<br>' +
      '<extra></extra>',
  };

  // Zero line
  const zeroLine = {
    x: sortedData.map(d => d.date.split("T")[0]),
    y: Array(sortedData.length).fill(0),
    type: "scatter",
    mode: "lines",
    name: "Zero",
    line: { color: "#71717A", width: 1, dash: "none" },
    showlegend: false,
    hoverinfo: 'skip',
  };

  const layout = {
    title: { 
      text: "Relative Lift Over Time (B vs A)", 
      font: { size: 16, weight: 600 } 
    },
    xaxis: { 
      title: { text: "Date", font: { size: 14 } },
      showgrid: true, 
      gridcolor: "#e5e7eb" 
    },
    yaxis: { 
      title: { text: "Lift (%)", font: { size: 14 } },
      showgrid: true, 
      gridcolor: "#e5e7eb",
      zeroline: true,
      zerolinecolor: "#9ca3af",
      zerolinewidth: 2,
    },
    hovermode: "closest",
    showlegend: true,
    legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.25, yanchor: "top" },
    margin: { l: 60, r: 20, t: 50, b: 0 },
    height: 350,
    plot_bgcolor: "#ffffff",
    paper_bgcolor: "#ffffff",
    annotations: [
      // Add annotation for positive/negative lift at the end
      {
        x: sortedData[sortedData.length - 1].date.split("T")[0],
        y: sortedData[sortedData.length - 1].lift * 100,
        text: `${(sortedData[sortedData.length - 1].lift * 100).toFixed(2)}%`,
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 2,
        arrowcolor: sortedData[sortedData.length - 1].lift >= 0 ? "#10b981" : "#ef4444",
        ax: 40,
        ay: sortedData[sortedData.length - 1].lift >= 0 ? -40 : 40,
        font: { 
          size: 14, 
          color: sortedData[sortedData.length - 1].lift >= 0 ? "#10b981" : "#ef4444",
          weight: "bold"
        },
        bgcolor: "rgba(255,255,255,0.9)",
        bordercolor: sortedData[sortedData.length - 1].lift >= 0 ? "#10b981" : "#ef4444",
        borderwidth: 2,
      },
    ],
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
    toImageButtonOptions: {
      format: "png",
      filename: `${metricId}_lift`,
      height: 600,
      width: 1000,
      scale: 2,
    },
  };

  // Calculate final lift stats
  const finalLift = sortedData[sortedData.length - 1].lift;
  const finalVariantA = sortedData[sortedData.length - 1].variant_a_value;
  const finalVariantB = sortedData[sortedData.length - 1].variant_b_value;

  return (
    <Card className="mt-4">
      <CardBody>
        <Plot 
          data={[zeroLine, liftTrace]} 
          layout={layout} 
          config={config} 
          style={{ width: "100%", minWidth: "300px" }} 
          useResizeHandler 
        />
        
        {/* Summary */}
        <div className="mt-4 pt-4 border-t text-sm space-y-2">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="font-semibold">Final Lift:</span>{' '}
              <span className={finalLift >= 0 ? "text-green-600" : "text-red-600"}>
                {(finalLift * 100).toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="font-semibold">Variant A:</span> {finalVariantA.toFixed(4)}
            </div>
            <div>
              <span className="font-semibold">Variant B:</span> {finalVariantB.toFixed(4)}
            </div>
          </div>
          <div className="text-gray-600 text-xs">
            Positive lift means Variant B is performing better than Variant A
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default RelativeLiftChart;
