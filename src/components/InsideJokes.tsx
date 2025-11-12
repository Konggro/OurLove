import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Laugh, Search, X, Plus, Edit, Trash2 } from 'lucide-react';
import { BackButton } from './BackButton';
import { jokeService, Joke } from '../lib/database-supabase';

export function InsideJokes({ onBack }: { onBack: () => void }) {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [selectedJoke, setSelectedJoke] = useState<Joke | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    origin: '',
    story: '',
    emoji: '😄',
  });

  useEffect(() => {
    loadJokes();
  }, []);

  const loadJokes = async () => {
    try {
      setLoading(true);
      const data = await jokeService.getAll();
      setJokes(data);
    } catch (error) {
      console.error('Error loading jokes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.story) {
      alert('Please fill in title and story');
      return;
    }

    try {
      await jokeService.create(formData);
      setIsAdding(false);
      resetForm();
      await loadJokes();
    } catch (error) {
      console.error('Error adding joke:', error);
      alert('Failed to add joke. Please try again.');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.title || !formData.story) {
      alert('Please fill in title and story');
      return;
    }

    try {
      await jokeService.update(id, formData);
      setEditingId(null);
      resetForm();
      await loadJokes();
      if (selectedJoke?.id === id) {
        setSelectedJoke(null);
      }
    } catch (error) {
      console.error('Error updating joke:', error);
      alert('Failed to update joke. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this joke?')) return;

    try {
      await jokeService.delete(id);
      await loadJokes();
      if (selectedJoke?.id === id) {
        setSelectedJoke(null);
      }
    } catch (error) {
      console.error('Error deleting joke:', error);
      alert('Failed to delete joke. Please try again.');
    }
  };

  const startEdit = (joke: Joke) => {
    setEditingId(joke.id || null);
    setFormData({
      title: joke.title,
      origin: joke.origin,
      story: joke.story,
      emoji: joke.emoji,
    });
    setIsAdding(false);
    setSelectedJoke(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      origin: '',
      story: '',
      emoji: '😄',
    });
  };

  const filteredJokes = jokes.filter(joke =>
    joke.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    joke.story.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const commonEmojis = ['😄', '😂', '🤣', '😆', '🥞', '📞', '🐬', '💃', '🍕', '🎤', '🎬', '🌟', '💕', '✨'];

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading jokes...</div>
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
        Inside Jokes Encyclopedia
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
          Add Joke
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
              {editingId ? 'Edit Joke' : 'Add New Joke'}
            </h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Joke Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <input
                type="text"
                placeholder="Origin (e.g., Sunday Morning, Jan 2024)"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <textarea
                placeholder="The story..."
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <div>
                <label className="block text-white/80 mb-2 text-sm">Emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {commonEmojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setFormData({ ...formData, emoji })}
                      className={`text-2xl p-2 rounded-lg transition-all ${
                        formData.emoji === emoji ? 'bg-[#C7AFFF] scale-110' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                  <input
                    type="text"
                    placeholder="Or type emoji"
                    value={formData.emoji}
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF] text-sm"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#C7AFFF] text-white rounded-lg hover:bg-[#B89FFF] transition-colors"
              >
                {editingId ? 'Update' : 'Add'} Joke
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

      <motion.p
        className="text-white/60 text-center mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Our personal collection of hilarious memories 😄
      </motion.p>

      {/* Search Bar */}
      <motion.div
        className="max-w-md mx-auto mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search our jokes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C7AFFF] transition-all"
          />
        </div>
      </motion.div>

      {/* Joke Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJokes.map((joke, index) => {
          if (!joke.id) return null;

          return (
            <motion.div
              key={joke.id}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Edit/Delete Buttons */}
              <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(joke)}
                  className="p-2 bg-[#C7AFFF] rounded-full hover:bg-[#B89FFF] transition-colors backdrop-blur-sm"
                >
                  <Edit className="w-3 h-3 text-white" />
                </button>
                <button
                  onClick={() => handleDelete(joke.id!)}
                  className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors backdrop-blur-sm"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>

              <motion.button
                className="relative w-full"
                onClick={() => setSelectedJoke(joke)}
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 shadow-xl cursor-pointer"
                  whileHover={{
                    boxShadow: '0 20px 40px rgba(199, 175, 255, 0.3)',
                    borderColor: 'rgba(199, 175, 255, 0.5)',
                  }}
                >
                  {/* Emoji Badge */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-[#FFC8E2] to-[#C7AFFF] flex items-center justify-center text-2xl shadow-lg"
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  >
                    {joke.emoji}
                  </motion.div>

                  <div className="flex items-start gap-3 mb-3">
                    <Laugh className="w-5 h-5 text-[#FFC8E2] flex-shrink-0 mt-1" />
                    <h3 className="text-white text-left">{joke.title}</h3>
                  </div>

                  <p className="text-white/60 text-sm text-left mb-3">{joke.origin}</p>

                  <p className="text-white/80 text-sm text-left line-clamp-3">
                    {joke.story}
                  </p>

                  {/* Hover indicator */}
                  <motion.div
                    className="absolute bottom-4 right-4 text-[#C7AFFF] text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Read more →
                  </motion.div>
                </motion.div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Joke Modal */}
      <AnimatePresence>
        {selectedJoke && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJoke(null)}
            />
            
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
            >
              <div className="relative bg-gradient-to-br from-white via-[#FFC8E2]/10 to-white rounded-3xl p-8 shadow-2xl">
                <button
                  onClick={() => setSelectedJoke(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Large Emoji */}
                <motion.div
                  className="text-6xl text-center mb-6"
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  {selectedJoke.emoji}
                </motion.div>

                <h3 className="text-3xl font-['Pacifico'] text-gray-900 text-center mb-4">
                  {selectedJoke.title}
                </h3>

                <p className="text-[#C7AFFF] text-center text-sm mb-6">
                  {selectedJoke.origin}
                </p>

                <p className="text-gray-700 leading-relaxed text-center">
                  {selectedJoke.story}
                </p>

                {/* Doodle Elements */}
                <motion.div
                  className="absolute -top-6 -left-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="25" fill="none" stroke="#C7AFFF" strokeWidth="2" opacity="0.3" strokeDasharray="5,5" />
                  </svg>
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -right-6"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                >
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <path
                      d="M30 10 L35 25 L50 30 L35 35 L30 50 L25 35 L10 30 L25 25 Z"
                      fill="#FFC8E2"
                      opacity="0.3"
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {jokes.length === 0 && !isAdding && (
        <div className="text-center text-white/60 mt-12">
          <Laugh className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl mb-4">No jokes yet</p>
          <p>Click "Add Joke" to start your collection!</p>
        </div>
      )}
    </div>
  );
}
