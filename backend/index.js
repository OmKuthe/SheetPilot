const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const FormData = require("form-data");

const app = express();
app.use(cors());

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

app.listen(5000, () => {
    console.log("Node server running on port 5000");
});
