import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, Sparkles, Plus, X, Edit, Trash2 } from 'lucide-react';
import { BackButton } from './BackButton';
import { dateIdeaService, DateIdea } from '../lib/database-supabase';

export function DateRoulette({ onBack }: { onBack: () => void }) {
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateIdea | null>(null);
  const [rotation, setRotation] = useState(0);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string }>>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emoji: '🎬',
  });

  useEffect(() => {
    loadDateIdeas();
  }, []);

  const loadDateIdeas = async () => {
    try {
      setLoading(true);
      const data = await dateIdeaService.getAll();
      setDateIdeas(data);
    } catch (error) {
      console.error('Error loading date ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const spinWheel = () => {
    if (isSpinning || dateIdeas.length === 0) return;

    setIsSpinning(true);
    setSelectedDate(null);

    // Random spins + final position
    const spins = 5 + Math.random() * 3;
    const randomExtra = Math.random() * 360;
    const finalRotation = rotation + spins * 360 + randomExtra;
    setRotation(finalRotation);

    setTimeout(() => {
      // Calculate which segment the pointer lands on
      // Pointer is at top (pointing down at 0 degrees)
      // Wheel rotates clockwise, so we need to find which segment is at the top after rotation
      // Normalize rotation to 0-360 range
      const normalizedRotation = ((finalRotation % 360) + 360) % 360;
      
      // The pointer is at 0 degrees (top)
      // When wheel rotates R degrees clockwise, the segment at angle (360 - R) is now at the top
      // But since SVG is rotated -90deg, segments start at top, so we need to account for that
      const pointerAngle = (360 - normalizedRotation) % 360;
      
      // Find which segment contains this angle
      // Segments are positioned starting from top (0 degrees)
      let selectedIndex = -1;
      for (let i = 0; i < dateIdeas.length; i++) {
        const startAngle = i * segmentAngle;
        const endAngle = (i + 1) * segmentAngle;
        
        // Handle wrap-around for segments that cross 0 degrees
        if (startAngle > endAngle || (i === dateIdeas.length - 1 && pointerAngle >= startAngle)) {
          if (pointerAngle >= startAngle || pointerAngle < endAngle) {
            selectedIndex = i;
            break;
          }
        } else {
          if (pointerAngle >= startAngle && pointerAngle < endAngle) {
            selectedIndex = i;
            break;
          }
        }
      }
      
      // Fallback to first segment if calculation fails
      const selectedIdea = selectedIndex >= 0 ? dateIdeas[selectedIndex] : dateIdeas[0];
      setSelectedDate(selectedIdea);
      setIsSpinning(false);

      // Create confetti
      const newConfetti = Array.from({ length: 30 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        color: ['#C7AFFF', '#FFC8E2', '#A9E0FF'][Math.floor(Math.random() * 3)],
      }));
      setConfetti(newConfetti);

      setTimeout(() => setConfetti([]), 3000);
    }, 3000);
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in title and description');
      return;
    }

    try {
      await dateIdeaService.create(formData);
      setIsAdding(false);
      resetForm();
      await loadDateIdeas();
    } catch (error) {
      console.error('Error adding date idea:', error);
      alert('Failed to add date idea. Please try again.');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.title || !formData.description) {
      alert('Please fill in title and description');
      return;
    }

    try {
      await dateIdeaService.update(id, formData);
      setEditingId(null);
      resetForm();
      await loadDateIdeas();
    } catch (error) {
      console.error('Error updating date idea:', error);
      alert('Failed to update date idea. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this date idea?')) return;

    try {
      await dateIdeaService.delete(id);
      await loadDateIdeas();
    } catch (error) {
      console.error('Error deleting date idea:', error);
      alert('Failed to delete date idea. Please try again.');
    }
  };

  const startEdit = (idea: DateIdea) => {
    setEditingId(idea.id || null);
    setFormData({
      title: idea.title,
      description: idea.description,
      emoji: idea.emoji,
    });
    setIsAdding(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      emoji: '🎬',
    });
  };

  const segmentAngle = dateIdeas.length > 0 ? 360 / dateIdeas.length : 0;
  const commonEmojis = ['🎬', '🌅', '⭐', '👨‍🍳', '🎮', '☕', '🥾', '🎤', '🎨', '🏖️', '💃', '📚', '🎪', '🍕', '🎭', '🌺'];

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading date ideas...</div>
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
        Date Night Roulette
      </motion.h2>

      {/* Add Button */}
      <div className="mb-4">
        <motion.button
          onClick={() => {
            setIsAdding(true);
            resetForm();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] text-white rounded-full hover:shadow-lg transition-shadow text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          Add Date Idea
        </motion.button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 w-full max-w-md p-4 rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/20"
          >
            <h3 className="text-xl font-['Pacifico'] text-white mb-3">
              {editingId ? 'Edit Date Idea' : 'Add Date Idea'}
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title (e.g., Cozy Movie Marathon)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF] text-sm"
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF] text-sm"
              />
              <div>
                <label className="block text-white/80 mb-1 text-xs">Emoji</label>
                <div className="flex gap-1 flex-wrap">
                  {commonEmojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setFormData({ ...formData, emoji })}
                      className={`text-xl p-1 rounded transition-all ${
                        formData.emoji === emoji ? 'bg-[#C7AFFF] scale-110' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                className="flex-1 px-3 py-2 bg-[#C7AFFF] text-white rounded-lg hover:bg-[#B89FFF] transition-colors text-sm"
              >
                {editingId ? 'Update' : 'Add'}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage Ideas List */}
      {dateIdeas.length > 0 && (
        <div className="mb-6 w-full max-w-md max-h-32 overflow-y-auto">
          <div className="space-y-1">
            {dateIdeas.map((idea) => {
              if (!idea.id) return null;
              return (
                <motion.div
                  key={idea.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="text-lg">{idea.emoji}</span>
                  <p className="flex-1 text-white/80 text-xs">{idea.title}</p>
                  <button
                    onClick={() => startEdit(idea)}
                    className="opacity-0 group-hover:opacity-100 p-1 bg-[#C7AFFF] rounded hover:bg-[#B89FFF] transition-all"
                  >
                    <Edit className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(idea.id!)}
                    className="opacity-0 group-hover:opacity-100 p-1 bg-red-500 rounded hover:bg-red-600 transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <motion.p
        className="text-white/60 text-center mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Can't decide what to do? Let fate choose! 🎲
      </motion.p>

      {/* Wheel Container */}
      <div className="relative mb-12">
        {/* Pointer */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-[#FFC8E2]" />
        </motion.div>

        {/* Wheel */}
        {dateIdeas.length > 0 ? (
          <motion.div
            className="relative w-80 h-80 rounded-full shadow-2xl overflow-hidden border-4 border-white/20"
            animate={isSpinning ? {
              rotate: rotation,
            } : { 
              rotate: rotation,
              boxShadow: [
                '0 0 40px rgba(255, 200, 226, 0.5)',
                '0 0 60px rgba(199, 175, 255, 0.7)',
                '0 0 40px rgba(255, 200, 226, 0.5)',
              ]
            }}
            transition={isSpinning ? { 
              rotate: { duration: 3, ease: [0.3, 0.1, 0.2, 1.0] }
            } : {
              rotate: { duration: 0 },
              boxShadow: { duration: 2, repeat: Infinity }
            }}
          >
            {/* SVG for proper circular segments */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                {dateIdeas.map((_, index) => {
                  const colors = ['#C7AFFF', '#FFC8E2', '#A9E0FF'];
                  const color = colors[index % colors.length];
                  return (
                    <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.7" />
                    </linearGradient>
                  );
                })}
              </defs>
              {dateIdeas.map((idea, index) => {
                const colors = ['#C7AFFF', '#FFC8E2', '#A9E0FF'];
                const color = colors[index % colors.length];
                const startAngle = index * segmentAngle;
                const endAngle = (index + 1) * segmentAngle;
                
                // Convert to radians and adjust for SVG (starts at top)
                const startRad = ((startAngle - 90) * Math.PI) / 180;
                const endRad = ((endAngle - 90) * Math.PI) / 180;
                
                // Calculate arc points
                const centerX = 50;
                const centerY = 50;
                const radius = 50;
                
                const x1 = centerX + radius * Math.cos(startRad);
                const y1 = centerY + radius * Math.sin(startRad);
                const x2 = centerX + radius * Math.cos(endRad);
                const y2 = centerY + radius * Math.sin(endRad);
                
                const largeArc = segmentAngle > 180 ? 1 : 0;
                
                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');

                return (
                  <path
                    key={idea.id}
                    d={pathData}
                    fill={`url(#gradient-${index})`}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="0.5"
                  />
                );
              })}
            </svg>
            
            {/* Text labels for each segment */}
            {dateIdeas.map((idea, index) => {
              const startAngle = index * segmentAngle;
              const midAngle = startAngle + segmentAngle / 2;
              
              // Position text at 35% from center
              const textRadius = 35;
              const midRad = ((midAngle - 90) * Math.PI) / 180;
              const textX = 50 + textRadius * Math.cos(midRad);
              const textY = 50 + textRadius * Math.sin(midRad);

              return (
                <div
                  key={`text-${idea.id}`}
                  className="absolute text-center pointer-events-none z-20"
                  style={{
                    left: `${textX}%`,
                    top: `${textY}%`,
                    transform: `translate(-50%, -50%) rotate(${midAngle}deg)`,
                    transformOrigin: 'center center'
                  }}
                >
                  <div className="text-2xl mb-1" style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.7))' }}>
                    {idea.emoji}
                  </div>
                  <div 
                    className="text-white text-[10px] font-bold leading-tight"
                    style={{ 
                      textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
                      maxWidth: '70px',
                      wordBreak: 'break-word',
                      lineHeight: '1.1',
                      whiteSpace: 'normal',
                      transform: 'rotate(90deg)'
                    }}
                  >
                    {idea.title.length > 10 ? idea.title.substring(0, 10) + '...' : idea.title}
                  </div>
                </div>
              );
            })}

            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-white to-gray-100 border-4 border-white/50 flex items-center justify-center shadow-xl z-10">
              <Dices className="w-8 h-8 text-[#C7AFFF]" />
            </div>
          </motion.div>
        ) : (
          <div className="w-80 h-80 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center">
            <p className="text-white/60 text-center px-4">Add date ideas to spin the wheel!</p>
          </div>
        )}
      </div>

      {/* Spin Button */}
      <motion.button
        className="px-12 py-4 rounded-full text-white text-xl"
        style={{
          background: 'linear-gradient(135deg, #C7AFFF, #FFC8E2)',
        }}
        onClick={spinWheel}
        disabled={isSpinning || dateIdeas.length === 0}
        whileHover={!isSpinning && dateIdeas.length > 0 ? { scale: 1.1 } : {}}
        whileTap={!isSpinning && dateIdeas.length > 0 ? { scale: 0.95 } : {}}
        animate={{
          boxShadow: [
            '0 10px 30px rgba(199, 175, 255, 0.5)',
            '0 10px 40px rgba(255, 200, 226, 0.7)',
            '0 10px 30px rgba(199, 175, 255, 0.5)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isSpinning ? 'Spinning...' : dateIdeas.length === 0 ? 'Add Ideas First!' : 'Spin the Wheel!'}
      </motion.button>

      {/* Result Card */}
      <div className="relative min-h-[200px] w-full max-w-lg mt-12">
        <AnimatePresence mode="wait">
          {selectedDate && !isSpinning && (
            <motion.div
              key={selectedDate.id}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
            >
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                <motion.div
                  className="text-6xl text-center mb-4"
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {selectedDate.emoji}
                </motion.div>

                <h3 className="text-3xl font-['Pacifico'] text-white text-center mb-3">
                  {selectedDate.title}
                </h3>

                <p className="text-white/80 text-center">
                  {selectedDate.description}
                </p>

                {/* Sparkle Corners */}
                {[
                  { top: -10, left: -10 },
                  { top: -10, right: -10 },
                  { bottom: -10, left: -10 },
                  { bottom: -10, right: -10 },
                ].map((pos, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={pos}
                    animate={{
                      rotate: 360,
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-[#FFC8E2]" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confetti */}
      <AnimatePresence>
        {confetti.map((piece) => (
          <motion.div
            key={piece.id}
            className="fixed top-0 pointer-events-none z-50"
            style={{
              left: `${piece.x}%`,
            }}
            initial={{ y: -50, opacity: 1, rotate: 0 }}
            animate={{ 
              y: window.innerHeight + 100, 
              opacity: 0,
              rotate: Math.random() * 720 - 360,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5 + Math.random(), ease: 'easeIn' }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: piece.color }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
