const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const FormData = require("form-data");

const app = express();
app.use(cors());

require("dotenv").config();

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;

        const formData = new FormData();
        formData.append("file", fs.createReadStream(filePath));

        const response = await axios.post(
            "http://127.0.0.1:8000/read-file",
            formData,
            {
                headers: formData.getHeaders()
            }
        );

        fs.unlinkSync(filePath);
        res.json(response.data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "File processing failed" });
    }
});

app.post("/local-ai", express.json(), (req, res) => {
    const { message, columns } = req.body;
    const text = message.toLowerCase();

    let command = {};

    if (text.includes("only") || text.includes("show")) {
        if (text.includes("aids")) {
            command = {
                action: "filter",
                column: "Branch",
                operator: "=",
                value: "AIDS"
            };
        }
        else if (text.includes("it")) {
            command = {
                action: "filter",
                column: "Branch",
                operator: "=",
                value: "Info Tech"
            };
        }
    }

    if (text.includes("gmail")) {
        command = {
            action: "filter",
            column: "Email Id",
            operator: "contains",
            value: "gmail"
        };
    }

    res.json(command);
});



app.post("/execute", express.json(), async (req, res) => {
    try {
        const response = await axios.post(
            "http://127.0.0.1:8000/execute",
            req.body
        );
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: "Execution failed" });
    }
});

app.post("/smart-query", express.json(), async (req, res) => {
    try {
        const { message, columns } = req.body;

        // 1. Ask SheetPilot's brain - FIX THIS LINE
        const ai = await axios.post("http://localhost:5000/local-ai", {
            message,
            columns
        });

        // 2. Execute the command
        const result = await axios.post("http://127.0.0.1:8000/execute", ai.data);

        res.json({
            command: ai.data,
            result: result.data
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Smart query failed" });
    }
});

app.get("/export", async (req, res) => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/export", {
            responseType: "stream"
        });

        res.setHeader("Content-Disposition", "attachment; filename=sheetpilot.xlsx");
        response.data.pipe(res);

    } catch (err) {
        res.status(500).json({ error: "Export failed" });
    }
});


app.listen(5000, () => {
    console.log("Node server running on port 5000");
});
