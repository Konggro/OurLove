import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Edit, Trash2, Upload } from 'lucide-react';
import { BackButton } from './BackButton';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { milestoneService, Milestone, imageService } from '../lib/database-supabase';
import { useAuth } from '../contexts/AuthContext';

export function OurStoryTimelineMobile({ onBack }: { onBack: () => void }) {
  const { currentUser } = useAuth();
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
        user_id: currentUser || undefined,
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
      <div className="min-h-screen p-4 pt-20 flex items-center justify-center">
        <div className="text-white text-lg">Loading timeline...</div>
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
        Our Story Timeline
      </motion.h2>

      {/* Add Button */}
      <div className="mb-6 flex justify-center">
        <motion.button
          onClick={() => {
            setIsAdding(true);
            setFormData({ date: '', title: '', description: '', image: '' });
            setImageFile(null);
            setImagePreview('');
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] text-white rounded-full hover:shadow-lg transition-shadow touch-manipulation"
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
            className="mb-6 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/20"
          >
            <h3 className="text-xl font-['Pacifico'] text-white mb-4">
              {editingId ? 'Edit Milestone' : 'Add New Milestone'}
            </h3>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Date (e.g., January 2023)"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              
              {/* Image Upload */}
              <div>
                <label className="block text-white/80 mb-2 text-sm">Photo</label>
                <label className="block cursor-pointer touch-manipulation">
                  <div className="border-2 border-dashed border-white/30 rounded-lg p-4 text-center hover:border-[#C7AFFF] transition-colors">
                    <Upload className="w-8 h-8 text-white/60 mx-auto mb-2" />
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
                  <div className="mt-3 w-full max-h-48 rounded-lg overflow-hidden border-2 border-white/30">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#C7AFFF] text-white rounded-lg hover:bg-[#B89FFF] transition-colors disabled:opacity-50 touch-manipulation"
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
                className="px-4 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vertical Timeline */}
      <div className="space-y-6">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Timeline Connector */}
            {index < milestones.length - 1 && (
              <div className="absolute left-6 top-16 w-0.5 h-full bg-gradient-to-b from-[#C7AFFF] to-transparent" />
            )}

            <div className="flex gap-4">
              {/* Timeline Dot */}
              <motion.div
                className="flex-shrink-0 w-12 h-12 rounded-full bg-[#FFC8E2] border-4 border-white/20 flex items-center justify-center shadow-lg"
                animate={{
                  boxShadow: [
                    '0 0 10px #FFC8E2',
                    '0 0 20px #FFC8E2',
                    '0 0 10px #FFC8E2',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>

              {/* Content Card */}
              <motion.div
                className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMilestone(milestone)}
              >
                {milestone.image && (
                  <div className="relative w-full h-48 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                    <ImageWithFallback
                      src={milestone.image}
                      alt={milestone.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="text-sm text-[#C7AFFF] mb-1">{milestone.date}</p>
                <h3 className="text-lg text-white font-semibold mb-2">{milestone.title}</h3>
                <p className="text-white/70 text-sm line-clamp-2">{milestone.description}</p>

                {/* Edit/Delete Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(milestone);
                    }}
                    className="flex-1 p-2 bg-[#C7AFFF] rounded-lg hover:bg-[#B89FFF] transition-colors touch-manipulation"
                  >
                    <Edit className="w-4 h-4 text-white mx-auto" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(milestone.id!);
                    }}
                    className="flex-1 p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors touch-manipulation"
                  >
                    <Trash2 className="w-4 h-4 text-white mx-auto" />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 max-w-sm w-[90vw] max-h-[80vh] overflow-y-auto shadow-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <button
                onClick={() => setSelectedMilestone(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
              
              {selectedMilestone.image && (
                <div className="relative w-full h-64 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  <ImageWithFallback
                    src={selectedMilestone.image}
                    alt={selectedMilestone.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <p className="text-sm text-[#C7AFFF] mb-2">{selectedMilestone.date}</p>
              <h3 className="text-2xl font-['Pacifico'] text-gray-900 mb-4">
                {selectedMilestone.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {selectedMilestone.description}
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {milestones.length === 0 && !isAdding && (
        <div className="text-center text-white/60 mt-12">
          <p className="text-lg mb-4">No milestones yet</p>
          <p className="text-sm">Click "Add Milestone" to create your first one!</p>
        </div>
      )}
    </div>
  );
}


