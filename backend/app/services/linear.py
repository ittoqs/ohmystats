import statsmodels.api as sm
import pandas as pd
from statsmodels.stats.outliers_influence import variance_inflation_factor
from statsmodels.stats.diagnostic import het_breuschpagan
from scipy.stats import jarque_bera
from fastapi import HTTPException
import numpy as np

def run_linear_regression(df: pd.DataFrame, y_col: str, x_cols: list[str], is_multiple: bool):
    try:
        y = df[y_col]
        X = df[x_cols]

        X_with_const = sm.add_constant(X)
        model = sm.OLS(y, X_with_const).fit()

        metrics = {
            "r_squared": float(model.rsquared),
            "adj_r_squared": float(model.rsquared_adj),
            "f_statistic": float(model.fvalue) if not np.isnan(model.fvalue) else None,
            "p_value_f": float(model.f_pvalue) if not np.isnan(model.f_pvalue) else None
        }

        coefficients = []
        for i, col in enumerate(X_with_const.columns):
            coefficients.append({
                "variable": "Intercept" if col == "const" else col,
                "coefficient": float(model.params.iloc[i]),
                "t_stat": float(model.tvalues.iloc[i]),
                "p_value": float(model.pvalues.iloc[i])
            })

        # Diagnostic Tests
        diagnostics = {}

        # 1. Normality (Jarque-Bera)
        jb_stat, jb_pval = jarque_bera(model.resid)
        diagnostics["normality"] = {
            "p_value": float(jb_pval),
            "passed": bool(jb_pval > 0.05)
        }

        # 2. Heteroskedasticity (Breusch-Pagan)
        bp_stat, bp_pval, _, _ = het_breuschpagan(model.resid, X_with_const)
        diagnostics["heteroskedasticity"] = {
            "p_value": float(bp_pval),
            "passed": bool(bp_pval > 0.05)
        }

        # 3. Multicollinearity (VIF) - only if multiple regression
        if is_multiple and len(x_cols) > 1:
            vif_data = {}
            # Ignore the constant for VIF
            for i, col in enumerate(X_with_const.columns):
                if col != "const":
                    vif = variance_inflation_factor(X_with_const.values, i)
                    vif_data[col] = float(vif) if not np.isinf(vif) and not np.isnan(vif) else 9999.0

            diagnostics["multicollinearity"] = {
                "vif_values": vif_data,
                "passed": bool(all(v < 10 for v in vif_data.values()))
            }

        insights = f"Model linear {'berganda' if is_multiple else 'sederhana'} berhasil dibangun."

        return {
            "regression_type": "linear_multiple" if is_multiple else "linear_simple",
            "metrics": metrics,
            "coefficients": coefficients,
            "diagnostic_tests": diagnostics,
            "insights": insights
        }

    except Exception as e:
        raise HTTPException(status_code=420, detail=f"Gagal memproses regresi linear: {str(e)}")
