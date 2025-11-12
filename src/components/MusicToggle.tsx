import { useState } from 'react';
import { motion } from 'motion/react';
import { Music, Volume2, VolumeX } from 'lucide-react';

export function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.button
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-gradient-to-br from-[#C7AFFF]/20 to-[#FFC8E2]/20 backdrop-blur-sm border border-white/10 shadow-lg"
      whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(199, 175, 255, 0.5)' }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsPlaying(!isPlaying)}
      animate={{
        boxShadow: isPlaying 
          ? ['0 0 10px rgba(199, 175, 255, 0.3)', '0 0 20px rgba(255, 200, 226, 0.5)', '0 0 10px rgba(199, 175, 255, 0.3)']
          : '0 0 10px rgba(199, 175, 255, 0.3)',
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {isPlaying ? (
        <Volume2 className="w-5 h-5 text-[#C7AFFF]" />
      ) : (
        <VolumeX className="w-5 h-5 text-white/60" />
      )}
    </motion.button>
  );
}
