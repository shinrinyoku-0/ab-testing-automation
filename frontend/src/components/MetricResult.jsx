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
    <div className="mb-6 p-4 bg-white rounded border">
      <h4 className="font-semibold text-lg mb-2">{metricId}</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Test:</span> {data.test}
        </div>
        <div>
          <span className="font-medium">P-value: </span>{' '}
          {data['p-value']?.toFixed(4)}
        </div>
        <div>
          <span className="font-medium">Significant:</span>{' '}
          <span
            className={
              data.significance === 'YES'
                ? 'text-green-600 font-bold'
                : 'text-gray-600'
            }
          >
            {data.significance}
          </span>
        </div>
        <div>
          <span className="font-medium">Lift:</span>{' '}
          <span className={data.lift > 0 ? 'text-green-600' : 'text-red-600'}>
            {(data.lift * 100).toFixed(2)}%
          </span>
        </div>
        
        <div>
          <span className="font-medium">
            Variant A {isChiSquare ? 'Rate' : 'Mean'}: 
          </span>{' '}
          {variantAValue}
        </div>
        <div>
          <span className="font-medium">
            Variant B {isChiSquare ? 'Rate' :  'Mean'}:
          </span>{' '}
          {variantBValue}
        </div>

        {data.variant_a_ci && (
          <div>
            <span className="font-medium">Variant A 95% CI:</span>{' '}
            [{formatValue(data.variant_a_ci[0])}, {formatValue(data.variant_a_ci[1])}]
          </div>
        )}
        {data.variant_b_ci && (
          <div>
            <span className="font-medium">Variant B 95% CI:</span>{' '}
            [{formatValue(data.variant_b_ci[0])}, {formatValue(data. variant_b_ci[1])}]
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricResult;
