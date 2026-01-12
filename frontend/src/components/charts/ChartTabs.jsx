import { Tabs, Tab } from "@heroui/react";
import MetricOverTimeChart from "./MetricOverTimeChart";
import SampleSizeChart from "./SampleSizeChart";
import CumulativeChart from "./CumulativeChart";
import DistributionChart from "./DistributionChart";
import RelativeLiftChart from "./RelativeLiftChart";
import CIChart from "./CIChart";

const ChartTabs = ({ 
  dailyTimeseries, 
  cumulativeTimeseries, 
  distribution,
  liftTimeseries,
  ciTimeseries,
  metricId 
}) => {
  const hasDaily = dailyTimeseries && dailyTimeseries.length > 0;
  const hasCumulative = cumulativeTimeseries && cumulativeTimeseries.length > 0;
  const hasDistribution = distribution && Object.keys(distribution).length > 0;
  const hasLift = liftTimeseries && liftTimeseries.length > 0;
  const hasCI = ciTimeseries && ciTimeseries.length > 0;

  if (!hasDaily && !hasCumulative && !hasDistribution && !hasLift && !hasCI) {
    return null;
  }

  return (
    <div className="w-full">
      <Tabs aria-label="Metric charts" variant="underlined" color="primary">
        {hasCumulative && (
          <Tab key="cumulative" title="Cumulative">
            <CumulativeChart
              timeseries={cumulativeTimeseries}
              metricId={metricId}
            />
          </Tab>
        )}
        
        {hasLift && (
          <Tab key="lift" title="Relative Lift">
            <RelativeLiftChart
              liftTimeseries={liftTimeseries}
              metricId={metricId}
            />
          </Tab>
        )}
        
        {hasCI && (
          <Tab key="ci" title="Confidence Intervals">
            <CIChart
              ciTimeseries={ciTimeseries}
              metricId={metricId}
            />
          </Tab>
        )}
        
        {hasDaily && (
          <Tab key="metric" title="Daily Metric">
            <MetricOverTimeChart timeseries={dailyTimeseries} metricId={metricId} />
          </Tab>
        )}
        
        {hasDaily && (
          <Tab key="sample" title="Sample Size">
            <SampleSizeChart timeseries={dailyTimeseries} metricId={metricId} />
          </Tab>
        )}
        
        {hasDistribution && (
          <Tab key="distribution" title="Distribution">
            <DistributionChart distribution={distribution} metricId={metricId} />
          </Tab>
        )}
      </Tabs>
    </div>
  );
};

export default ChartTabs;
