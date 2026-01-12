import Plot from "react-plotly.js";
import { Card, CardBody, Alert } from "@heroui/react";

const SampleSizeChart = ({ timeseries, metricId }) => {
  if (!timeseries || timeseries.length === 0) {
    return <Alert variant="faded" color="primary" title="No sample size data available" className="mt-4" />;
  }

  const variants = [...new Set(timeseries.map(d => d.variant))];
  const colors = { A: "#8884d8", B: "#82ca9d", C: "#ffc658", D: "#ff7c7c" };

  const traces = variants.map(variant => {
    const v = timeseries
      .filter(d => d.variant === variant)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      x: v.map(d => d.date.split("T")[0]),
      y: v.map(d => d.exposed_users),
      type: "scatter",
      mode: "lines+markers",
      name: `Variant ${variant}`,
      line: { color: colors[variant] || "#000", width: 2 },
      marker: { size: 6, color: colors[variant] || "#000" },
      hovertemplate:
        `<b>Variant ${variant}</b><br>` +
        "Date: %{x}<br>" +
        "Exposed users: %{y}<br>" +
        "<extra></extra>",
    };
  });

  const layout = {
    title: { text: "Daily Exposed Users", font: { size: 16, weight: 600 } },
    xaxis: { 
      title: { text: "Date", font: { size: 14 } },
      showgrid: true, 
      gridcolor: "#e5e7eb" 
    },
    yaxis: { 
      title: { text: "Users", font: { size: 14 } },
      showgrid: true, 
      gridcolor: "#e5e7eb" 
    },
    hovermode: "closest",
    showlegend: true,
    legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.35, yanchor: "top" },
    margin: { l: 60, r: 20, t: 50, b: 0},
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
      filename: `${metricId}_daily_exposed`,
      height: 450,
      width: 1000,
      scale: 2,
    },
  };

  return (
    <Card className="mt-4">
      <CardBody>
        <Plot data={traces} layout={layout} config={config} style={{ width: "100%", minWidth: "300px" }} useResizeHandler />
      </CardBody>
    </Card>
  );
};

export default SampleSizeChart;
