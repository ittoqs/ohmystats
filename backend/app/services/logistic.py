import statsmodels.api as sm
import pandas as pd
import numpy as np
from fastapi import HTTPException

def run_logistic_regression(df: pd.DataFrame, y_col: str, x_cols: list[str]):
    try:
        y = df[y_col]
        X = df[x_cols]

        X_with_const = sm.add_constant(X)
        model = sm.Logit(y, X_with_const).fit(disp=False)

        metrics = {
            "pseudo_r_squared": float(model.prsquared),
            "log_likelihood": float(model.llf)
        }

        coefficients = []
        for i, col in enumerate(X_with_const.columns):
            coef_val = float(model.params.iloc[i])
            coefficients.append({
                "variable": "Intercept" if col == "const" else col,
                "coefficient": coef_val,
                "odds_ratio": float(np.exp(coef_val)),
                "z_stat": float(model.tvalues.iloc[i]),
                "p_value": float(model.pvalues.iloc[i])
            })

        insights = "Model regresi logistik berhasil dibangun. Perhatikan nilai odds ratio untuk interpretasi."

        return {
            "regression_type": "logistic",
            "metrics": metrics,
            "coefficients": coefficients,
            "insights": insights
        }

    except Exception as e:
        raise HTTPException(status_code=420, detail=f"Gagal memproses regresi logistik: {str(e)}")
