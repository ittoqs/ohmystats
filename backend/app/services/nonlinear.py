from scipy.optimize import curve_fit
import pandas as pd
import numpy as np
from fastapi import HTTPException

def quadratic_func(x, a, b, c):
    return a + b * x + c * (x ** 2)

def exponential_func(x, a, b):
    return a * np.exp(b * x)

def run_nonlinear_regression(df: pd.DataFrame, y_col: str, x_cols: list[str], regression_type: str):
    if len(x_cols) != 1:
        raise HTTPException(status_code=420, detail="Regresi non-linear saat ini hanya mendukung 1 variabel bebas (X).")

    try:
        y_data = df[y_col].values
        x_data = df[x_cols[0]].values

        if regression_type == "nonlinear_quadratic":
            popt, pcov = curve_fit(quadratic_func, x_data, y_data)

            # Calculate R-squared
            residuals = y_data - quadratic_func(x_data, *popt)
            ss_res = np.sum(residuals**2)
            ss_tot = np.sum((y_data - np.mean(y_data))**2)
            r_squared = 1 - (ss_res / ss_tot)

            coefficients = [
                {"variable": "a (Intercept)", "coefficient": float(popt[0])},
                {"variable": f"b ({x_cols[0]})", "coefficient": float(popt[1])},
                {"variable": f"c ({x_cols[0]}^2)", "coefficient": float(popt[2])}
            ]

        elif regression_type == "nonlinear_exponential":
            popt, pcov = curve_fit(exponential_func, x_data, y_data)

            # Calculate R-squared
            residuals = y_data - exponential_func(x_data, *popt)
            ss_res = np.sum(residuals**2)
            ss_tot = np.sum((y_data - np.mean(y_data))**2)
            r_squared = 1 - (ss_res / ss_tot)

            coefficients = [
                {"variable": "a (Multiplier)", "coefficient": float(popt[0])},
                {"variable": f"b (Exponent for {x_cols[0]})", "coefficient": float(popt[1])}
            ]
        else:
            raise HTTPException(status_code=400, detail="Jenis regresi non-linear tidak valid")

        metrics = {
            "r_squared": float(r_squared)
        }

        insights = f"Model regresi non-linear ({regression_type}) berhasil dibangun."

        return {
            "regression_type": regression_type,
            "metrics": metrics,
            "coefficients": coefficients,
            "insights": insights
        }

    except Exception as e:
        raise HTTPException(status_code=420, detail=f"Gagal memproses regresi non-linear: {str(e)}")
