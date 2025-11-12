import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Heart, X, Sparkles, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { BackButton } from './BackButton';
import { dailyMessageService, DailyMessage } from '../lib/database-supabase';

const moodOptions = [
  { value: 'cheerful', label: 'Cheerful', color: '#A9E0FF' },
  { value: 'loving', label: 'Loving', color: '#FFC8E2' },
  { value: 'encouraging', label: 'Encouraging', color: '#C7AFFF' },
  { value: 'excited', label: 'Excited', color: '#FFE5A9' },
  { value: 'supportive', label: 'Supportive', color: '#B5E7A0' },
  { value: 'proud', label: 'Proud', color: '#FFAFCC' },
  { value: 'grateful', label: 'Grateful', color: '#D4A5FF' },
];

const moodColors: Record<string, string> = {
  cheerful: '#A9E0FF',
  loving: '#FFC8E2',
  encouraging: '#C7AFFF',
  excited: '#FFE5A9',
  supportive: '#B5E7A0',
  proud: '#FFAFCC',
  grateful: '#D4A5FF',
};

export function DailyMessages({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Record<string, DailyMessage>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    date: '',
    message: '',
    mood: moodOptions[0].value,
  });

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await dailyMessageService.getAll();
      const messagesMap: Record<string, DailyMessage> = {};
      data.forEach(msg => {
        if (msg.date) {
          messagesMap[msg.date] = msg;
        }
      });
      setMessages(messagesMap);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (messages[dateStr]) {
      setSelectedDate(dateStr);
      
      // Create sparkles
      const newSparkles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
      }));
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 1000);
    } else {
      // If no message, allow adding one
      setFormData({
        date: dateStr,
        message: '',
        mood: moodOptions[0].value,
      });
      setIsAdding(true);
    }
  };

  const handleAdd = async () => {
    if (!formData.date || !formData.message.trim()) {
      alert('Please fill in date and message');
      return;
    }

    try {
      await dailyMessageService.create({
        date: formData.date,
        message: formData.message,
        mood: formData.mood,
      });
      setIsAdding(false);
      setFormData({ date: '', message: '', mood: moodOptions[0].value });
      await loadMessages();
    } catch (error) {
      console.error('Error adding message:', error);
      alert('Failed to add message. Please try again.');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.message.trim()) {
      alert('Please fill in message');
      return;
    }

    try {
      await dailyMessageService.update(id, {
        message: formData.message,
        mood: formData.mood,
      });
      setEditingId(null);
      setFormData({ date: '', message: '', mood: moodOptions[0].value });
      await loadMessages();
      setSelectedDate(null);
    } catch (error) {
      console.error('Error updating message:', error);
      alert('Failed to update message. Please try again.');
    }
  };

  const handleDelete = async (id: string, date: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await dailyMessageService.delete(id);
      await loadMessages();
      if (selectedDate === date) {
        setSelectedDate(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    }
  };

  const startEdit = (message: DailyMessage) => {
    setEditingId(message.id || null);
    setFormData({
      date: message.date,
      message: message.message,
      mood: message.mood,
    });
    setIsAdding(false);
  };

  const selectedMessage = selectedDate ? messages[selectedDate] : null;

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const changeMonth = (direction: number) => {
    setCurrentMonth(new Date(year, month + direction, 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pt-24">
      <BackButton onBack={onBack} />
      
      {/* Background gradient that shifts */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 20% 30%, rgba(199, 175, 255, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 70%, rgba(255, 200, 226, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 30%, rgba(199, 175, 255, 0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      
      <motion.h2
        className="text-5xl font-['Pacifico'] text-center text-transparent bg-clip-text bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] mb-8 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Daily Messages
      </motion.h2>

      <motion.p
        className="text-white/60 text-center mb-8 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        A little love note for every day 💌
      </motion.p>

      {/* Add Button */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-end relative z-10">
        <motion.button
          onClick={() => {
            setIsAdding(true);
            const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            setFormData({ date: todayStr, message: '', mood: moodOptions[0].value });
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] text-white rounded-full hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Add Message
        </motion.button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto mb-8 p-6 rounded-3xl bg-white/10 backdrop-blur-xl border-2 border-white/20 relative z-10"
          >
            <h3 className="text-2xl font-['Pacifico'] text-white mb-4">
              {editingId ? 'Edit Message' : 'Add New Message'}
            </h3>
            
            <div className="space-y-4">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={!!editingId}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-[#C7AFFF] disabled:opacity-50"
              />
              <textarea
                placeholder="Your message..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <div>
                <label className="block text-white/80 mb-2 text-sm">Mood</label>
                <div className="flex gap-2 flex-wrap">
                  {moodOptions.map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => setFormData({ ...formData, mood: mood.value })}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        formData.mood === mood.value 
                          ? 'ring-2 ring-white scale-105' 
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                      style={{
                        backgroundColor: formData.mood === mood.value ? mood.color : undefined,
                        color: formData.mood === mood.value ? 'white' : 'white',
                      }}
                    >
                      {mood.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#C7AFFF] text-white rounded-lg hover:bg-[#B89FFF] transition-colors"
              >
                {editingId ? 'Update' : 'Add'} Message
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({ date: '', message: '', mood: moodOptions[0].value });
                }}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar */}
      <div className="max-w-4xl mx-auto mb-12 relative z-10">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h3 className="text-2xl font-['Pacifico'] text-[#C7AFFF] text-center">
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-white/60 text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells before month starts */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasMessage = !!messages[dateStr];
              const isSelected = selectedDate === dateStr;
              const isToday = isCurrentMonth && day === today.getDate();

              return (
                <motion.button
                  key={day}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all group ${
                    hasMessage ? 'cursor-pointer' : 'cursor-pointer'
                  }`}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, #C7AFFF, #FFC8E2)'
                      : hasMessage
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.02)',
                  }}
                  onClick={() => handleDateClick(day)}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <span className={`text-lg ${isSelected ? 'text-white' : 'text-white/80'}`}>
                    {day}
                  </span>

                  {/* Today indicator */}
                  {isToday && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFC8E2]"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [1, 0.7, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Heart indicator for messages */}
                  {hasMessage && !isSelected && (
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                    >
                      <Heart 
                        className="w-3 h-3 mt-1" 
                        style={{ 
                          color: moodColors[messages[dateStr].mood],
                          fill: moodColors[messages[dateStr].mood],
                        }} 
                      />
                    </motion.div>
                  )}

                  {/* Edit/Delete buttons on hover */}
                  {hasMessage && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-xl">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(messages[dateStr]);
                        }}
                        className="p-1.5 bg-[#C7AFFF] rounded-full hover:bg-[#B89FFF] transition-colors"
                      >
                        <Edit className="w-3 h-3 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(messages[dateStr].id!, dateStr);
                        }}
                        className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Message Display */}
      <div className="max-w-2xl mx-auto min-h-[200px] relative z-10">
        <AnimatePresence mode="wait">
          {selectedMessage && (
            <motion.div
              key={selectedDate}
              className="relative"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="relative p-8 rounded-3xl backdrop-blur-xl border-2 shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${moodColors[selectedMessage.mood]}40, ${moodColors[selectedMessage.mood]}20)`,
                  borderColor: moodColors[selectedMessage.mood],
                }}
              >
                <motion.div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: moodColors[selectedMessage.mood] }}
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 2, repeat: Infinity },
                  }}
                >
                  <CalendarIcon className="w-6 h-6 text-white" />
                </motion.div>

                <p className="text-white/80 text-sm text-center mb-4 mt-4">
                  {new Date(selectedMessage.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>

                <p className="text-white text-xl text-center leading-relaxed">
                  {selectedMessage.message}
                </p>

                {/* Floating hearts around message */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${20 + i * 20}%`,
                      top: i % 2 === 0 ? '10%' : '90%',
                    }}
                    animate={{
                      y: [0, -15, 0],
                      rotate: [0, 10, -10, 0],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  >
                    <Heart 
                      className="w-4 h-4"
                      style={{ 
                        color: moodColors[selectedMessage.mood],
                        fill: moodColors[selectedMessage.mood],
                        opacity: 0.4,
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedMessage && !isAdding && (
          <motion.div
            className="text-center text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Click a day to add or view a message 💕</p>
          </motion.div>
        )}
      </div>

      {/* Sparkles */}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="fixed z-50 pointer-events-none"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
            }}
            initial={{ opacity: 1, scale: 0, rotate: 0 }}
            animate={{ 
              opacity: 0, 
              scale: 2,
              rotate: 360,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Sparkles className="w-6 h-6 text-[#FFC8E2]" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
