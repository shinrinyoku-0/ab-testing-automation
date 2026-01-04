import pandas as pd

def _filter_events_by_metric(exposure_events, user_events, metric_config):
    """
    Filter and window events according to metric config.
    Returns merged, windowed event data.
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

    # filter by window
    
    in_window = merged[
        (merged['time_since_exposure'] >= start) &
        (merged['time_since_exposure'] <= end)
    ]

    return in_window

def analyze_metric(exposure_events, user_events, metric_config):
    """
    Aggregate by user
    Clean and impute data
    Format for statistical tests
    """
    in_window = _filter_events_by_metric(exposure_events, user_events, metric_config)

    # aggregate
    agg_type = metric_config['aggregation']
    all_users = exposure_events[['user_id', 'variant', 'experiment_id']].copy()
    result = pd.DataFrame()

    if agg_type == 'binary':
        converted_users = in_window.groupby(['user_id', 'variant']).size().reset_index(name='metric_value')
        converted_users['metric_value'] = 1

        result = all_users.merge(converted_users, how='left', on=['user_id', 'variant'])
        result['metric_value'] = result['metric_value'].fillna(0)
        
    elif agg_type == 'sum':
        # users with purchase events, and therefore, event_value has revenue values
        purchased_users = in_window.groupby(['user_id', 'variant', 'experiment_id'])['event_value'].sum().reset_index(name='metric_value')
        
        result = all_users.merge(purchased_users, how='left', on=['user_id', 'variant'])
        result['metric_value'] = result['metric_value'].fillna(0)

    elif agg_type == 'count':
        result = in_window.groupby(['user_id', 'variant']).size().reset_index(name='metric_value')
        result = all_users.merge(result, how='left', on=['user_id', 'variant'])
        result['metric_value'] = result['metric_value'].fillna(0)

    return result[['user_id', 'variant', 'metric_value']]

def analyze_metric_timeseries(exposure_events, user_events, metric_config):
    """
    Aggregate by date (used for time-series charts)
    """

    in_window = _filter_events_by_metric(exposure_events, user_events, metric_config)
    agg_type = metric_config['aggregation']
    result = pd.DataFrame()

    # duration of window defined in metric_config
    duration = (pd.to_timedelta(metric_config['window']['end']) - pd.to_timedelta(metric_config['window']['start'])).days
    if duration < 3:
        time_unit = 'H'
    elif duration > 60:
        time_unit = 'W'
    else:
        time_unit = 'D'

    # add date column
    in_window['date'] = in_window['event_time'].dt.floor(time_unit)

    if agg_type == 'binary':
        daily_conversions = in_window.groupby([
            'date', 'variant', 'user_id'
        ]).size().clip(upper=1).reset_index(name='converted')
        result = daily_conversions.groupby(['date', 'variant']).agg({
            'converted': 'sum',
            'user_id': 'nunique'
        }).reset_index()
        result.columns = ['date', 'variant', 'conversions', 'user_count']
        result['metric_value'] = result['conversions'] / result['user_count']
    
    elif agg_type == 'sum':
        result = in_window.groupby(['date', 'variant']).agg({
            'event_value': 'sum',
            'user_id': 'nunique'
        }).reset_index()
        result.columns = ['date', 'variant', 'total_value', 'user_count']
        result['metric_value'] = result['total_value'] / result['user_count']
    
    elif agg_type == 'count':
        result = in_window.groupby(['date', 'variant']).agg({
            'event_name': 'count',
            'user_id': 'nunique'
        }).reset_index()
        result.columns = ['date', 'variant', 'total_count', 'user_count']
        result['metric_value'] = result['total_count'] / result['user_count']

    return result[['date', 'variant', 'metric_value', 'user_count']]
