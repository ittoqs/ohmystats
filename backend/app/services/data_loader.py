import pandas as pd
from io import BytesIO
from fastapi import HTTPException

def load_data(file_content: bytes, filename: str) -> pd.DataFrame:
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(BytesIO(file_content))
        elif filename.endswith(".xlsx"):
            df = pd.read_excel(BytesIO(file_content))
        else:
            raise HTTPException(status_code=400, detail="Format file tidak didukung. Gunakan .csv atau .xlsx")

        # Bersihkan missing values
        df = df.dropna()

        # Deteksi tipe data dan hapus kolom yang semuanya null
        df = df.dropna(axis=1, how='all')

        if df.empty:
            raise HTTPException(status_code=420, detail="Dataframe kosong setelah pembersihan missing values.")

        return df
    except Exception as e:
        raise HTTPException(status_code=420, detail=f"Gagal memproses file: {str(e)}")
