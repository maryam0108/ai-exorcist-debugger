import { useState } from "react";
import axios from "axios";
import UploadArea from "./components/UploadArea";
import Loader from "./components/Loader";
import Results from "./components/Results";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (file, codeText) => {
    setLoading(true);
    setResult(null);

    const form = new FormData();

    if (file) form.append("uploaded_file", file);
    else form.append("pasted_code", codeText);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/analyze",
        form
      );

      setResult(res.data);
    } catch (err) {
      alert("Backend error! Check console.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="title">🧛‍♂️ AI Exorcist Debugger</h1>

      {!loading && <UploadArea onAnalyze={handleAnalyze} />}

      {loading && <Loader />}

      <Results data={result} />
    </div>
  );
}
