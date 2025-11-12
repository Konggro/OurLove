import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Languages, Plus, Edit, Trash2, X, Eye, EyeOff, Globe } from 'lucide-react';
import { BackButton } from './BackButton';
import { languageService, LanguageEntry } from '../lib/database-supabase';

const commonLanguages = [
  'Spanish', 'French', 'Italian', 'German', 'Japanese', 
  'Korean', 'Chinese', 'Portuguese', 'Russian', 'Arabic',
  'Hindi', 'Turkish', 'Dutch', 'Swedish', 'Other'
];

export function LanguageLearning({ onBack }: { onBack: () => void }) {
  const [entries, setEntries] = useState<LanguageEntry[]>([]);
  const [revealedTranslations, setRevealedTranslations] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  const [formData, setFormData] = useState({
    language: commonLanguages[0],
    word_or_phrase: '',
    translation: '',
    notes: '',
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await languageService.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Error loading language entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.word_or_phrase.trim() || !formData.translation.trim()) {
      alert('Please fill in both word/phrase and translation');
      return;
    }

    try {
      await languageService.create({
        language: formData.language,
        word_or_phrase: formData.word_or_phrase,
        translation: formData.translation,
        notes: formData.notes || undefined,
      });
      setIsAdding(false);
      resetForm();
      await loadEntries();
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Failed to add entry. Please try again.');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.word_or_phrase.trim() || !formData.translation.trim()) {
      alert('Please fill in both word/phrase and translation');
      return;
    }

    try {
      await languageService.update(id, {
        language: formData.language,
        word_or_phrase: formData.word_or_phrase,
        translation: formData.translation,
        notes: formData.notes || undefined,
      });
      setEditingId(null);
      resetForm();
      await loadEntries();
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Failed to update entry. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await languageService.delete(id);
      await loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const startEdit = (entry: LanguageEntry) => {
    setEditingId(entry.id || null);
    setFormData({
      language: entry.language,
      word_or_phrase: entry.word_or_phrase,
      translation: entry.translation,
      notes: entry.notes || '',
    });
  };

  const resetForm = () => {
    setFormData({
      language: '',
      word_or_phrase: '',
      translation: '',
      notes: '',
    });
  };

  const toggleReveal = (id: string) => {
    setRevealedTranslations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredEntries = selectedLanguage === 'all' 
    ? entries 
    : entries.filter(e => e.language === selectedLanguage);

  const languages = Array.from(new Set(entries.map(e => e.language))).sort();

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading language entries...</div>
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
        Language Learning
      </motion.h2>

      <motion.p
        className="text-white/60 text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Learn languages together 🌍💕
      </motion.p>

      {/* Add Button */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-end">
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
          Add Entry
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
              {editingId ? 'Edit Entry' : 'Add New Entry'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Language (e.g., Spanish, French, Japanese)"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
                list="language-suggestions"
              />
              <datalist id="language-suggestions">
                {commonLanguages.map(lang => (
                  <option key={lang} value={lang} />
                ))}
              </datalist>
              <input
                type="text"
                placeholder="Word or Phrase"
                value={formData.word_or_phrase}
                onChange={(e) => setFormData({ ...formData, word_or_phrase: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <input
                type="text"
                placeholder="Translation"
                value={formData.translation}
                onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF] md:col-span-2"
              />
              <textarea
                placeholder="Notes (optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF] md:col-span-2"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#C7AFFF] text-white rounded-lg hover:bg-[#B89FFF] transition-colors"
              >
                {editingId ? 'Update' : 'Add'} Entry
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

      {/* Language Filter */}
      {languages.length > 0 && (
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => setSelectedLanguage('all')}
              className={`px-4 py-2 rounded-full transition-all ${
                selectedLanguage === 'all'
                  ? 'bg-[#C7AFFF] text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              All Languages
            </button>
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                  selectedLanguage === lang
                    ? 'bg-[#FFC8E2] text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <Globe className="w-4 h-4" />
                {lang}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Language Entries */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntries.map((entry, index) => {
          if (!entry.id) return null;
          const isRevealed = revealedTranslations.has(entry.id);

          return (
            <motion.div
              key={entry.id}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Edit/Delete Buttons */}
              <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(entry)}
                  className="p-2 bg-[#C7AFFF] rounded-full hover:bg-[#B89FFF] transition-colors backdrop-blur-sm"
                >
                  <Edit className="w-3 h-3 text-white" />
                </button>
                <button
                  onClick={() => handleDelete(entry.id!)}
                  className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors backdrop-blur-sm"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>

              <motion.div
                className="relative p-6 rounded-3xl backdrop-blur-xl border-2 shadow-xl overflow-hidden cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(199, 175, 255, 0.2), rgba(255, 200, 226, 0.1))',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => toggleReveal(entry.id!)}
              >
                {/* Language Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                  <span className="text-white text-xs flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {entry.language}
                  </span>
                </div>

                {/* Word/Phrase */}
                <div className="mt-12 mb-4">
                  <h3 className="text-2xl font-['Pacifico'] text-white text-center mb-4">
                    {entry.word_or_phrase}
                  </h3>
                </div>

                {/* Translation - Hidden by default */}
                <AnimatePresence>
                  {isRevealed ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4"
                    >
                      <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                        <p className="text-white text-lg text-center font-medium">
                          {entry.translation}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mb-4"
                    >
                      <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 border-dashed">
                        <div className="flex items-center justify-center gap-2 text-white/60">
                          <EyeOff className="w-4 h-4" />
                          <p className="text-sm">Click to reveal translation</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Notes */}
                {entry.notes && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-white/70 text-sm italic text-center">
                      {entry.notes}
                    </p>
                  </div>
                )}

                {/* Decorative Elements */}
                <motion.div
                  className="absolute -bottom-2 -right-2 opacity-20"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 3, repeat: Infinity },
                  }}
                >
                  <Languages className="w-16 h-16 text-[#C7AFFF]" />
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {filteredEntries.length === 0 && !isAdding && (
        <div className="text-center text-white/60 mt-12">
          <Languages className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl mb-4">No entries yet</p>
          <p>Click "Add Entry" to start learning together!</p>
        </div>
      )}
    </div>
  );
}

