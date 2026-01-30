from fastapi import FastAPI, UploadFile, File
import pandas as pd
import io

app = FastAPI()

@app.post("/read-file")
async def read_file(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_excel(io.BytesIO(contents))

    return {
        "columns": df.columns.tolist(),
        "rows": df.head(50).fillna("").values.tolist()
    }
