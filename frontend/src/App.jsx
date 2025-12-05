import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// -----------------------------------------------------------------------------
// \CSS STYLES
// -----------------------------------------------------------------------------
const styles = `
  :root {
    --danger-color: #ff0000;
    --danger-bg: rgba(50, 0, 0, 0.9);
    --warning-color: #ff9900;
    --warning-bg: rgba(60, 40, 0, 0.9);
    --info-color: #00eeff;
    --info-bg: rgba(0, 30, 40, 0.9);
    --bg-dark: #050505;
  }

  body {
    margin: 0;
    min-height: 100vh;
    background-color: var(--bg-dark);
    background-image: 
      radial-gradient(circle at 50% 50%, #2a0000 0%, #000 80%),
      url("https://www.transparenttextures.com/patterns/black-felt.png");
    font-family: "Creepster", system-ui, sans-serif;
    color: #e2e2e2;
    overflow-x: hidden;
  }

  /* Fog Animation */
  body::after {
    content: "";
    position: fixed;
    top: 0; left: 0; width: 300%; height: 100%;
    background: url("https://raw.githubusercontent.com/danielstuart14/CSS_FOG_ANIMATION/master/fog1.png") repeat-x;
    background-size: contain;
    opacity: 0.3;
    animation: fogFlow 60s linear infinite;
    z-index: -1;
    pointer-events: none;
  }
  @keyframes fogFlow {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-200vw, 0, 0); }
  }

  /* Global Scrollbar */
  ::-webkit-scrollbar { width: 10px; }
  ::-webkit-scrollbar-track { background: #1a0000; }
  ::-webkit-scrollbar-thumb { background: #800; border-radius: 5px; }

  /* Main Layout */
  #root {
    max-width: 1000px;
    margin: auto;
    padding: 2rem;
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .container {
    background: rgba(10, 5, 5, 0.85);
    padding: 40px;
    border-radius: 20px 20px 0 0; /* Tombstone shape */
    border: 4px solid #330000;
    box-shadow: 0 0 50px #55000066, inset 0 0 100px #000;
    backdrop-filter: blur(5px);
    position: relative;
    z-index: 2; /* Ensure above blood */
  }

  /* FLICKERING TITLE */
  .title {
    font-size: 4rem;
    color: #bea9a9ff;
    text-shadow: 0 0 10px #ff0000, 4px 4px 0px #000;
    margin-bottom: 0.5rem;
    animation: flicker 4s infinite;
  }

  @keyframes flicker {
    0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; text-shadow: 0 0 10px #ff0000, 4px 4px 0px #000; }
    20%, 24%, 55% { opacity: 0.4; text-shadow: none; }
  }

  /* BLOOD DRIP BACKGROUND */
  .blood-container {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .drop {
    position: absolute;
    top: -20px;
    width: 6px;
    height: 6px;
    background: #8a0303;
    border-radius: 50%;
    opacity: 0;
    animation: drip 5s linear infinite;
    box-shadow: 0 0 5px #ff0000;
  }

  @keyframes drip {
    0% { transform: translateY(-50px); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(110vh); opacity: 0; }
  }

  /* Upload Area Styles */
  .upload-area {
    border: 2px dashed #770000;
    padding: 25px;
    border-radius: 12px;
    margin-top: 20px;
    background: rgba(0, 0, 0, 0.5);
    transition: 0.3s ease;
  }
  .upload-area:hover {
    background: rgba(40, 0, 0, 0.5);
    box-shadow: 0 0 15px #990000aa;
  }
  .input-group { margin-bottom: 15px; }
  
  .upload-area textarea {
    width: 95%;
    min-height: 150px;
    background: #111;
    border: 1px solid #550000;
    color: #0f0;
    font-family: monospace;
    padding: 10px;
    border-radius: 5px;
  }

  /* Buttons */
  button { cursor: pointer; font-family: "Creepster", cursive; letter-spacing: 2px; }

  .analyze-btn {
    margin-top: 20px;
    background: #900000;
    border: 1px solid #ff0000;
    padding: 12px 24px;
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
    border-radius: 10px;
    transition: 0.2s ease-in-out;
  }
  .analyze-btn:hover {
    background: #b30000;
    box-shadow: 0 0 20px #ff0000aa;
    transform: scale(1.05);
  }

  /* Analysis Cards */
  .analysis-grid {
    display: grid;
    gap: 20px;
    text-align: left;
    margin-top: 30px;
  }

  .demon-card {
    padding: 20px;
    border-left: 5px solid;
    border-radius: 8px;
    position: relative;
    transition: transform 0.2s;
    overflow: hidden;
  }
  .demon-card:hover { transform: scale(1.02); }

  /* Severity Colors */
  .type-danger { border-color: var(--danger-color); background: var(--danger-bg); box-shadow: 0 0 15px var(--danger-color); }
  .type-warning { border-color: var(--warning-color); background: var(--warning-bg); box-shadow: 0 0 15px var(--warning-color); }
  .type-info { border-color: var(--info-color); background: var(--info-bg); box-shadow: 0 0 15px var(--info-color); }

  /* Ritual/Fix Section */
  .ritual-box {
    margin-top: 15px;
    border-top: 1px dashed rgba(255,255,255,0.2);
    padding-top: 10px;
  }
  .ritual-btn {
    background: transparent;
    border: 1px solid #fff;
    color: #fff;
    padding: 8px 16px;
    border-radius: 20px;
    transition: 0.3s;
    font-size: 1rem;
  }
  .ritual-btn:hover {
    background: #fff;
    color: #000;
    box-shadow: 0 0 20px #fff;
  }
  .fix-reveal {
    background: #000;
    color: #0f0;
    font-family: monospace;
    padding: 15px;
    border-radius: 5px;
    margin-top: 10px;
    border: 1px solid #0f0;
    animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both;
  }
  @keyframes glitch {
    0% { transform: translate(0); opacity: 0; }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); opacity: 1;}
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
  }
`;


const UploadArea = ({ onAnalyze }) => {
  const [file, setFile] = useState(null);
  const [code, setCode] = useState("");

  return (
    <motion.div
      className="upload-area"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 style={{color: '#ddd', marginBottom: '20px'}}>🧙‍♂️ Summon the Code Demon</h2>
      
      <div className="input-group">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{color: '#fff'}}
        />
      </div>

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
};

const Loader = () => {
  return (
    <div style={{ padding: "50px" }}>
      <motion.div
        className="loader"
        animate={{ 
            y: [0, -30, 0],
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.2, 1]
        }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ fontSize: "100px", filter: "drop-shadow(0 0 20px #ff0000)" }}
      >
        👻
      </motion.div>
      <h3 style={{ animation: 'flicker 2s infinite' }}>The spirits are reading your code...</h3>
    </div>
  );
};

  const DemonCard = ({ item }) => {
  const [revealed, setRevealed] = useState(false);

  const handleRitual = () => {
    const audio = new Audio('/sounds/chant.mp3'); 
    audio.volume = 0.3;
    audio.loop = false;
    audio.play().catch(e => console.warn("Audio play failed", e));
    setRevealed(true);
  };

  const isAI = item.source === "ai";
  const sourceLabel = isAI ? "🧠 AI Oracle" : "⚡ Static Scroll";
  const sourceStyle = {
    fontSize: '0.8rem',
    background: isAI ? '#300' : '#002',
    padding: '2px 8px',
    borderRadius: '4px',
    marginLeft: '10px',
    border: isAI ? '1px solid #f00' : '1px solid #0ff',
    color: '#fff'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`demon-card type-${item.type}`}
    >
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h3 style={{ margin: 0, textTransform: 'uppercase' }}>
          {item.type === 'danger' ? '👹' : item.type === 'warning' ? '🎃' : '👻'} 
          {item.type} <span style={{opacity:0.6}}>(Line: {item.line || "?"})</span>
        </h3>
        <span style={sourceStyle}>{sourceLabel}</span>
      </div>
      
      <p style={{ fontSize: '1.2rem', fontFamily: 'sans-serif', marginTop:'10px' }}>
        {item.description || item.message}
      </p>

      {item.fix && (
        <div className="ritual-box">
          {!revealed ? (
            <button onClick={handleRitual} className="ritual-btn">
              🔮 Perform Exorcism (Reveal Fix)
            </button>
          ) : (
            <div className="fix-reveal">
              <strong>✨ PURIFIED CODE:</strong>
              <pre style={{ margin: '10px 0 0 0', overflowX: 'auto' }}>
                {item.fix}
              </pre>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};


const Results = ({ data }) => {
  if (!data) return null;

  let combinedIssues = [];
  
  if (data.static_analysis && Array.isArray(data.static_analysis)) {
    combinedIssues = [...data.static_analysis];
  }

  if (data.ai_analysis) {
    if (Array.isArray(data.ai_analysis)) {
      combinedIssues = [...combinedIssues, ...data.ai_analysis];
    } else if (data.ai_analysis.error) {
       combinedIssues.push({
         type: "warning",
         description: `The AI spirit refused to speak: ${data.ai_analysis.error}`,
         source: "ai",
         fix: null
       });
    }
  }

  if (combinedIssues.length === 0) {
    return <h2 style={{color: '#0f0'}}>✨ The Code is Pure. No Demons Found.</h2>;
  }

  return (
    <div className="results-container">
      <h2 style={{ borderBottom: '2px solid #500', paddingBottom: '10px' }}>
        📜 Grimoire of Errors
      </h2>
      <div className="analysis-grid">
        <AnimatePresence>
          {combinedIssues.map((item, index) => (
            <DemonCard key={index} item={item} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// MAIN APP LOGIC
// -----------------------------------------------------------------------------
export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const audioRef = useRef(null);
  
  // 🩸 BLOOD CONFIGURATION
  // Generate random drops for the background
  const drops = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100, // Random position 0-100%
    delay: Math.random() * 5,  // Random delay
    duration: 3 + Math.random() * 4 // Random duration
  }));

  // Toggle ambience on first interaction
  const startAmbience = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/whisper.mp3");
      audioRef.current.volume = 0.2;
    }

    if (audioRef.current.paused) {
      audioRef.current.play().catch(e => console.warn("Spirit voice blocked:", e));
      
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause(); 
          audioRef.current.currentTime = 0;
        }
      }, 20000); 
    }
  };

  const handleAnalyze = async (file, codeText) => {
    startAmbience();
    setLoading(true);
    setResult(null);

    const form = new FormData();
    if (file) form.append("uploaded_file", file);
    else form.append("pasted_code", codeText);

    try {
      const res = await axios.post("api/analyze", form);
      setResult(res.data);
      
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
    <div className="app-wrapper" onClick={startAmbience}>
      {/* Inject Styles */}
      <style>{styles}</style>

      {/* 🩸 BLOOD DROP LAYER */}
      <div className="blood-container">
        {drops.map((drop) => (
          <div 
            key={drop.id} 
            className="drop"
            style={{
              left: `${drop.left}%`,
              animationDelay: `${drop.delay}s`,
              animationDuration: `${drop.duration}s`
            }}
          />
        ))}
      </div>

      <div className="container">
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
            style={{ marginTop: '30px', background: '#d5ccccff', color: '#000', fontWeight: 'bold' }}
          >
            🔄 Summon Another
          </button>
        )}
      </div>
    </div>
  );
}