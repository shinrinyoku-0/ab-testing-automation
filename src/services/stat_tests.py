from scipy import stats
from typing import cast

def run_stat_tests(metric_df, metric_config):
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

        rate_a = conversions_a / n_a
        rate_b = conversions_b / n_b

        # confidence intervals
        ci_a = stats.binom.interval(0.95, n_a, rate_a)
        ci_b = stats.binom.interval(0.95, n_b, rate_b)

        contingency = [
            [conversions_a, n_a - conversions_a],
            [conversions_b, n_b - conversions_b]
        ]
        result = stats.chi2_contingency(contingency)
        chi2 = result[0]
        p_value = result[1]
        p_value = cast(float, p_value)
        return {
            'test': 'chi-square',
            'statistic': chi2,
            'p-value': p_value,
            'variant_a_rate': rate_a,
            'variant_b_rate': rate_b,
            'variant_a_ci': [ci_a[0]/n_a, ci_a[1]/n_a],
            'variant_b_ci': [ci_b[0]/n_b, ci_b[1]/n_b],
            'lift': (rate_b / rate_a) - 1,
            'significance': 'YES' if p_value < 0.05 else 'NO'
        }
    else: # sum or count
        # two-sample t-test
        t_stat, p_value = stats.ttest_ind(variant_a, variant_b)

        # Confidence intervals
        mean_a = variant_a.mean()
        mean_b = variant_b.mean()
        se_a = stats.sem(variant_a)
        se_b = stats.sem(variant_b)
        ci_a = stats.t.interval(0.95, len(variant_a)-1, mean_a, se_a)
        ci_b = stats.t.interval(0.95, len(variant_a)-1, mean_b, se_b)

        return {
            'test': 't-test',
            'statistic': t_stat,
            'p-value': p_value,
            'variant_a_mean': variant_a.mean(),
            'variant_b_mean': variant_b.mean(),
            'variant_a_ci': list(ci_a),
            'variant_b_ci': list(ci_b),
            'lift': (mean_b / mean_a) - 1 if variant_a.mean() > 0 else None,
            'significance': 'YES' if cast(float, p_value) < 0.05 else 'NO'
        }
