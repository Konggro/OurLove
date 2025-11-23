import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, X, Heart, Sparkles, Plus, Edit, Trash2, Upload } from 'lucide-react';
import { BackButton } from './BackButton';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { memoryService, Memory, imageService } from '../lib/database-supabase';
import { useAuth } from '../contexts/AuthContext';

export function MuseumOfUs({ onBack }: { onBack: () => void }) {
  const { currentUser } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    story: '',
    quote: '',
    image: '',
    x: 20,
    y: 20,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      setLoading(true);
      const data = await memoryService.getAll();
      setMemories(data);
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.story) {
      alert('Please fill in title and story');
      return;
    }

    try {
      setUploading(true);
      let imageUrl = formData.image;

      // Upload image if a new file is selected
      if (imageFile) {
        imageUrl = await imageService.uploadImage(imageFile, 'memories');
      }

      await memoryService.create({
        ...formData,
        image: imageUrl,
        user_id: currentUser || undefined,
      });

      setIsAdding(false);
      setFormData({ title: '', date: '', story: '', quote: '', image: '', x: 20, y: 20 });
      setImageFile(null);
      setImagePreview('');
      await loadMemories();
    } catch (error) {
      console.error('Error adding memory:', error);
      alert('Failed to add memory. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.title || !formData.story) {
      alert('Please fill in title and story');
      return;
    }

    try {
      setUploading(true);
      let imageUrl = formData.image;

      // Upload new image if selected
      if (imageFile) {
        // Delete old image if it was uploaded
        if (formData.image && formData.image.startsWith('https://firebasestorage.googleapis.com')) {
          try {
            await imageService.deleteImage(formData.image);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
        imageUrl = await imageService.uploadImage(imageFile, 'memories');
      }

      await memoryService.update(id, {
        ...formData,
        image: imageUrl,
      });

      setEditingId(null);
      setFormData({ title: '', date: '', story: '', quote: '', image: '', x: 20, y: 20 });
      setImageFile(null);
      setImagePreview('');
      await loadMemories();
    } catch (error) {
      console.error('Error updating memory:', error);
      alert('Failed to update memory. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;

    try {
      await memoryService.delete(id);
      await loadMemories();
      if (selectedMemory?.id === id) {
        setSelectedMemory(null);
      }
    } catch (error) {
      console.error('Error deleting memory:', error);
      alert('Failed to delete memory. Please try again.');
    }
  };

  const startEdit = (memory: Memory) => {
    setEditingId(memory.id || null);
    setFormData({
      title: memory.title,
      date: memory.date,
      story: memory.story,
      quote: memory.quote,
      image: memory.image,
      x: memory.x,
      y: memory.y,
    });
    setImagePreview(memory.image);
    setImageFile(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading memories...</div>
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
        Museum of Us
      </motion.h2>

      <motion.p
        className="text-white/60 text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        A curated collection of our most precious moments 🖼️✨
      </motion.p>

      {/* Add Button */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-end">
        <motion.button
          onClick={() => {
            setIsAdding(true);
            setFormData({ title: '', date: '', story: '', quote: '', image: '', x: 20, y: 20 });
            setImageFile(null);
            setImagePreview('');
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] text-white rounded-full hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Add Memory
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
              {editingId ? 'Edit Memory' : 'Add New Memory'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Memory Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <input
                type="text"
                placeholder="Date (e.g., January 2023)"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <textarea
                placeholder="Your story..."
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                rows={3}
                className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF] md:col-span-2"
              />
              <textarea
                placeholder="A quote or special message..."
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                rows={2}
                className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF] md:col-span-2"
              />
              
              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-white/80 mb-2">Photo</label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-white/30 rounded-lg p-4 text-center hover:border-[#C7AFFF] transition-colors">
                      <Upload className="w-6 h-6 text-white/60 mx-auto mb-2" />
                      <span className="text-white/60 text-sm">
                        {imageFile ? 'Change Photo' : 'Upload Photo'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-white/30">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Position */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2">X Position (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.x}
                    onChange={(e) => setFormData({ ...formData, x: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Y Position (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.y}
                    onChange={(e) => setFormData({ ...formData, y: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#C7AFFF] text-white rounded-lg hover:bg-[#B89FFF] transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : editingId ? 'Update' : 'Add'} Memory
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({ title: '', date: '', story: '', quote: '', image: '', x: 20, y: 20 });
                  setImageFile(null);
                  setImagePreview('');
                }}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Space */}
      <div 
        className="relative max-w-6xl mx-auto h-[600px] rounded-3xl bg-gradient-to-br from-[#1E1B3E]/50 to-[#2D2654]/50 backdrop-blur-sm border border-white/10 overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Spotlight Effect */}
        <motion.div
          className="absolute w-64 h-64 rounded-full pointer-events-none"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          }}
        />

        {/* Floating Frames */}
        {memories.map((memory, index) => (
          <motion.div
            key={memory.id}
            className="absolute cursor-pointer group"
            style={{
              left: `${memory.x}%`,
              top: `${memory.y}%`,
            }}
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotate: 0,
            }}
            transition={{
              delay: index * 0.2,
              type: 'spring',
              stiffness: 100,
            }}
            whileHover={{
              scale: 1.1,
              zIndex: 10,
              rotate: 0,
            }}
            onClick={() => setSelectedMemory(memory)}
          >
            <div className="relative">
              <motion.div
                className="relative w-48 bg-white p-3 shadow-2xl rounded-lg"
                animate={{
                  y: [0, -10, 0],
                  rotate: [(index % 2 === 0 ? 5 : -5), 0, (index % 2 === 0 ? 5 : -5)],
                }}
                transition={{
                  y: { duration: 3, repeat: Infinity, delay: index * 0.5 },
                  rotate: { duration: 4, repeat: Infinity, delay: index * 0.3 },
                }}
              >
                {/* Edit/Delete Buttons */}
                <div className="absolute -top-2 -right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(memory);
                    }}
                    className="p-1.5 bg-[#C7AFFF] rounded-full hover:bg-[#B89FFF] transition-colors"
                  >
                    <Edit className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(memory.id!);
                    }}
                    className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>

                <div className="relative w-full aspect-square bg-gray-200 rounded overflow-hidden mb-2">
                  <ImageWithFallback
                    src={memory.image}
                    alt={memory.title}
                    className="w-full h-full object-cover"
                  />
                  
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 text-white mx-auto mb-2" />
                      <p className="text-white text-sm">View Memory</p>
                    </div>
                  </motion.div>
                </div>

                <p className="text-gray-900 text-sm text-center">{memory.title}</p>
                <p className="text-gray-500 text-xs text-center">{memory.date}</p>

                <motion.div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    boxShadow: '0 0 30px rgba(199, 175, 255, 0.6)',
                  }}
                />
              </motion.div>

              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-white/20" />
            </div>
          </motion.div>
        ))}

        {/* Ambient Sparkles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0, 1.5, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          >
            <Sparkles className="w-3 h-3 text-[#FFC8E2]" />
          </motion.div>
        ))}
      </div>

      {/* Memory Detail Modal */}
      <AnimatePresence>
        {selectedMemory && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-lg z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMemory(null)}
            />
            
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl mx-4"
              initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotateY: 180 }}
              transition={{ type: 'spring', duration: 0.7 }}
            >
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
                <button
                  onClick={() => setSelectedMemory(null)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <div className="grid md:grid-cols-2">
                  <div className="relative aspect-square">
                    <ImageWithFallback
                      src={selectedMemory.image}
                      alt={selectedMemory.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>

                  <div className="p-8 flex flex-col justify-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="text-4xl font-['Pacifico'] text-[#C7AFFF] mb-3">
                        {selectedMemory.title}
                      </h3>
                      <p className="text-gray-500 mb-6">{selectedMemory.date}</p>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        {selectedMemory.story}
                      </p>
                      <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#FFC8E2]/20 to-[#C7AFFF]/20 border border-[#C7AFFF]/30">
                        <Heart className="absolute -top-3 -left-3 w-6 h-6 fill-[#FFC8E2] text-[#FFC8E2]" />
                        <p className="text-gray-700 italic text-center">
                          "{selectedMemory.quote}"
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="absolute bottom-8 right-8"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Sparkles className="w-8 h-8 text-[#C7AFFF] opacity-30" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {memories.length === 0 && !isAdding && (
        <div className="text-center text-white/60 mt-12">
          <p className="text-xl mb-4">No memories yet</p>
          <p>Click "Add Memory" to create your first one!</p>
        </div>
      )}
    </div>
  );
}
