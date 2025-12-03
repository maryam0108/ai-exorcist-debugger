import { useState, useEffect, useRef } from "react";
import axios from "axios";
import UploadArea from "./components/UploadArea";
import Loader from "./components/Loader";
import Results from "./components/Results";
import "./App.css";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const audioRef = useRef(null); // Background ambience

  // Toggle ambience on first interaction
  const startAmbience = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/whisper.mp3");
      audioRef.current.volume = 0.2;
    }

    // Fix: Check if paused, not just if it exists
    if (audioRef.current.paused) {
      audioRef.current.play().catch(e => console.warn("Spirit voice blocked:", e));
      
      // Stop the whispers after 10 seconds
      setTimeout(() => {
        if (audioRef.current) {
          // simple fade out logic could go here, for now just pause
          audioRef.current.pause(); 
          audioRef.current.currentTime = 0;
        }
      }, 20000); 
    }
  };

  const handleAnalyze = async (file, codeText) => {
    startAmbience(); // Ensure sound starts on interaction
    setLoading(true);
    setResult(null);

    const form = new FormData();
    if (file) form.append("uploaded_file", file);
    else form.append("pasted_code", codeText);

    try {
      const res = await axios.post("http://127.0.0.1:8000/analyze", form);
      setResult(res.data);
      
      // Play success/scare sound on completion
      const doneSound = new Audio("/sounds/scream.mp3");
      doneSound.volume = 0.3;
      doneSound.play().catch(e => console.warn("Scream blocked by browser:", e));

    } catch (err) {
      alert("The spirits are silent... (Backend Error)");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="container" onClick={startAmbience}>
      <h1 className="title">🧛‍♂️ AI Exorcist Debugger</h1>
      <p style={{ opacity: 0.7, marginBottom: '2rem' }}>
        Offering Debugging Rituals powered by Kiro
      </p>

      {!loading && !result && (
        <UploadArea onAnalyze={handleAnalyze} />
      )}

      {loading && <Loader />}

      <Results data={result} />
      
      {result && (
        <button 
          onClick={() => setResult(null)} 
          style={{ marginTop: '30px', background: '#d5ccccff' }}
        >
          🔄 Summon Another
        </button>
      )}
    </div>
  );
}