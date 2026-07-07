import pandas as pd
from linearmodels.panel import PanelOLS, RandomEffects
import numpy as np
from scipy import stats
from fastapi import HTTPException

def run_panel_regression(df: pd.DataFrame, y_col: str, x_cols: list[str], entity_col: str, time_col: str):
    try:
        if entity_col not in df.columns or time_col not in df.columns:
            raise HTTPException(status_code=400, detail="Kolom entitas atau waktu tidak ditemukan dalam data.")

        # Set MultiIndex for panel data
        df = df.set_index([entity_col, time_col])

        y = df[y_col]
        X = df[x_cols]
        import statsmodels.api as sm
        X_with_const = sm.add_constant(X)

        # Fixed Effects Model
        fe_model = PanelOLS(y, X_with_const, entity_effects=True)
        fe_res = fe_model.fit()

        # Random Effects Model
        re_model = RandomEffects(y, X_with_const)
        re_res = re_model.fit()

        # Hausman Test (manual calculation)
        b_fe = fe_res.params
        b_re = re_res.params

        v_fe = fe_res.cov
        v_re = re_res.cov

        df_hausman = len(b_fe)
        b_diff = b_fe - b_re
        v_diff = v_fe - v_re

        try:
            v_diff_inv = np.linalg.inv(v_diff)
            hausman_stat = float(b_diff.dot(v_diff_inv).dot(b_diff))
            hausman_pval = float(stats.chi2.sf(hausman_stat, df_hausman))
        except np.linalg.LinAlgError:
            hausman_stat = None
            hausman_pval = None

        recommended_model = "Fixed Effects" if hausman_pval is not None and hausman_pval < 0.05 else "Random Effects"

        # We will return the results of the recommended model
        active_res = fe_res if recommended_model == "Fixed Effects" else re_res

        metrics = {
            "r_squared": float(active_res.rsquared),
            "f_statistic": float(active_res.f_statistic.stat) if active_res.f_statistic else None,
            "p_value_f": float(active_res.f_statistic.pval) if active_res.f_statistic else None,
            "hausman_p_value": hausman_pval
        }

        coefficients = []
        for i, col in enumerate(X_with_const.columns):
            coefficients.append({
                "variable": "Intercept" if col == "const" else col,
                "coefficient": float(active_res.params.iloc[i]),
                "t_stat": float(active_res.tstats.iloc[i]),
                "p_value": float(active_res.pvalues.iloc[i])
            })

        insights = f"Uji Hausman merekomendasikan model {recommended_model}. Hasil di bawah menggunakan model tersebut."

        return {
            "regression_type": "panel",
            "recommended_model": recommended_model,
            "metrics": metrics,
            "coefficients": coefficients,
            "insights": insights
        }

    except Exception as e:
        raise HTTPException(status_code=420, detail=f"Gagal memproses regresi data panel: {str(e)}")
