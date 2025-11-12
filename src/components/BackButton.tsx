import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onBack: () => void;
}

export function BackButton({ onBack }: BackButtonProps) {
  return (
    <motion.button
      className="fixed top-6 left-6 z-50 p-3 rounded-full bg-gradient-to-br from-[#C7AFFF]/20 to-[#FFC8E2]/20 backdrop-blur-sm border border-white/10 shadow-lg flex items-center gap-2 text-white/80"
      whileHover={{ 
        scale: 1.05, 
        boxShadow: '0 0 20px rgba(199, 175, 255, 0.5)',
        x: -5,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onBack}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="text-sm pr-1">Home</span>
    </motion.button>
  );
}
