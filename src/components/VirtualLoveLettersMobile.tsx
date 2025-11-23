import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, X, Sparkles, Plus, Edit, Trash2 } from 'lucide-react';
import { BackButton } from './BackButton';
import { loveLetterService, LoveLetter } from '../lib/database-supabase';

const colors = ['#C7AFFF', '#FFC8E2', '#A9E0FF', '#FFE5A9', '#B5E7A0', '#FFAFCC', '#D4A5FF'];

export function VirtualLoveLettersMobile({ onBack }: { onBack: () => void }) {
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
    
    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setSparkles(newSparkles);
    
    setTimeout(() => setSparkles([]), 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 pt-20 flex items-center justify-center">
        <div className="text-white text-lg">Loading letters...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-20 pb-8">
      <BackButton onBack={onBack} />
      
      <motion.h2
        className="text-3xl font-['Pacifico'] text-center text-transparent bg-clip-text bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Virtual Love Letters
      </motion.h2>

      {/* Add Button */}
      <div className="mb-6 flex justify-center">
        <motion.button
          onClick={() => {
            setIsAdding(true);
            resetForm();
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] text-white rounded-full hover:shadow-lg transition-shadow touch-manipulation"
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
            className="mb-6 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/20"
          >
            <h3 className="text-xl font-['Pacifico'] text-white mb-4">
              {editingId ? 'Edit Letter' : 'Write New Letter'}
            </h3>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Letter Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <input
                type="text"
                placeholder="Date (e.g., January 14, 2024)"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <textarea
                placeholder="Your love letter content..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <div>
                <label className="block text-white/80 mb-2 text-sm">Letter Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-12 h-12 rounded-full border-2 transition-all touch-manipulation ${
                        formData.color === color ? 'border-white scale-110 ring-2 ring-white/50' : 'border-white/30'
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
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#C7AFFF] text-white rounded-lg hover:bg-[#B89FFF] transition-colors touch-manipulation"
              >
                {editingId ? 'Update' : 'Save'} Letter
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-4 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letters Grid */}
      <div className="grid grid-cols-1 gap-4">
        {letters.map((letter, index) => {
          if (!letter.id) return null;

          return (
            <motion.div
              key={letter.id}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Edit/Delete Buttons */}
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onClick={() => startEdit(letter)}
                  className="p-2 bg-[#C7AFFF] rounded-full hover:bg-[#B89FFF] transition-colors backdrop-blur-sm touch-manipulation"
                >
                  <Edit className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => handleDelete(letter.id!)}
                  className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors backdrop-blur-sm touch-manipulation"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>

              <motion.button
                className="relative w-full"
                onClick={() => handleOpenLetter(letter)}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="relative w-full aspect-[3/2] rounded-xl shadow-xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${letter.color}80, ${letter.color}40)`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mail className="w-16 h-16 text-white/40" />
                  </div>

                  <motion.div
                    className="absolute top-[30%] left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#FFC8E2] border-4 border-white/20 flex items-center justify-center shadow-lg"
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-xs mb-1">{letter.date}</p>
                    <p className="text-white font-medium text-sm">{letter.title}</p>
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
            >
              <div 
                className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-2xl"
              >
                <button
                  onClick={() => setOpenLetter(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-xs mb-2" style={{ color: openLetter.color }}>
                    {openLetter.date}
                  </p>
                  <h3 
                    className="text-2xl font-['Pacifico'] mb-4"
                    style={{ color: openLetter.color }}
                  >
                    {openLetter.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                    {openLetter.content}
                  </p>
                  <div className="mt-6 text-right">
                    <p className="text-gray-500 italic text-xs">With all my love,</p>
                    <p 
                      className="text-lg font-['Pacifico'] mt-1"
                      style={{ color: openLetter.color }}
                    >
                      Your Sweetheart 💕
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {letters.length === 0 && !isAdding && (
        <div className="text-center text-white/60 mt-12">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg mb-4">No letters yet</p>
          <p className="text-sm">Click "Write Letter" to create your first love letter!</p>
        </div>
      )}
    </div>
  );
}


