import pandas as pd
from .metric_analysis import (
    analyze_metric,
    analyze_metric_timeseries_exposed_daily,
    analyze_metric_timeseries_exposed_cumulative,
    analyze_metric_distribution,
    analyze_relative_lift_timeseries,
    analyze_ci_timeseries,
    _choose_time_unit,
)
from .stat_tests import run_stat_tests

def run_experiment_analysis(experiment_id, exposures_df, events_df, metrics_config, apply_correction=True):
    """
    Analysis of user uploaded data (validated) - for every metric.
    Perform appropriate statistical tests and return results.
    """
    exp_exposures = exposures_df[exposures_df['experiment_id'].astype(str) == str(experiment_id)].copy()
    
    if exp_exposures.empty:
        raise ValueError(f"No exposure data found for experiment_id: {experiment_id}")
    
    exp_exposures['exposure_time'] = pd.to_datetime(exp_exposures['exposure_time'])
    
    results = {}
    p_values = []
    metric_ids = []
    
    for _, metric_config in metrics_config.items():
        metric_id = metric_config['metric_id']
        metric_ids.append(metric_id)

        # User-level analysis for stats
        metric_df = analyze_metric(exp_exposures, events_df, metric_config)
        analysis = run_stat_tests(metric_df, metric_config)
        
        p_values.append(analysis['p-value'])

        # Exposed-based daily time series
        daily_df = analyze_metric_timeseries_exposed_daily(exp_exposures, events_df, metric_config)
        analysis['daily_timeseries'] = daily_df.to_dict('records')
        
        # Exposed-based cumulative time series
        cumulative_df = analyze_metric_timeseries_exposed_cumulative(exp_exposures, events_df, metric_config)
        analysis['cumulative_timeseries'] = cumulative_df.to_dict('records')
        
        # Distribution analysis
        distribution_data = analyze_metric_distribution(exp_exposures, events_df, metric_config)
        analysis['distribution'] = distribution_data
        
        # Relative lift over time
        lift_df = analyze_relative_lift_timeseries(exp_exposures, events_df, metric_config)
        analysis['lift_timeseries'] = lift_df.to_dict('records')
        
        # Confidence intervals over time
        ci_df = analyze_ci_timeseries(exp_exposures, events_df, metric_config)
        analysis['ci_timeseries'] = ci_df.to_dict('records')
        
        results[metric_id] = analysis
    
    should_correct = apply_correction and len(p_values) >= 3

    if should_correct:
        from .stat_tests import apply_multiple_testing_correction
        correction_results = apply_multiple_testing_correction(p_values, method='fdr_bh')

        for i, metric_id in enumerate(metric_ids):
            results[metric_id]['p_value_raw'] = results[metric_id]['p-value']
            results[metric_id]['p-value'] = correction_results['corrected_p_values'][i]
            results[metric_id]['significance'] = 'YES' if correction_results['significant'][i] else 'NO'
            results[metric_id]['correction_applied'] = True
            results[metric_id]['correction_method'] = correction_results['method']

        results['_correction_info'] = {
            'applied': True,
            'method': 'Benjamini-Hochberg (FDR)',
            'num_tests': len(p_values),
            'description': 'P-values adjusted to control false discovery rate across multiple metrics'
        }
    else:
        results['_correction_info'] = {
            'applied': False,
            'reason': 'Less than 3 metrics' if len(p_values) < 3 else 'Disabled by user'
        }
        
    return results
