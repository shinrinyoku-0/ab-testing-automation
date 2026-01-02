from .metric_analysis import analyze_metric
from .stat_tests import run_stat_tests

def run_experiment_analysis(experiment_id, exposures_df, events_df, metrics_config):
    """
    Analysis of user uploaded data (validated) - for every metric.
    Perform appropriate statistical tests and return results.
    """

    exp_exposures = exposures_df[exposures_df['experiment_id'].astype(str) == str(experiment_id)]

    if exp_exposures.empty:
        raise ValueError(f"No exposure data found for experiment_id: {experiment_id}")
    
    results = {}

    for _, metric_config in metrics_config.items():
        metric_df = analyze_metric(exp_exposures, events_df, metric_config)
        analysis = run_stat_tests(metric_df, metric_config)
        results[metric_config['metric_id']] = analysis

    return results
