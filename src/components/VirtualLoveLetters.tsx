import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, X, Sparkles, Plus, Edit, Trash2 } from 'lucide-react';
import { BackButton } from './BackButton';
import { loveLetterService, LoveLetter } from '../lib/database-supabase';

const colors = ['#C7AFFF', '#FFC8E2', '#A9E0FF', '#FFE5A9', '#B5E7A0', '#FFAFCC', '#D4A5FF'];

export function VirtualLoveLetters({ onBack }: { onBack: () => void }) {
  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [openLetter, setOpenLetter] = useState<LoveLetter | null>(null);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    content: '',
    color: colors[0],
  });

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    try {
      setLoading(true);
      const data = await loveLetterService.getAll();
      setLetters(data);
    } catch (error) {
      console.error('Error loading letters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.content || !formData.date) {
      alert('Please fill in title, date, and content');
      return;
    }

    try {
      await loveLetterService.create({
        title: formData.title,
        date: formData.date,
        content: formData.content,
        color: formData.color,
      });
      setIsAdding(false);
      resetForm();
      await loadLetters();
    } catch (error) {
      console.error('Error adding letter:', error);
      alert('Failed to add letter. Please try again.');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.title || !formData.content || !formData.date) {
      alert('Please fill in title, date, and content');
      return;
    }

    try {
      await loveLetterService.update(id, {
        title: formData.title,
        date: formData.date,
        content: formData.content,
        color: formData.color,
      });
      setEditingId(null);
      resetForm();
      await loadLetters();
      if (openLetter?.id === id) {
        setOpenLetter(null);
      }
    } catch (error) {
      console.error('Error updating letter:', error);
      alert('Failed to update letter. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this love letter?')) return;

    try {
      await loveLetterService.delete(id);
      await loadLetters();
      if (openLetter?.id === id) {
        setOpenLetter(null);
      }
    } catch (error) {
      console.error('Error deleting letter:', error);
      alert('Failed to delete letter. Please try again.');
    }
  };

  const startEdit = (letter: LoveLetter) => {
    setEditingId(letter.id || null);
    setFormData({
      title: letter.title,
      date: letter.date,
      content: letter.content,
      color: letter.color,
    });
    setIsAdding(false);
    setOpenLetter(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      content: '',
      color: colors[0],
    });
  };

  const handleOpenLetter = (letter: LoveLetter) => {
    setOpenLetter(letter);
    
    // Create sparkle burst
    const newSparkles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setSparkles(newSparkles);
    
    setTimeout(() => setSparkles([]), 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading letters...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pt-24">
      <BackButton onBack={onBack} />
      
      <motion.h2
        className="text-5xl font-['Pacifico'] text-center text-transparent bg-clip-text bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Virtual Love Letters
      </motion.h2>

      {/* Add Button */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-end">
        <motion.button
          onClick={() => {
            setIsAdding(true);
            resetForm();
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] text-white rounded-full hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Write Letter
        </motion.button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto mb-8 p-6 rounded-3xl bg-white/10 backdrop-blur-xl border-2 border-white/20"
          >
            <h3 className="text-2xl font-['Pacifico'] text-white mb-4">
              {editingId ? 'Edit Letter' : 'Write New Letter'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Letter Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
                />
                <input
                  type="text"
                  placeholder="Date (e.g., January 14, 2024)"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
                />
              </div>
              <textarea
                placeholder="Your love letter content..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <div>
                <label className="block text-white/80 mb-2 text-sm">Letter Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        formData.color === color ? 'border-white scale-110 ring-2 ring-white/50' : 'border-white/30 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#C7AFFF] text-white rounded-lg hover:bg-[#B89FFF] transition-colors"
              >
                {editingId ? 'Update' : 'Save'} Letter
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {letters.map((letter, index) => {
          if (!letter.id) return null;

          return (
            <motion.div
              key={letter.id}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Edit/Delete Buttons */}
              <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(letter)}
                  className="p-2 bg-[#C7AFFF] rounded-full hover:bg-[#B89FFF] transition-colors backdrop-blur-sm"
                >
                  <Edit className="w-3 h-3 text-white" />
                </button>
                <button
                  onClick={() => handleDelete(letter.id!)}
                  className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors backdrop-blur-sm"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>

              <motion.button
                className="relative w-full"
                onClick={() => handleOpenLetter(letter)}
                whileHover={{ y: -10 }}
              >
                {/* Envelope */}
                <motion.div
                  className="relative w-full aspect-[4/3] rounded-lg shadow-xl overflow-hidden cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${letter.color}80, ${letter.color}40)`,
                  }}
                  whileHover={{
                    boxShadow: `0 20px 40px ${letter.color}60`,
                  }}
                  animate={{
                    rotate: [0, -2, 2, 0],
                  }}
                  transition={{
                    rotate: {
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3,
                    },
                  }}
                >
                  {/* Envelope Body */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mail className="w-16 h-16 text-white/40" />
                  </div>

                  {/* Envelope Flap */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-1/2 origin-top"
                    style={{
                      background: `linear-gradient(180deg, ${letter.color}60, ${letter.color}40)`,
                      clipPath: 'polygon(0 0, 50% 40%, 100% 0)',
                      transformStyle: 'preserve-3d',
                    }}
                    whileHover={{
                      rotateX: -120,
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Seal */}
                  <motion.div
                    className="absolute top-[35%] left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#FFC8E2] border-4 border-white/20 flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>

                  {/* Label */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-xs mb-1">{letter.date}</p>
                    <p className="text-white font-medium">{letter.title}</p>
                  </div>
                </motion.div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Letter Modal */}
      <AnimatePresence>
        {openLetter && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenLetter(null)}
            />
            
            {/* Sparkle Burst */}
            {sparkles.map((sparkle) => (
              <motion.div
                key={sparkle.id}
                className="fixed z-50 pointer-events-none"
                style={{
                  left: `${sparkle.x}%`,
                  top: `${sparkle.y}%`,
                }}
                initial={{ opacity: 1, scale: 0 }}
                animate={{ 
                  opacity: 0, 
                  scale: 2,
                  rotate: 360,
                }}
                transition={{ duration: 1 }}
              >
                <Sparkles className="w-6 h-6 text-[#FFC8E2]" />
              </motion.div>
            ))}

            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4"
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
            >
              {/* Letter Paper */}
              <div 
                className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-12 shadow-2xl"
                style={{
                  backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                  backgroundSize: '100% 30px',
                }}
              >
                <button
                  onClick={() => setOpenLetter(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Letter Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-sm mb-2" style={{ color: openLetter.color }}>
                    {openLetter.date}
                  </p>
                  <h3 
                    className="text-4xl font-['Pacifico'] mb-8"
                    style={{ color: openLetter.color }}
                  >
                    {openLetter.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                    {openLetter.content}
                  </p>
                  <div className="mt-8 text-right">
                    <p className="text-gray-500 italic">With all my love,</p>
                    <p 
                      className="text-2xl font-['Pacifico'] mt-2"
                      style={{ color: openLetter.color }}
                    >
                      Your Sweetheart 💕
                    </p>
                  </div>
                </motion.div>

                {/* Decorative Hearts */}
                <motion.div
                  className="absolute -top-6 -right-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <path
                      d="M40 70 L20 50 Q10 40 20 30 T40 30 Q50 20 60 30 T60 50 Z"
                      fill={openLetter.color}
                      opacity="0.2"
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {letters.length === 0 && !isAdding && (
        <div className="text-center text-white/60 mt-12">
          <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl mb-4">No letters yet</p>
          <p>Click "Write Letter" to create your first love letter!</p>
        </div>
      )}
    </div>
  );
}
