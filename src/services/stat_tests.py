from scipy import stats

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
