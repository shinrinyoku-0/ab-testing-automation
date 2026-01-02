import pandas as pd

def validate_csv_structure(df: pd.DataFrame, required_columns: list):
    """
    Validate files are valid CSV with required columns
    """
    missing = set(required_columns) - set(df.columns)
    return missing
