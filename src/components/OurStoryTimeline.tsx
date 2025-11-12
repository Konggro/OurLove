import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Edit, Trash2, Upload } from 'lucide-react';
import { BackButton } from './BackButton';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { milestoneService, Milestone, imageService } from '../lib/database-supabase';

export function OurStoryTimeline({ onBack }: { onBack: () => void }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    title: '',
    description: '',
    image: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      const data = await milestoneService.getAll();
      setMilestones(data);
    } catch (error) {
      console.error('Error loading milestones:', error);
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
    if (!formData.title || !formData.description) {
      alert('Please fill in title and description');
      return;
    }

    try {
      setUploading(true);
      let imageUrl = formData.image;

      if (imageFile) {
        imageUrl = await imageService.uploadImage(imageFile, 'milestones');
      }

      await milestoneService.create({
        ...formData,
        image: imageUrl,
      });

      setIsAdding(false);
      setFormData({ date: '', title: '', description: '', image: '' });
      setImageFile(null);
      setImagePreview('');
      await loadMilestones();
    } catch (error) {
      console.error('Error adding milestone:', error);
      alert('Failed to add milestone. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.title || !formData.description) {
      alert('Please fill in title and description');
      return;
    }

    try {
      setUploading(true);
      let imageUrl = formData.image;

      if (imageFile) {
        if (formData.image && formData.image.startsWith('https://firebasestorage.googleapis.com')) {
          try {
            await imageService.deleteImage(formData.image);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
        imageUrl = await imageService.uploadImage(imageFile, 'milestones');
      }

      await milestoneService.update(id, {
        ...formData,
        image: imageUrl,
      });

      setEditingId(null);
      setFormData({ date: '', title: '', description: '', image: '' });
      setImageFile(null);
      setImagePreview('');
      await loadMilestones();
    } catch (error) {
      console.error('Error updating milestone:', error);
      alert('Failed to update milestone. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;

    try {
      await milestoneService.delete(id);
      await loadMilestones();
      if (selectedMilestone?.id === id) {
        setSelectedMilestone(null);
      }
    } catch (error) {
      console.error('Error deleting milestone:', error);
      alert('Failed to delete milestone. Please try again.');
    }
  };

  const startEdit = (milestone: Milestone) => {
    setEditingId(milestone.id || null);
    setFormData({
      date: milestone.date,
      title: milestone.title,
      description: milestone.description,
      image: milestone.image,
    });
    setImagePreview(milestone.image);
    setImageFile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading timeline...</div>
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
        Our Story Timeline
      </motion.h2>

      {/* Add Button */}
      <div className="mb-8 flex justify-end px-8">
        <motion.button
          onClick={() => {
            setIsAdding(true);
            setFormData({ date: '', title: '', description: '', image: '' });
            setImageFile(null);
            setImagePreview('');
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] text-white rounded-full hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Add Milestone
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
              {editingId ? 'Edit Milestone' : 'Add New Milestone'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Date (e.g., January 2023)"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
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
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#C7AFFF] text-white rounded-lg hover:bg-[#B89FFF] transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : editingId ? 'Update' : 'Add'} Milestone
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({ date: '', title: '', description: '', image: '' });
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

      <div className="relative overflow-x-auto pb-8">
        <div className="flex gap-8 px-8 min-w-max">
          {/* Star Trail Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C7AFFF] to-transparent" />
          
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              className="relative flex flex-col items-center group"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              {/* Star on Timeline */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FFC8E2] shadow-lg"
                animate={{
                  boxShadow: [
                    '0 0 10px #FFC8E2',
                    '0 0 20px #FFC8E2',
                    '0 0 10px #FFC8E2',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Edit/Delete Buttons */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(milestone)}
                  className="p-2 bg-[#C7AFFF] rounded-full hover:bg-[#B89FFF] transition-colors"
                >
                  <Edit className="w-3 h-3 text-white" />
                </button>
                <button
                  onClick={() => handleDelete(milestone.id!)}
                  className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* Polaroid Card */}
              <motion.button
                className="relative bg-white p-3 shadow-2xl rounded-lg w-64 cursor-pointer"
                style={{ 
                  transform: `rotate(${(index % 2 === 0 ? 1 : -1) * 2}deg)`,
                  marginTop: '120px',
                }}
                whileHover={{ 
                  scale: 1.05, 
                  rotate: 0,
                  y: -10,
                  boxShadow: '0 20px 40px rgba(199, 175, 255, 0.4)',
                }}
                onClick={() => setSelectedMilestone(milestone)}
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  y: { duration: 3, repeat: Infinity, delay: index * 0.5 },
                }}
              >
                {milestone.image && (
                  <div className="relative w-full bg-gray-200 rounded mb-3 overflow-hidden flex items-center justify-center p-2">
                    <ImageWithFallback
                      src={milestone.image}
                      alt={milestone.title}
                      className="max-w-full max-h-[300px] w-auto h-auto object-contain rounded"
                      style={{ maxWidth: '100%' }}
                    />
                  </div>
                )}
                <p className="text-sm text-gray-500 mb-1">{milestone.date}</p>
                <h3 className="text-lg text-gray-900">{milestone.title}</h3>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedMilestone && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMilestone(null)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl"
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
            >
              <button
                onClick={() => setSelectedMilestone(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              {selectedMilestone.image && (
                <div className="relative w-full bg-gray-200 rounded-lg mb-4 overflow-hidden flex items-center justify-center p-4">
                  <ImageWithFallback
                    src={selectedMilestone.image}
                    alt={selectedMilestone.title}
                    className="max-w-full max-h-[500px] w-auto h-auto object-contain rounded"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              )}
              
              <p className="text-sm text-[#C7AFFF] mb-2">{selectedMilestone.date}</p>
              <h3 className="text-3xl font-['Pacifico'] text-gray-900 mb-4">
                {selectedMilestone.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {selectedMilestone.description}
              </p>

              <div className="absolute -top-4 -right-4 w-16 h-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <svg viewBox="0 0 50 50" className="w-full h-full text-[#FFC8E2]">
                    <path
                      d="M25 10 L30 20 L40 22 L32 30 L34 40 L25 35 L16 40 L18 30 L10 22 L20 20 Z"
                      fill="currentColor"
                      opacity="0.3"
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {milestones.length === 0 && !isAdding && (
        <div className="text-center text-white/60 mt-12">
          <p className="text-xl mb-4">No milestones yet</p>
          <p>Click "Add Milestone" to create your first one!</p>
        </div>
      )}
    </div>
  );
}
