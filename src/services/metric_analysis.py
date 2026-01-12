import pandas as pd
from pandas import NA
import numpy as np
from scipy import stats

def _filter_events_by_metric(exposure_events: pd.DataFrame, user_events: pd.DataFrame, metric_config: dict) -> pd.DataFrame:
    """
    Filter and window events according to metric config.
    Returns merged, windowed event data containing:
      user_id, variant, exposure_time, event_time, (event_value), etc.
    """
    exposure_events = exposure_events.copy()
    user_events = user_events.copy()

    exposure_events['exposure_time'] = pd.to_datetime(exposure_events['exposure_time'])
    user_events['event_time'] = pd.to_datetime(user_events['event_time'])

    event_name = metric_config['event']['name']
    relevant_events = user_events[user_events['event_name'] == event_name].copy()

    merged = relevant_events.merge(
        exposure_events[['user_id', 'exposure_time', 'variant', 'experiment_id']],
        on='user_id',
        how='inner'
    )

    merged['time_since_exposure'] = merged['event_time'] - merged['exposure_time']

    start = pd.Timedelta(metric_config['window']['start'])
    end = pd.Timedelta(metric_config['window']['end'])

    in_window = merged[
        (merged['time_since_exposure'] >= start) &
        (merged['time_since_exposure'] <= end)
    ].copy()

    return in_window


def _choose_time_unit(metric_config: dict) -> str:
    duration_days = (
        pd.to_timedelta(metric_config['window']['end']) - pd.to_timedelta(metric_config['window']['start'])
    ).days

    if duration_days < 3:
        return 'H'
    if duration_days > 60:
        return 'W'
    return 'D'


def analyze_metric(exposure_events: pd.DataFrame, user_events: pd.DataFrame, metric_config: dict) -> pd.DataFrame:
    """
    User-level metric table for stat tests:
      user_id, variant, metric_value
    """
    in_window = _filter_events_by_metric(exposure_events, user_events, metric_config)

    agg_type = metric_config['aggregation']
    all_users = exposure_events[['user_id', 'variant', 'experiment_id']].copy()

    if agg_type == 'binary':
        converted_users = in_window.groupby(['user_id', 'variant']).size().reset_index(name='metric_value')
        converted_users['metric_value'] = 1
        result = all_users.merge(converted_users, how='left', on=['user_id', 'variant'])
        result['metric_value'] = result['metric_value'].fillna(0)

    elif agg_type == 'sum':
        in_window = in_window.copy()
        # Make sure event_value exists and is numeric
        if 'event_value' not in in_window.columns:
            in_window['event_value'] = 0.0
        in_window['event_value'] = pd.to_numeric(in_window['event_value'], errors='coerce').fillna(0.0)

        purchased_users = (
            in_window.groupby(['user_id', 'variant', 'experiment_id'])['event_value']
            .sum()
            .reset_index(name='metric_value')
        )
        result = all_users.merge(purchased_users, how='left', on=['user_id', 'variant'])
        result['metric_value'] = result['metric_value'].fillna(0)

    elif agg_type == 'count':
        counted_users = in_window.groupby(['user_id', 'variant']).size().reset_index(name='metric_value')
        result = all_users.merge(counted_users, how='left', on=['user_id', 'variant'])
        result['metric_value'] = result['metric_value'].fillna(0)

    else:
        raise ValueError(f"Unsupported aggregation type: {agg_type}")

    return result[['user_id', 'variant', 'metric_value']]


def analyze_metric_timeseries_exposed_daily(exposure_events: pd.DataFrame, user_events: pd.DataFrame, metric_config: dict) -> pd.DataFrame:
    """
    Exposed-based DAILY time series.

    Output columns:
      date, variant, metric_value, exposed_users, metric_total
    """
    exposure_events = exposure_events.copy()
    exposure_events['exposure_time'] = pd.to_datetime(exposure_events['exposure_time'])
    time_unit = _choose_time_unit(metric_config)

    # bucket exposures
    exposure_events['date'] = pd.to_datetime(exposure_events['exposure_time']).dt.floor(time_unit)
    daily_exposed = (
        exposure_events.groupby(['date', 'variant'])['user_id']
        .nunique()
        .reset_index(name='exposed_users')
    )

    in_window = _filter_events_by_metric(exposure_events, user_events, metric_config)
    agg_type = metric_config['aggregation']

    if in_window.empty:
        result = daily_exposed.copy()
        result['metric_total'] = 0.0
        result['metric_value'] = 0.0
        return result[['date', 'variant', 'metric_value', 'exposed_users', 'metric_total']]

    in_window = in_window.copy()

    if agg_type == 'binary':
        # first conversion per user (within window), then count by exposure date (not event date)
        first_conv = (
            in_window.sort_values('event_time')
            .groupby(['user_id', 'variant'], as_index=False)
            .first()[['user_id', 'variant', 'exposure_time']]
        )
        first_conv['date'] = pd.to_datetime(first_conv['exposure_time']).dt.floor(time_unit)
        daily_metric = (
            first_conv.groupby(['date', 'variant'])['user_id']
            .nunique()
            .reset_index(name='metric_total')
        )
        daily_metric['metric_total'] = daily_metric['metric_total'].astype(float)

    elif agg_type == 'sum':
        if 'event_value' not in in_window.columns:
            in_window['event_value'] = 0.0
        in_window['event_value'] = pd.to_numeric(in_window['event_value'], errors='coerce').fillna(0.0)
        # Bucket by exposure_time (not event_time) to align with exposed_users
        in_window['date'] = pd.to_datetime(in_window['exposure_time']).dt.floor(time_unit)
        daily_metric = (
            in_window.groupby(['date', 'variant'])['event_value']
            .sum()
            .reset_index(name='metric_total')
        )

    elif agg_type == 'count':
        # Bucket by exposure_time (not event_time) to align with exposed_users
        in_window['date'] = pd.to_datetime(in_window['exposure_time']).dt.floor(time_unit)
        daily_metric = (
            in_window.groupby(['date', 'variant'])
            .size()
            .reset_index(name='metric_total')
        )
        daily_metric['metric_total'] = daily_metric['metric_total'].astype(float)

    else:
        raise ValueError(f"Unsupported aggregation type: {agg_type}")

    # Build a complete grid of (date x variant) from exposure timeline
    variants = sorted(exposure_events['variant'].dropna().unique().tolist())
    min_date = daily_exposed['date'].min()
    max_date = daily_exposed['date'].max()

    all_dates = pd.date_range(start=min_date, end=max_date, freq=time_unit)
    grid = pd.MultiIndex.from_product([all_dates, variants], names=['date', 'variant']).to_frame(index=False)

    merged = (
        grid.merge(daily_exposed, on=['date', 'variant'], how='left')
            .merge(daily_metric, on=['date', 'variant'], how='left')
    )
    merged['exposed_users'] = merged['exposed_users'].fillna(0).astype(int)
    merged['metric_total'] = merged['metric_total'].fillna(0.0).astype(float)

    merged['metric_value'] = merged['metric_total'] / merged['exposed_users'].where(merged['exposed_users'] > 0, NA)
    merged['metric_value'] = merged['metric_value'].fillna(0.0)

    return merged[['date', 'variant', 'metric_value', 'exposed_users', 'metric_total']]


def analyze_metric_timeseries_exposed_cumulative(exposure_events: pd.DataFrame, user_events: pd.DataFrame, metric_config: dict) -> pd.DataFrame:
    """
    Exposed-based CUMULATIVE time series.

    Output:
      date, variant, metric_value, cum_exposed_users, cum_metric_total
    """
    daily = analyze_metric_timeseries_exposed_daily(exposure_events, user_events, metric_config).copy()
    daily = daily.sort_values(['variant', 'date'])

    daily['cum_exposed_users'] = daily.groupby('variant')['exposed_users'].cumsum()
    daily['cum_metric_total'] = daily.groupby('variant')['metric_total'].cumsum()

    daily['metric_value'] = daily['cum_metric_total'] / daily['cum_exposed_users'].where(daily['cum_exposed_users'] > 0, NA)
    daily['metric_value'] = daily['metric_value'].fillna(0.0)

    return daily[['date', 'variant', 'metric_value', 'cum_exposed_users', 'cum_metric_total']]


def analyze_metric_distribution(exposure_events: pd.DataFrame, user_events: pd.DataFrame, metric_config: dict) -> dict:
    """
    Analyze the distribution of metric values for each variant.
    Returns histogram data suitable for plotting.
    
    Output structure:
    {
        'variant_A': {
            'values': [list of metric values],
            'bins': [bin edges for histogram],
            'counts': [count in each bin]
        },
        'variant_B': {...}
    }
    """
    # Get user-level metric data
    metric_df = analyze_metric(exposure_events, user_events, metric_config)
    agg_type = metric_config['aggregation']
    
    variants = sorted(metric_df['variant'].unique())
    distribution_data = {}
    
    for variant in variants:
        variant_data = metric_df[metric_df['variant'] == variant]['metric_value']
        
        if agg_type == 'binary':
            # For binary metrics, just return the conversion rate and counts
            converted = (variant_data == 1).sum()
            total = len(variant_data)
            distribution_data[f'variant_{variant}'] = {
                'type': 'binary',
                'converted': int(converted),
                'not_converted': int(total - converted),
                'conversion_rate': float(converted / total) if total > 0 else 0.0
            }
        else:
            # For sum/count metrics, create histogram bins
            values = variant_data.values
            
            # Remove zeros for better binning if there are many
            non_zero_values = values[values > 0]
            
            if len(non_zero_values) > 0:
                # Use Freedman-Diaconis rule for bin width
                q75, q25 = np.percentile(non_zero_values, [75, 25])
                iqr = q75 - q25
                bin_width = 2 * iqr / (len(non_zero_values) ** (1/3)) if iqr > 0 else 1
                n_bins = int((non_zero_values.max() - non_zero_values.min()) / bin_width) if bin_width > 0 else 20
                n_bins = min(max(n_bins, 10), 50)  # Cap between 10 and 50 bins
            else:
                n_bins = 10
            
            counts, bin_edges = np.histogram(values, bins=n_bins)
            
            distribution_data[f'variant_{variant}'] = {
                'type': 'histogram',
                'values': values.tolist(),
                'bins': bin_edges.tolist(),
                'counts': counts.tolist(),
                'zero_count': int((values == 0).sum()),
                'mean': float(values.mean()),
                'median': float(np.median(values)),
                'std': float(values.std()),
                'p25': float(np.percentile(values, 25)),
                'p75': float(np.percentile(values, 75)),
                'p95': float(np.percentile(values, 95))
            }
    
    return distribution_data


def analyze_relative_lift_timeseries(exposure_events: pd.DataFrame, user_events: pd.DataFrame, metric_config: dict) -> pd.DataFrame:
    """
    Calculate relative lift over time (cumulative).
    Lift is calculated as: (Variant_B - Variant_A) / Variant_A
    
    Output columns:
      date, lift, variant_a_value, variant_b_value
    """
    cumulative = analyze_metric_timeseries_exposed_cumulative(exposure_events, user_events, metric_config)
    
    # Pivot to get A and B side by side
    pivot = cumulative.pivot(index='date', columns='variant', values='metric_value').reset_index()
    
    # Ensure we have both A and B
    if 'A' not in pivot.columns or 'B' not in pivot.columns:
        return pd.DataFrame(columns=['date', 'lift', 'variant_a_value', 'variant_b_value', 'significant'])
    
    result = pd.DataFrame({
        'date': pivot['date'],
        'variant_a_value': pivot['A'],
        'variant_b_value': pivot['B'],
    })
    
    # Calculate lift
    result['lift'] = ((result['variant_b_value'] - result['variant_a_value']) / 
                      result['variant_a_value'].where(result['variant_a_value'] > 0, NA))
    result['lift'] = result['lift'].fillna(0.0)
    
    # Add a flag for when we expect significance (simplistic: after 1 week of data)
    min_date = result['date'].min()
    result['significant'] = (result['date'] - min_date) > pd.Timedelta(days=7)
    
    return result[['date', 'lift', 'variant_a_value', 'variant_b_value', 'significant']]


def analyze_ci_timeseries(exposure_events: pd.DataFrame, user_events: pd.DataFrame, metric_config: dict) -> pd.DataFrame:
    """
    Calculate confidence intervals over time (cumulative).
    
    Output columns:
      date, variant, metric_value, ci_lower, ci_upper, sample_size
    """
    cumulative = analyze_metric_timeseries_exposed_cumulative(exposure_events, user_events, metric_config)
    
    # Get user-level data to calculate CIs at each time point
    metric_df = analyze_metric(exposure_events, user_events, metric_config)
    exposure_events = exposure_events.copy()
    exposure_events['exposure_time'] = pd.to_datetime(exposure_events['exposure_time'])
    time_unit = _choose_time_unit(metric_config)
    exposure_events['date'] = exposure_events['exposure_time'].dt.floor(time_unit)
    
    # Merge to get exposure date for each user
    metric_with_date = metric_df.merge(
        exposure_events[['user_id', 'date']].drop_duplicates('user_id'),
        on='user_id',
        how='left'
    )
    
    agg_type = metric_config['aggregation']
    variants = sorted(cumulative['variant'].unique())
    dates = sorted(cumulative['date'].unique())
    
    ci_results = []
    
    for variant in variants:
        variant_data = metric_with_date[metric_with_date['variant'] == variant].copy()
        variant_data = variant_data.sort_values('date')
        
        for current_date in dates:
            # Get all users exposed up to this date
            users_to_date = variant_data[variant_data['date'] <= current_date]['metric_value']
            
            if len(users_to_date) < 2:
                ci_results.append({
                    'date': current_date,
                    'variant': variant,
                    'metric_value': 0.0,
                    'ci_lower': 0.0,
                    'ci_upper': 0.0,
                    'sample_size': len(users_to_date)
                })
                continue
            
            n = len(users_to_date)
            
            if agg_type == 'binary':
                # Binomial confidence interval
                conversions = users_to_date.sum()
                rate = conversions / n
                ci = stats.binom.interval(0.95, n, rate)
                ci_lower = ci[0] / n
                ci_upper = ci[1] / n
                metric_value = rate
                
            else:  # sum or count
                # T-distribution confidence interval
                mean = users_to_date.mean()
                se = stats.sem(users_to_date)
                ci = stats.t.interval(0.95, n-1, mean, se)
                ci_lower = ci[0]
                ci_upper = ci[1]
                metric_value = mean
            
            ci_results.append({
                'date': current_date,
                'variant': variant,
                'metric_value': metric_value,
                'ci_lower': ci_lower,
                'ci_upper': ci_upper,
                'sample_size': n
            })
    
    return pd.DataFrame(ci_results)
