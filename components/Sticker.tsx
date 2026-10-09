import React from 'react';
import { motion } from 'framer-motion';

interface StickerProps {
  emoji: string;
  top: string;
  left: string;
  rotation: number;
  delay: number;
}

const Sticker: React.FC<StickerProps> = ({ emoji, top, left, rotation, delay }) => {
  return (
    <motion.div
      className="absolute text-6xl cursor-pointer z-0 select-none opacity-20 hover:opacity-100 transition-opacity duration-300"
      style={{ top, left }}
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: 1, rotate: rotation }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20, 
        delay: delay 
      }}
      whileHover={{ scale: 1.2, rotate: rotation + 10, zIndex: 10 }}
      drag
      dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
    >
      {emoji}
    </motion.div>
  );
};

export default Sticker;
