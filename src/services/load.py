import pandas as pd
import json
import io

def load_files(metrics_file, exposures_file, events_file, users_file=None):
    """
    Load files from file objects (in-memory) instead of disk paths.
    Args:
        metrics_file: File object or bytes for JSON metrics config
        exposures_file: File object or bytes for exposures CSV
        events_file: File object or bytes for events CSV
        users_file: Optional file object or bytes for users CSV
    """
    # Handle JSON metrics config
    if hasattr(metrics_file, 'read'):
        metrics_content = metrics_file.read()
        if isinstance(metrics_content, bytes):
            metrics_content = metrics_content.decode('utf-8')
        metrics_config = json.loads(metrics_content)
    else:
        metrics_config = json.loads(metrics_file)
    
    # Handle exposures CSV
    if hasattr(exposures_file, 'read'):
        exposures_df = pd.read_csv(exposures_file)
    else:
        exposures_df = pd.read_csv(io.BytesIO(exposures_file))
    
    # Handle events CSV
    if hasattr(events_file, 'read'):
        events_df = pd.read_csv(events_file)
    else:
        events_df = pd.read_csv(io.BytesIO(events_file))
    
    # Handle optional users CSV
    if users_file:
        if hasattr(users_file, 'read'):
            users_df = pd.read_csv(users_file)
        else:
            users_df = pd.read_csv(io.BytesIO(users_file))
    else:
        users_df = None
    
    return metrics_config, exposures_df, events_df, users_df
