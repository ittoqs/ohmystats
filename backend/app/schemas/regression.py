from pydantic import BaseModel, Field
from typing import List

class RegressionParams(BaseModel):
    y_col: str = Field(..., description="Nama kolom Variabel Terikat (Y)")
    x_cols: List[str] = Field(..., description="Daftar nama kolom Variabel Bebas (X)")
    regression_type: str = Field(..., description="Jenis regresi: linear_simple, linear_multiple, logistic, nonlinear_quadratic, nonlinear_exponential, panel")
    entity_col: str | None = Field(None, description="Kolom entitas untuk data panel")
    time_col: str | None = Field(None, description="Kolom waktu untuk data panel")
