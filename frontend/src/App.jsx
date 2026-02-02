import { useState } from "react";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadFile = async () => {
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    const res = await axios.post("http://localhost:5000/upload", formData);
    setColumns(res.data.columns);
    setRows(res.data.rows);
    setLoading(false);
  };

  const runQuery = async () => {
    if (!query) return;

    setLoading(true);
    const res = await axios.post("http://localhost:5000/smart-query", {
      message: query,
      columns
    });
    setRows(res.data.result.rows);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center mb-6">🚀 SheetPilot</h1>

      {/* Upload */}
      <div className="bg-white p-4 rounded shadow mb-4 flex gap-4">
        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
          className="border p-2 flex-1"
        />
        <button
          onClick={uploadFile}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Upload
        </button>
      </div>

      {/* Chat */}
      <div className="bg-white p-4 rounded shadow mb-4 flex gap-4">
        <input
          className="border p-2 flex-1"
          placeholder="Ask SheetPilot... e.g. Show only AIDS students"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          onClick={runQuery}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Run
        </button>
      </div>

      {loading && <p className="text-center">Processing...</p>}

      {/* Table */}
      <div className="bg-white rounded shadow overflow-auto max-h-[60vh]">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200 sticky top-0">
            <tr>
              {columns.map(col => (
                <th key={col} className="border px-3 py-2 text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-100">
                {row.map((cell, j) => (
                  <td key={j} className="border px-3 py-1">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
