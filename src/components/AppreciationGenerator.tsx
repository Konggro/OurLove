import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Plus, X, Trash2 } from 'lucide-react';
import { BackButton } from './BackButton';
import { complimentService, Compliment } from '../lib/database-supabase';

const defaultCompliments = [
  "You make every day brighter just by existing 🌟",
  "Your laugh is my favorite sound in the world",
  "You're the most amazing person I've ever known",
  "Thank you for being my safe place 💕",
  "You inspire me to be my best self",
  "Your kindness makes the world better",
  "I'm so lucky to have you in my life",
  "You're incredibly talented and don't even realize it",
  "Your hugs are magic ✨",
  "You make me believe in true love",
  "Your smile could light up the darkest room ☀️",
  "You have the most beautiful soul I've ever encountered",
  "Every moment with you feels like a dream come true",
  "You make ordinary days feel extraordinary",
  "Your presence alone makes everything better",
  "You're my favorite person to do absolutely nothing with",
  "The way you care for others shows your incredible heart",
  "You make me want to be the best version of myself",
  "Your voice is the most comforting sound in the universe",
  "You turn my worst days into bearable ones just by being you",
  "I fall in love with you more every single day",
  "Your thoughtfulness never goes unnoticed",
  "You're the reason I believe in soulmates",
  "Every little thing you do makes my heart skip a beat",
  "You're not just my boyfriend, you're my best friend",
  "Your strength inspires me every single day",
  "You make me feel like the luckiest person alive",
  "The way you look at me makes me feel so loved",
  "You're my happy place, my comfort zone, my everything",
  "Your passion for life is absolutely contagious",
  "You make me feel safe to be completely myself",
  "Every day with you is a new adventure I can't wait to start",
  "You're the missing piece I didn't know I was looking for",
  "Your love makes me feel invincible",
  "You're the best decision I never knew I was making",
  "The way you make me laugh is one of my favorite things about you",
  "You're my sunshine on the cloudiest days",
  "Your support means more to me than you'll ever know",
  "You make falling in love feel like the easiest thing in the world",
  "I'm grateful for every second I get to spend with you",
  "You're my favorite notification, my favorite person, my favorite everything",
];

export function AppreciationGenerator({ onBack }: { onBack: () => void }) {
  const [compliments, setCompliments] = useState<Compliment[]>([]);
  const [currentCompliment, setCurrentCompliment] = useState<string | null>(null);
  const [hearts, setHearts] = useState<Array<{ id: number; x: number }>>([]);
  const [count, setCount] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newCompliment, setNewCompliment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompliments();
  }, []);

  const loadCompliments = async () => {
    try {
      setLoading(true);
      const data = await complimentService.getAll();
      setCompliments(data);
    } catch (error) {
      console.error('Error loading compliments:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCompliment = () => {
    // Combine default compliments with user-added compliments
    const userCompliments = compliments.map(c => c.text);
    const allCompliments = [...defaultCompliments, ...userCompliments];
    
    if (allCompliments.length === 0) {
      alert('Add some compliments first! Click "Add Compliment" to get started.');
      return;
    }

    // Randomly select from all compliments (40 default + user-added)
    const randomCompliment = allCompliments[Math.floor(Math.random() * allCompliments.length)];
    setCurrentCompliment(randomCompliment);
    setCount(prev => prev + 1);

    // Generate floating hearts
    const newHearts = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: 30 + Math.random() * 40,
    }));
    setHearts(prev => [...prev, ...newHearts]);

    // Clean up old hearts
    setTimeout(() => {
      setHearts(prev => prev.slice(8));
    }, 3000);
  };

  const handleAdd = async () => {
    if (!newCompliment.trim()) {
      alert('Please enter a compliment');
      return;
    }

    try {
      await complimentService.create({ text: newCompliment.trim() });
      setNewCompliment('');
      setIsAdding(false);
      await loadCompliments();
    } catch (error) {
      console.error('Error adding compliment:', error);
      alert('Failed to add compliment. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this compliment?')) return;

    try {
      await complimentService.delete(id);
      await loadCompliments();
    } catch (error) {
      console.error('Error deleting compliment:', error);
      alert('Failed to delete compliment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading compliments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pt-24 flex flex-col items-center justify-center">
      <BackButton onBack={onBack} />
      
      <motion.h2
        className="text-5xl font-['Pacifico'] text-center text-transparent bg-clip-text bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Boyfriend Appreciation Generator
      </motion.h2>

      {/* Add Button */}
      <div className="mb-4">
        <motion.button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] text-white rounded-full hover:shadow-lg transition-shadow text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          Add Compliment
        </motion.button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 w-full max-w-md"
          >
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/20">
              <input
                type="text"
                placeholder="Enter a compliment..."
                value={newCompliment}
                onChange={(e) => setNewCompliment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF] mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex-1 px-4 py-2 bg-[#C7AFFF] text-white rounded-lg hover:bg-[#B89FFF] transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewCompliment('');
                  }}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <motion.p
        className="text-white/60 text-center mb-12 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Click the heart to reveal a compliment ✨
      </motion.p>

      {/* Counter */}
      <motion.div
        className="mb-8 px-6 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="text-[#FFC8E2] text-sm">
          Compliments given: <span>{count}</span>
        </p>
      </motion.div>

      {/* Main Heart Button */}
      <div className="relative mb-12">
        <motion.button
          className="relative w-64 h-64 flex items-center justify-center"
          onClick={generateCompliment}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Heart className="w-64 h-64 fill-[#FFC8E2] text-[#FFC8E2]" />
          </motion.div>

          {/* Pulsing Glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                '0 0 40px rgba(255, 200, 226, 0.5)',
                '0 0 80px rgba(255, 200, 226, 0.8)',
                '0 0 40px rgba(255, 200, 226, 0.5)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

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
                className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 text-[#C7AFFF]"
                style={{
                  transformOrigin: '50% 130px',
                }}
              />
            </motion.div>
          ))}
        </motion.button>
      </div>

      {/* Compliment Display */}
      <div className="relative min-h-[120px] w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {currentCompliment && (
            <motion.div
              key={currentCompliment}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative px-8 py-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                <p className="text-white text-2xl text-center">
                  {currentCompliment}
                </p>

                {/* Sparkle Corners */}
                {[
                  { top: -8, left: -8 },
                  { top: -8, right: -8 },
                  { bottom: -8, left: -8 },
                  { bottom: -8, right: -8 },
                ].map((pos, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={pos}
                    animate={{
                      rotate: [0, 90, 180, 270, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-[#FFC8E2]" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Hearts */}
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            className="fixed pointer-events-none"
            style={{
              left: `${heart.x}%`,
              bottom: '20%',
            }}
            initial={{ y: 0, opacity: 0.8, scale: 0 }}
            animate={{ 
              y: -400, 
              opacity: 0,
              scale: [0, 1, 1.5],
              rotate: [0, 10, -10, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: 'easeOut' }}
          >
            <Heart className="w-8 h-8 fill-[#FFC8E2] text-[#FFC8E2]" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
