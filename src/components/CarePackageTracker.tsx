import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Heart, X, Plus, Edit, Trash2 } from 'lucide-react';
import { BackButton } from './BackButton';
import { carePackageService, CarePackage } from '../lib/database-supabase';

const colors = ['#C7AFFF', '#FFC8E2', '#A9E0FF', '#FFE5A9', '#B5E7A0', '#FFAFCC', '#D4A5FF'];

export function CarePackageTracker({ onBack }: { onBack: () => void }) {
  const [packages, setPackages] = useState<CarePackage[]>([]);
  const [openPackage, setOpenPackage] = useState<CarePackage | null>(null);
  const [openingAnimation, setOpeningAnimation] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    status: 'planned' as 'sent' | 'received' | 'planned',
    items: [''] as string[],
    note: '',
    color: colors[0],
  });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await carePackageService.getAll();
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.date) {
      alert('Please fill in title and date');
      return;
    }

    const validItems = formData.items.filter(item => item.trim());
    if (validItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    try {
      await carePackageService.create({
        ...formData,
        items: validItems,
      });
      setIsAdding(false);
      resetForm();
      await loadPackages();
    } catch (error) {
      console.error('Error adding package:', error);
      alert('Failed to add package. Please try again.');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.title || !formData.date) {
      alert('Please fill in title and date');
      return;
    }

    const validItems = formData.items.filter(item => item.trim());
    if (validItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    try {
      await carePackageService.update(id, {
        ...formData,
        items: validItems,
      });
      setEditingId(null);
      resetForm();
      await loadPackages();
      if (openPackage?.id === id) {
        setOpenPackage(null);
      }
    } catch (error) {
      console.error('Error updating package:', error);
      alert('Failed to update package. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this care package?')) return;

    try {
      await carePackageService.delete(id);
      await loadPackages();
      if (openPackage?.id === id) {
        setOpenPackage(null);
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package. Please try again.');
    }
  };

  const startEdit = (pkg: CarePackage) => {
    setEditingId(pkg.id || null);
    setFormData({
      title: pkg.title,
      date: pkg.date,
      status: pkg.status,
      items: pkg.items.length > 0 ? pkg.items : [''],
      note: pkg.note,
      color: pkg.color,
    });
    setIsAdding(false);
    setOpenPackage(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      status: 'planned',
      items: [''],
      note: '',
      color: colors[0],
    });
  };

  const addItemField = () => {
    setFormData({
      ...formData,
      items: [...formData.items, ''],
    });
  };

  const removeItemField = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleOpenPackage = (pkg: CarePackage) => {
    if (pkg.status === 'planned') return;
    
    setOpeningAnimation(true);
    setTimeout(() => {
      setOpenPackage(pkg);
      setOpeningAnimation(false);
    }, 800);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading packages...</div>
      </div>
    );
  }

  const sentPackages = packages.filter(p => p.status !== 'planned').length;

  return (
    <div className="min-h-screen p-8 pt-24">
      <BackButton onBack={onBack} />
      
      <motion.h2
        className="text-5xl font-['Pacifico'] text-center text-transparent bg-clip-text bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2] mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Care Package Tracker
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
          Add Package
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
              {editingId ? 'Edit Package' : 'Add New Package'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Package Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
                />
                <input
                  type="text"
                  placeholder="Date (e.g., March 15, 2024)"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
                />
              </div>
              
              <div>
                <label className="block text-white/80 mb-2 text-sm">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'sent' | 'received' | 'planned' })}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
                >
                  <option value="planned" className="bg-[#1E1B3E] text-white">Planned</option>
                  <option value="sent" className="bg-[#1E1B3E] text-white">Sent</option>
                  <option value="received" className="bg-[#1E1B3E] text-white">Received</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">Items</label>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Item ${index + 1}`}
                        value={item}
                        onChange={(e) => updateItem(index, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF] text-sm"
                      />
                      {formData.items.length > 1 && (
                        <button
                          onClick={() => removeItemField(index)}
                          className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addItemField}
                    className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                  >
                    + Add Item
                  </button>
                </div>
              </div>

              <textarea
                placeholder="Note (optional)"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />

              <div>
                <label className="block text-white/80 mb-2 text-sm">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        formData.color === color ? 'border-white scale-110 ring-2 ring-white/50' : 'border-white/30 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
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
                {editingId ? 'Update' : 'Add'} Package
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
        All the love I've sent your way 📦💕
      </motion.p>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto mb-12">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/80 text-sm">Packages Sent</span>
          <span className="text-[#FFC8E2]">
            {sentPackages} / {packages.length}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#C7AFFF] to-[#FFC8E2]"
            initial={{ width: 0 }}
            animate={{ 
              width: packages.length > 0 ? `${(sentPackages / packages.length) * 100}%` : '0%'
            }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>

      {/* Package Boxes */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg, index) => {
          if (!pkg.id) return null;

          return (
            <motion.div
              key={pkg.id}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Edit/Delete Buttons */}
              <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(pkg)}
                  className="p-2 bg-[#C7AFFF] rounded-full hover:bg-[#B89FFF] transition-colors backdrop-blur-sm"
                >
                  <Edit className="w-3 h-3 text-white" />
                </button>
                <button
                  onClick={() => handleDelete(pkg.id!)}
                  className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors backdrop-blur-sm"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>

              <motion.button
                className="relative w-full"
                onClick={() => handleOpenPackage(pkg)}
                disabled={pkg.status === 'planned'}
                whileHover={pkg.status !== 'planned' ? { y: -10 } : {}}
              >
                <motion.div
                  className={`relative aspect-square rounded-2xl shadow-xl overflow-hidden ${
                    pkg.status === 'planned' ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${pkg.color}80, ${pkg.color}40)`,
                    opacity: pkg.status === 'planned' ? 0.5 : 1,
                  }}
                  animate={pkg.status !== 'planned' ? {
                    y: [0, -5, 0],
                  } : {}}
                  transition={{
                    y: { duration: 2, repeat: Infinity, delay: index * 0.3 },
                  }}
                  whileHover={pkg.status !== 'planned' ? {
                    boxShadow: `0 20px 40px ${pkg.color}60`,
                  } : {}}
                >
                  {/* Box Design */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-24 h-24 text-white/30" />
                  </div>

                  {/* Ribbon */}
                  <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full"
                    style={{ backgroundColor: pkg.color }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-0.5"
                    style={{ backgroundColor: pkg.color }}
                  />

                  {/* Bow */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: pkg.color }}
                    whileHover={pkg.status !== 'planned' ? { 
                      scale: 1.2,
                      rotate: 360,
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Heart className="w-6 h-6 fill-white text-white" />
                  </motion.div>

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                    <p className="text-white text-sm mb-1">{pkg.title}</p>
                    <p className="text-white/60 text-xs">{pkg.date}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {pkg.status === 'received' && (
                      <div className="px-2 py-1 rounded-full bg-green-500/80 text-white text-xs">
                        ✓ Received
                      </div>
                    )}
                    {pkg.status === 'sent' && (
                      <div className="px-2 py-1 rounded-full bg-blue-500/80 text-white text-xs">
                        📬 Sent
                      </div>
                    )}
                    {pkg.status === 'planned' && (
                      <div className="px-2 py-1 rounded-full bg-gray-500/80 text-white text-xs">
                        📅 Planned
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Opening Animation Overlay */}
      <AnimatePresence>
        {openingAnimation && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.5, 0] }}
              transition={{ duration: 0.8 }}
            >
              <Package className="w-32 h-32 text-[#FFC8E2]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Package Contents Modal */}
      <AnimatePresence>
        {openPackage && !openingAnimation && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenPackage(null)}
            />
            
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
              initial={{ opacity: 0, scale: 0.5, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 100 }}
            >
              <div 
                className="relative rounded-3xl p-8 shadow-2xl backdrop-blur-xl border-2"
                style={{
                  background: `linear-gradient(135deg, ${openPackage.color}40, ${openPackage.color}20)`,
                  borderColor: openPackage.color,
                }}
              >
                <button
                  onClick={() => setOpenPackage(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <h3 
                  className="text-3xl font-['Pacifico'] text-center mb-2"
                  style={{ color: openPackage.color }}
                >
                  {openPackage.title}
                </h3>
                <p className="text-white/60 text-center text-sm mb-6">
                  {openPackage.date}
                </p>

                <div className="mb-6">
                  <h4 className="text-white mb-3">📦 Inside:</h4>
                  <div className="space-y-2">
                    {openPackage.items.map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: openPackage.color }} />
                        <span className="text-white">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {openPackage.note && (
                  <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <p className="text-white/80 italic text-center">
                      "{openPackage.note}"
                    </p>
                  </div>
                )}

                {/* Floating Hearts */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${30 + i * 20}%`,
                      top: '10%',
                    }}
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  >
                    <Heart 
                      className="w-4 h-4 fill-white/20 text-white/20"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {packages.length === 0 && !isAdding && (
        <div className="text-center text-white/60 mt-12">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl mb-4">No packages yet</p>
          <p>Click "Add Package" to start tracking your care packages!</p>
        </div>
      )}
    </div>
  );
}
