import { useState } from "react";
import { motion } from "framer-motion";

export default function UploadArea({ onAnalyze }) {
  const [file, setFile] = useState(null);
  const [code, setCode] = useState("");

  return (
    <motion.div 
      className="upload-area"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>🧙‍♂️ Summon the Code Demon</h2>

      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])}
      />

      <textarea
        placeholder="...or paste your cursed code here"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button 
        onClick={() => onAnalyze(file, code)}
        className="analyze-btn"
      >
        🔮 Analyze
      </button>
    </motion.div>
  );
}
