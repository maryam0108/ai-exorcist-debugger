import { motion } from "framer-motion";

export default function Loader() {
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
      <h3>The spirits are reading your code...</h3>
    </div>
  );
}