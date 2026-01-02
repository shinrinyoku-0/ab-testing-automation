from pathlib import Path
import pandas as pd
import json

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
