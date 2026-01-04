from scipy.stats import norm
import numpy as np

def calculate_sample_size(baseline_rate, mde, alpha=0.05, power=0.80):
    """
    Calculate required sample size per variant for A/B test.
    
    :param baseline_rate: Current coversion rate (eg, 0.10 = 10%)
    :param mde: Minimum Detectable Effect (eg, 0.05 = 5% relative change)
    :param alpha: Significance level (usually 0.05)
    :param power: Statistical power (usually 0.8)
    :return: Required sample size per variant
    """

    # Get z scores
    z_alpha = norm.ppf(1 - alpha/2)
    z_beta = norm.ppf(power)

    p1 = baseline_rate
    p2 = baseline_rate * (1 + mde)
    
    # Pooled proportion for variance calculation
    p_pooled = (p1 + p2) / 2

    # Sample size formula for proportions
    numerator = (z_alpha * np.sqrt(2 * p_pooled * (1 - p_pooled)) + 
                 z_beta * np.sqrt(p1 * (1 - p1) + p2 * (1 - p2)))**2
    denominator = (p2 - p1)**2

    n = numerator / denominator
    
    return int(np.ceil(n))
