import { motion } from "framer-motion";

export default function Loader() {
  return (
    <motion.div 
      className="loader"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      👻
    </motion.div>
  );
}
