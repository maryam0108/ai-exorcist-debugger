import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Helper for the individual cards
const DemonCard = ({ item }) => {
  const [revealed, setRevealed] = useState(false);

  // Play ritual sound (optional)
  const handleRitual = () => {
    const audio = new Audio('/sounds/chant.mp3'); 
    audio.volume = 0.3;
    audio.loop = false;
    audio.play().catch(e => console.log("Audio play failed", e));
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

export default function Results({ data }) {
  if (!data) return null;

  // Combine static and AI analysis
  let combinedIssues = [];
  
  // 1. Add Static Analysis
  if (data.static_analysis && Array.isArray(data.static_analysis)) {
    combinedIssues = [...data.static_analysis];
  }

  // 2. Add AI Analysis
  if (data.ai_analysis) {
    if (Array.isArray(data.ai_analysis)) {
      combinedIssues = [...combinedIssues, ...data.ai_analysis];
    } else if (data.ai_analysis.error) {
       // Handle AI Error gracefully
       combinedIssues.push({
         type: "warning",
         description: `The AI spirit refused to speak: ${data.ai_analysis.error}`,
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
}