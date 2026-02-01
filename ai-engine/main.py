from fastapi import FastAPI, UploadFile, File
import pandas as pd
import io

app = FastAPI()

# Store file in memory (for MVP)
data_store = {}

@app.post("/read-file")
async def read_file(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_excel(io.BytesIO(contents))

    data_store["df"] = df

    return {
        "columns": df.columns.tolist(),
        "rows": df.head(50).fillna("").values.tolist()
    }

@app.post("/execute")
async def execute(command: dict):
    df = data_store.get("df")

    if df is None:
        return {"error": "No file loaded"}

    action = command.get("action")
    column = command.get("column")
    operator = command.get("operator")
    value = command.get("value")

    if action == "filter":
        if operator == "=":
            df = df[df[column] == value]
        elif operator == "contains":
            df = df[df[column].astype(str).str.contains(value, case=False)]

    data_store["df"] = df

    return {
        "rows": df.head(50).fillna("").values.tolist(),
        "count": len(df)
    }
