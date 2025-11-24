import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [pastedCode, setPastedCode] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    const formData = new FormData();
    if (file) formData.append("uploaded_file", file);
    if (pastedCode) formData.append("pasted_code", pastedCode);

    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>AI Exorcist Debugger 👻</h1>

      <h3>Upload a File</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <h3>Or Paste Code</h3>
      <textarea
        rows={10}
        cols={60}
        value={pastedCode}
        onChange={(e) => setPastedCode(e.target.value)}
      />

      <br /><br />
      <button onClick={handleAnalyze}>Exorcise Code 👀</button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Results:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
