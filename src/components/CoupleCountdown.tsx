import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Clock, Sparkles, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { BackButton } from './BackButton';
import { countdownService, Countdown } from '../lib/database-supabase';

function calculateTimeLeft(targetDate: Date) {
  const now = new Date().getTime();
  const target = targetDate.getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    isToday: false,
  };
}

const colors = ['#FFC8E2', '#A9E0FF', '#C7AFFF'];
const emojis = ['💕', '🎂', '✈️', '🏔️', '🎉', '🌙', '⭐', '💍', '🎁', '🌺'];

export function CoupleCountdown({ onBack }: { onBack: () => void }) {
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [timeLefts, setTimeLefts] = useState<Record<string, ReturnType<typeof calculateTimeLeft>>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    emoji: '💕',
    color: colors[0],
  });

  useEffect(() => {
    loadCountdowns();
  }, []);

  useEffect(() => {
    const updateCountdowns = () => {
      const newTimeLefts: Record<string, ReturnType<typeof calculateTimeLeft>> = {};
      countdowns.forEach(countdown => {
        if (countdown.id) {
          newTimeLefts[countdown.id] = calculateTimeLeft(countdown.date);
        }
      });
      setTimeLefts(newTimeLefts);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [countdowns]);

  const loadCountdowns = async () => {
    try {
      setLoading(true);
      const data = await countdownService.getAll();
      setCountdowns(data);
    } catch (error) {
      console.error('Error loading countdowns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.date) return;

    try {
      await countdownService.create({
        title: formData.title,
        date: new Date(formData.date),
        emoji: formData.emoji,
        color: formData.color,
      });
      setIsAdding(false);
      setFormData({ title: '', date: '', emoji: '💕', color: colors[0] });
      await loadCountdowns();
    } catch (error) {
      console.error('Error adding countdown:', error);
      alert('Failed to add countdown. Please try again.');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.title || !formData.date) return;

    try {
      await countdownService.update(id, {
        title: formData.title,
        date: new Date(formData.date),
        emoji: formData.emoji,
        color: formData.color,
      });
      setEditingId(null);
      setFormData({ title: '', date: '', emoji: '💕', color: colors[0] });
      await loadCountdowns();
    } catch (error) {
      console.error('Error updating countdown:', error);
      alert('Failed to update countdown. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this countdown?')) return;

    try {
      await countdownService.delete(id);
      await loadCountdowns();
    } catch (error) {
      console.error('Error deleting countdown:', error);
      alert('Failed to delete countdown. Please try again.');
    }
  };

  const startEdit = (countdown: Countdown) => {
    setEditingId(countdown.id || null);
    setFormData({
      title: countdown.title,
      date: countdown.date.toISOString().split('T')[0],
      emoji: countdown.emoji,
      color: countdown.color,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading countdowns...</div>
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
        Couple Countdown
      </motion.h2>

      {/* Add Button */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-end">
        <motion.button
          onClick={() => {
            setIsAdding(true);
            setFormData({ title: '', date: '', emoji: '💕', color: colors[0] });
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] text-white rounded-full hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Add Countdown
        </motion.button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto mb-8 p-6 rounded-3xl bg-white/10 backdrop-blur-xl border-2 border-white/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Countdown Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <div className="md:col-span-2">
                <label className="block text-white/80 mb-2 text-sm">Emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setFormData({ ...formData, emoji })}
                      className={`text-2xl p-2 rounded-lg transition-all ${
                        formData.emoji === emoji ? 'bg-white/30 scale-110 ring-2 ring-white/50' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-white/80 mb-2 text-sm">Background Color</label>
                <div className="flex gap-2 items-center">
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
                  {/* Preview */}
                  <div className="ml-4 flex items-center gap-2">
                    <span className="text-white/60 text-sm">Preview:</span>
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl overflow-hidden"
                      style={{ backgroundColor: formData.color }}
                    >
                      <span>{formData.emoji}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#C7AFFF] text-white rounded-lg hover:bg-[#B89FFF] transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Add'} Countdown
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({ title: '', date: '', emoji: '💕', color: colors[0] });
                }}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {countdowns.map((countdown, index) => {
          const timeLeft = countdown.id ? timeLefts[countdown.id] : null;
          if (!timeLeft || !countdown.id) return null;

          return (
            <motion.div
              key={countdown.id}
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Edit/Delete Buttons */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                  onClick={() => startEdit(countdown)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <Edit className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => handleDelete(countdown.id!)}
                  className="p-2 bg-red-500/80 backdrop-blur-sm rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>

              <motion.div
                className="relative p-8 rounded-3xl backdrop-blur-xl border-2 shadow-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${countdown.color}40, ${countdown.color}20)`,
                  borderColor: countdown.color,
                }}
                animate={{
                  boxShadow: [
                    `0 10px 40px ${countdown.color}40`,
                    `0 20px 60px ${countdown.color}60`,
                    `0 10px 40px ${countdown.color}40`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <motion.div
                  className="flex justify-center mb-4"
                  animate={timeLeft.isToday ? {
                    scale: [1, 1.3, 1],
                    rotate: [0, -10, 10, -10, 0],
                  } : {
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: timeLeft.isToday ? 0.5 : 2,
                    repeat: Infinity,
                  }}
                >
                  <div 
                    className="relative w-20 h-20 rounded-full flex items-center justify-center text-4xl overflow-hidden"
                    style={{ 
                      backgroundColor: countdown.color,
                      minWidth: '5rem',
                      minHeight: '5rem',
                    }}
                  >
                    <span className="relative z-10">{countdown.emoji}</span>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 pointer-events-none"
                      style={{ borderColor: countdown.color }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.8, 0, 0.8],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                  </div>
                </motion.div>

                <h3 
                  className="text-2xl font-['Pacifico'] text-center mb-6"
                  style={{ color: countdown.color }}
                >
                  {countdown.title}
                </h3>

                {timeLeft.isToday ? (
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <p className="text-4xl text-white mb-4">🎉</p>
                    <p className="text-2xl text-white">It's Today!</p>
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2"
                        animate={{
                          x: Math.cos((i * Math.PI * 2) / 8) * 100,
                          y: Math.sin((i * Math.PI * 2) / 8) * 100,
                          opacity: [1, 0],
                          scale: [0, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      >
                        <Sparkles 
                          className="w-4 h-4"
                          style={{ color: countdown.color }}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Days', value: timeLeft.days },
                      { label: 'Hours', value: timeLeft.hours },
                      { label: 'Mins', value: timeLeft.minutes },
                      { label: 'Secs', value: timeLeft.seconds },
                    ].map((unit, i) => (
                      <motion.div
                        key={unit.label}
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                      >
                        <motion.div
                          className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-2"
                          animate={{
                            backgroundColor: i === 3 ? 
                              ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)'] 
                              : 'rgba(255,255,255,0.1)',
                          }}
                          transition={{
                            duration: 1,
                            repeat: i === 3 ? Infinity : 0,
                          }}
                        >
                          <span className="text-3xl text-white">
                            {String(unit.value).padStart(2, '0')}
                          </span>
                        </motion.div>
                        <span className="text-white/60 text-xs uppercase tracking-wide">
                          {unit.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}

                <p className="text-center text-white/60 text-sm mt-6">
                  {countdown.date.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>

                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <Clock 
                    className="w-8 h-8 opacity-20"
                    style={{ color: countdown.color }}
                  />
                </motion.div>

                <motion.div
                  className="absolute -bottom-2 -left-2"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart 
                    className="w-6 h-6 opacity-20 fill-current"
                    style={{ color: countdown.color }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {countdowns.length === 0 && !isAdding && (
        <div className="text-center text-white/60 mt-12">
          <p className="text-xl mb-4">No countdowns yet</p>
          <p>Click "Add Countdown" to create your first one!</p>
        </div>
      )}
    </div>
  );
}
