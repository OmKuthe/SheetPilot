from fastapi import FastAPI, UploadFile, File
import pandas as pd
import io
from fastapi.responses import StreamingResponse
import tempfile

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

    try:
        if action == "filter":
            if column not in df.columns:
                return {"error": f"Column '{column}' not found"}
                
            if operator == "=":
                # Handle type conversion
                try:
                    if pd.api.types.is_numeric_dtype(df[column]):
                        value = float(value) if '.' in str(value) else int(value)
                except:
                    pass
                filtered_df = df[df[column] == value]
            elif operator == "contains":
                filtered_df = df[df[column].astype(str).str.contains(str(value), case=False, na=False)]
            else:
                return {"error": f"Unknown operator: {operator}"}
            
            data_store["df"] = filtered_df
            
            return {
                "rows": filtered_df.head(50).fillna("").values.tolist(),
                "count": len(filtered_df)
            }
        else:
            return {"error": f"Unknown action: {action}"}
            
    except Exception as e:
        return {"error": f"Execution error: {str(e)}"}
        
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
    
    # MISSING RETURN STATEMENT! Add this:
    return {
        "rows": df.head(50).fillna("").values.tolist(),
        "count": len(df)
    }
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


@app.post("/smart-query")
async def smart_query(query_data: dict):
    df = data_store.get("df")
    
    if df is None:
        return {"error": "No file loaded"}
    
    # You can process the query here or call execute
    return {
        "rows": df.head(50).fillna("").values.tolist(),
        "count": len(df)
    }

@app.get("/export")
def export_excel():
    df = data_store.get("df")

    if df is None:
        return {"error": "No data to export"}

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx")
    df.to_excel(temp_file.name, index=False)

    return StreamingResponse(
        open(temp_file.name, "rb"),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=sheetpilot.xlsx"}
    )


    return {
        "rows": df.head(50).fillna("").values.tolist(),
        "count": len(df)
    }
