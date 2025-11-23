import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Plus, X, Trash2 } from 'lucide-react';
import { BackButton } from './BackButton';
import { reasonService, Reason } from '../lib/database-supabase';

const defaultReasons = [
  "Your smile lights up my entire world 💫",
  "The way you laugh at my silly jokes",
  "How you always know when I need a hug",
  "Your kindness to everyone around you",
  "The way you make ordinary moments magical",
  "Your beautiful mind and endless curiosity",
  "How you support my dreams unconditionally",
  "The comfort I feel in your presence",
  "Your adorable morning voice",
  "The way you hold my hand",
];

export function ReasonsILoveYouMobile({ onBack }: { onBack: () => void }) {
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [currentReasons, setCurrentReasons] = useState<Array<{ id: number; text: string; x: number }>>([]);
  const [count, setCount] = useState(0);
  const [nextId, setNextId] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newReason, setNewReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReasons();
  }, []);

  const loadReasons = async () => {
    try {
      setLoading(true);
      const data = await reasonService.getAll();
      setReasons(data);
    } catch (error) {
      console.error('Error loading reasons:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReason = () => {
    const allReasons = reasons.length > 0 
      ? reasons.map(r => r.text)
      : defaultReasons;
    
    if (allReasons.length === 0) {
      alert('Add some reasons first! Click "Add Reason" to get started.');
      return;
    }

    const randomReason = allReasons[Math.floor(Math.random() * allReasons.length)];
    const randomX = Math.random() * 40 + 30; // 30-70% from left
    
    setCurrentReasons(prev => [...prev, { id: nextId, text: randomReason, x: randomX }]);
    setCount(prev => prev + 1);
    setNextId(prev => prev + 1);

    setTimeout(() => {
      setCurrentReasons(prev => prev.slice(1));
    }, 4000);
  };

  const handleAdd = async () => {
    if (!newReason.trim()) {
      alert('Please enter a reason');
      return;
    }

    try {
      await reasonService.create({ text: newReason.trim() });
      setNewReason('');
      setIsAdding(false);
      await loadReasons();
    } catch (error) {
      console.error('Error adding reason:', error);
      alert('Failed to add reason. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reason?')) return;

    try {
      await reasonService.delete(id);
      await loadReasons();
    } catch (error) {
      console.error('Error deleting reason:', error);
      alert('Failed to delete reason. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 pt-20 flex items-center justify-center">
        <div className="text-white text-lg">Loading reasons...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-20 pb-8 flex flex-col items-center">
      <BackButton onBack={onBack} />
      
      <motion.h2
        className="text-3xl font-['Pacifico'] text-center text-transparent bg-clip-text bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Reasons I Love You
      </motion.h2>

      {/* Add Button */}
      <div className="mb-4">
        <motion.button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] text-white rounded-full hover:shadow-lg transition-shadow touch-manipulation"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Add Reason
        </motion.button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 w-full max-w-sm"
          >
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/20">
              <input
                type="text"
                placeholder="Enter a reason..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF] mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex-1 px-4 py-3 bg-[#C7AFFF] text-white rounded-lg hover:bg-[#B89FFF] transition-colors touch-manipulation"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewReason('');
                  }}
                  className="px-4 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage Reasons List */}
      {reasons.length > 0 && (
        <div className="mb-6 w-full max-w-sm max-h-48 overflow-y-auto">
          <div className="space-y-2">
            {reasons.map((reason) => {
              if (!reason.id) return null;
              return (
                <motion.div
                  key={reason.id}
                  className="flex items-center gap-2 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <p className="flex-1 text-white/80 text-sm">{reason.text}</p>
                  <button
                    onClick={() => handleDelete(reason.id!)}
                    className="p-2 bg-red-500 rounded hover:bg-red-600 transition-all touch-manipulation"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <motion.p
        className="text-white/60 text-center mb-8 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Tap the heart to reveal a reason ✨
      </motion.p>

      {/* Counter */}
      <motion.div
        className="mb-6 px-5 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="text-[#FFC8E2] text-sm">
          Reasons shown: <span>{count}</span>
        </p>
      </motion.div>

      {/* Main Heart Button */}
      <div className="relative">
        <motion.button
          className="relative flex items-center justify-center touch-manipulation"
          onClick={generateReason}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="inline-block"
            animate={{
              scale: [1, 1.05, 1],
              filter: [
                'drop-shadow(0 0 40px rgba(255, 200, 226, 0.6)) drop-shadow(0 0 80px rgba(199, 175, 255, 0.8))',
                'drop-shadow(0 0 60px rgba(255, 200, 226, 0.8)) drop-shadow(0 0 100px rgba(199, 175, 255, 1))',
                'drop-shadow(0 0 40px rgba(255, 200, 226, 0.6)) drop-shadow(0 0 80px rgba(199, 175, 255, 0.8))',
              ],
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              filter: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <Heart className="w-64 h-64 fill-[#FFC8E2] text-[#FFC8E2]" />
          </motion.div>

          {/* Orbiting Sparkles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.3,
              }}
              style={{
                width: '100%',
                height: '100%',
              }}
            >
              <Sparkles 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 text-[#C7AFFF]"
                style={{
                  transformOrigin: '50% 128px',
                }}
              />
            </motion.div>
          ))}
        </motion.button>
      </div>

      {/* Floating Reason Cards */}
      <AnimatePresence>
        {currentReasons.map((reason) => (
          <motion.div
            key={reason.id}
            className="fixed bottom-0 px-4 py-3 rounded-2xl bg-gradient-to-br from-[#C7AFFF]/90 to-[#FFC8E2]/90 backdrop-blur-md border border-white/20 shadow-2xl max-w-xs"
            style={{
              left: `${reason.x}%`,
            }}
            initial={{ 
              y: 100, 
              opacity: 0,
              scale: 0.8,
            }}
            animate={{ 
              y: -400, 
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1, 1, 0.8],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 4,
              ease: 'easeOut',
            }}
          >
            <p className="text-white text-center text-sm">{reason.text}</p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Ambient Hearts */}
      <AnimatePresence>
        {currentReasons.map((reason) => (
          [...Array(3)].map((_, i) => (
            <motion.div
              key={`${reason.id}-heart-${i}`}
              className="fixed"
              style={{
                left: `${reason.x + (Math.random() - 0.5) * 20}%`,
              }}
              initial={{ 
                y: window.innerHeight,
                opacity: 0.6,
              }}
              animate={{ 
                y: -100,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: i * 0.2,
                ease: 'easeOut',
              }}
            >
              <Heart className="w-5 h-5 fill-[#FFC8E2] text-[#FFC8E2]" />
            </motion.div>
          ))
        ))}
      </AnimatePresence>
    </div>
  );
}

