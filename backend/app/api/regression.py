from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
import json
import pandas as pd

from ..schemas.regression import RegressionParams
from ..services.data_loader import load_data
from ..services.linear import run_linear_regression
from ..services.logistic import run_logistic_regression
from ..services.nonlinear import run_nonlinear_regression
from ..services.panel import run_panel_regression
from ..services.exporter import generate_report_docx

router = APIRouter()

@router.post("/analyze")
async def analyze_data(
    file: UploadFile = File(...),
    config: str = Form(...)
):
    try:
        config_data = json.loads(config)
        params = RegressionParams(**config_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Konfigurasi tidak valid: {str(e)}")

    content = await file.read()
    df = load_data(content, file.filename)

    # Basic validations
    if params.y_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Variabel terikat (Y) '{params.y_col}' tidak ditemukan dalam data.")
    for x in params.x_cols:
        if x not in df.columns:
            raise HTTPException(status_code=400, detail=f"Variabel bebas (X) '{x}' tidak ditemukan dalam data.")

    # Convert y and x columns to numeric, replacing comma with dot
    cols_to_numeric = [params.y_col] + params.x_cols
    for col in cols_to_numeric:
        if df[col].dtype == 'object':
            df[col] = pd.to_numeric(df[col].astype(str).str.replace(',', '.'), errors='coerce')

    df = df.dropna(subset=cols_to_numeric)

    if df.empty:
        raise HTTPException(status_code=400, detail="Data tidak valid untuk regresi setelah pembersihan nilai non-numerik.")

    # Route to appropriate service
    result = {}
    if params.regression_type == "linear_simple":
        if len(params.x_cols) != 1:
            raise HTTPException(status_code=400, detail="Regresi linear sederhana hanya membutuhkan 1 variabel X.")
        result = run_linear_regression(df, params.y_col, params.x_cols, is_multiple=False)

    elif params.regression_type == "linear_multiple":
        if len(params.x_cols) < 2:
            raise HTTPException(status_code=400, detail="Regresi linear berganda membutuhkan setidaknya 2 variabel X.")
        result = run_linear_regression(df, params.y_col, params.x_cols, is_multiple=True)

    elif params.regression_type == "logistic":
        result = run_logistic_regression(df, params.y_col, params.x_cols)

    elif params.regression_type in ["nonlinear_quadratic", "nonlinear_exponential"]:
        result = run_nonlinear_regression(df, params.y_col, params.x_cols, params.regression_type)

    elif params.regression_type == "panel":
        if not params.entity_col or not params.time_col:
            raise HTTPException(status_code=400, detail="Regresi data panel memerlukan kolom entitas dan kolom waktu.")
        result = run_panel_regression(df, params.y_col, params.x_cols, params.entity_col, params.time_col)

    else:
        raise HTTPException(status_code=400, detail="Jenis regresi tidak valid.")

    return result


@router.post("/export")
async def export_report(analysis_result: dict):
    try:
        doc_io = generate_report_docx(analysis_result)
        return StreamingResponse(
            doc_io,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": "attachment; filename=Laporan_Regresi_ohmystats.docx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menghasilkan laporan: {str(e)}")
