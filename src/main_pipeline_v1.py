import pandas as pd
import numpy as np
import json
from scipy import stats
from pathlib import Path

def load_files(metrics_path, exposures_path, events_path, users_path: Path | None):
    with open(metrics_path, 'r') as f:
        metrics_config = json.load(f)
    exposures_df = pd.read_csv(exposures_path)
    events_df = pd.read_csv(events_path)
    if users_path:
        users_df = pd.read_csv(users_path)
    else:
        users_df = None
    return metrics_config, exposures_df, events_df, users_df

def validate_csv_structure(df: pd.DataFrame, required_columns: list):
    """
    Validate files are valid CSV with required columns
    """
    missing = set(required_columns) - set(df.columns)
    return missing

def compute_metric(exposure_events, user_events, metric_config):
    """
    1. Parse metric_config
    2. Filter events by name
    3. Filter by time window relative to exposure_time
    4. Aggregate per user based on aggregation type
    """

    # make sure datetime columns are datetime type

    exposure_events = exposure_events.copy()
    user_events = user_events.copy()

    exposure_events['exposure_time'] = pd.to_datetime(exposure_events['exposure_time'])
    user_events['event_time'] = pd.to_datetime(user_events['event_time'])
    
    # Filter events by name
    event_name = metric_config['event']['name']
    relevant_events = user_events[user_events['event_name'] == event_name].copy()

    # Join with exposures to filter by window
    merged = relevant_events.merge(
        exposure_events[['user_id', 'exposure_time', 'variant', 'experiment_id']],
        on='user_id'
    )

    # calculate time since exposure
    merged['time_since_exposure'] = merged['event_time'] - merged['exposure_time']

    # parse window
    start = pd.Timedelta(metric_config['window']['start'])
    end = pd.Timedelta(metric_config['window']['end'])

    in_window = merged[
        (merged['time_since_exposure'] >= start) &
        (merged['time_since_exposure'] <= end)
    ]

    # aggregate
    agg_type = metric_config['aggregation']
    all_users = exposure_events[['user_id', 'variant', 'experiment_id']].copy()
    result = pd.DataFrame()

    if agg_type == 'binary':
        converted_users = in_window.groupby(['user_id', 'variant', 'experiment_id']).size().reset_index(name='metric_value')
        converted_users['metric_value'] = 1

        result = all_users.merge(converted_users, how='left', on=['user_id', 'variant', 'experiment_id'])
        result['metric_value'] = result['metric_value'].fillna(0)
        
    elif agg_type == 'sum':
        # users with purchase events, and therefore, event_value has revenue values
        purchased_users = in_window.groupby(['user_id', 'variant', 'experiment_id'])['event_value'].sum().reset_index(name='metric_value')
        
        result = all_users.merge(purchased_users, how='left', on=['user_id', 'variant', 'experiment_id'])
        result['metric_value'] = result['metric_value'].fillna(0)

    elif agg_type == 'count':
        result = in_window.groupby(['user_id', 'variant', 'experiment_id']).size().reset_index(name='metric_value')
        result = all_users.merge(result, how='left', on=['user_id', 'variant', 'experiment_id'])
        result['metric_value'] = result['metric_value'].fillna(0)

    return result[['user_id', 'variant', 'experiment_id', 'metric_value']]

def analyze_experiment(metric_df, metric_config):
    """
    Given metric values, run appropriate statistical test
    """

    variant_a = metric_df[metric_df['variant'] == 'A']['metric_value']
    variant_b = metric_df[metric_df['variant'] == 'B']['metric_value']

    agg_type = metric_config['aggregation']

    if agg_type == 'binary':
        # chi-square test for conversion rate
        conversions_a = variant_a.sum()
        conversions_b = variant_b.sum()
        n_a = len(variant_a)
        n_b = len(variant_b)

        contingency = [
            [conversions_a, n_a - conversions_a],
            [conversions_b, n_b - conversions_b]
        ]
        chi2, p_value, _, _ = stats.chi2_contingency(contingency)

        return {
            'test': 'chi-square',
            'statistic': chi2,
            'p-value': p_value,
            'variant_a_rate': conversions_a / n_a,
            'variant_b_rate': conversions_b / n_b,
            'lift': (conversions_b / n_b) / (conversions_a / n_a) - 1
        }
    else: # sum or count
        # two-sample t-test
        t_stat, p_value = stats.ttest_ind(variant_a, variant_b)

        return {
            'test': 't-test',
            'statistic': t_stat,
            'p-value': p_value,
            'variant_a_mean': variant_a.mean(),
            'variant_b_mean': variant_b.mean(),
            'lift': (variant_b.mean() / variant_a.mean()) - 1 if variant_a.mean() > 0 else None
        }
    
def run_experiment_analysis(experiment_id, exposures_df, events_df, metrics_config):
    """
    Complete analysis pipeline for 1 experiment
    """

    exp_exposures = exposures_df[exposures_df['experiment_id'].astype(str) == str(experiment_id)]

    if exp_exposures.empty:
        raise ValueError(f"No exposure data found for experiment_id: {experiment_id}")
    
    results = {}

    for metric_key, metric_config in metrics_config.items():
        metric_df = compute_metric(exp_exposures, events_df, metric_config)
        analysis = analyze_experiment(metric_df, metric_config)
        analysis['significant'] = "YES" if analysis["p-value"] < 0.05 else "NO"
        results[metric_config['metric_id']] = analysis

    return results
