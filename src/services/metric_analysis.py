import pandas as pd

def analyze_metric(exposure_events, user_events, metric_config):
    """
    Filter user uploaded data by each metric in json config.
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
