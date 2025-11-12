import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Heart, Plus, Edit, Trash2, X, Upload, Check } from 'lucide-react';
import { BackButton } from './BackButton';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { locationService, Location, imageService } from '../lib/database-supabase';

export function AdventureMap({ onBack }: { onBack: () => void }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [showVisited, setShowVisited] = useState(true);
  const [showDream, setShowDream] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    visited: false,
    x: 50,
    y: 50,
    image: '',
    memory: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await locationService.getAll();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
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

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setFormData({ ...formData, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) });
    setIsPlacing(false);
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.country || !formData.memory) {
      alert('Please fill in name, country, and memory');
      return;
    }

    try {
      setUploading(true);
      let imageUrl = formData.image;

      if (imageFile) {
        imageUrl = await imageService.uploadImage(imageFile, 'locations');
      }

      await locationService.create({
        ...formData,
        image: imageUrl,
      });

      setIsAdding(false);
      resetForm();
      await loadLocations();
    } catch (error) {
      console.error('Error adding location:', error);
      alert('Failed to add location. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name || !formData.country || !formData.memory) {
      alert('Please fill in name, country, and memory');
      return;
    }

    try {
      setUploading(true);
      let imageUrl = formData.image;

      if (imageFile) {
        if (formData.image && formData.image.includes('supabase.co')) {
          try {
            await imageService.deleteImage(formData.image);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
        imageUrl = await imageService.uploadImage(imageFile, 'locations');
      }

      await locationService.update(id, {
        ...formData,
        image: imageUrl,
      });

      setEditingId(null);
      resetForm();
      await loadLocations();
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Failed to update location. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      await locationService.delete(id);
      await loadLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Failed to delete location. Please try again.');
    }
  };

  const toggleVisited = async (id: string, currentVisited: boolean) => {
    try {
      await locationService.toggleVisited(id, !currentVisited);
      await loadLocations();
    } catch (error) {
      console.error('Error toggling visited status:', error);
    }
  };

  const startEdit = (location: Location) => {
    setEditingId(location.id || null);
    setFormData({
      name: location.name,
      country: location.country,
      visited: location.visited,
      x: location.x,
      y: location.y,
      image: location.image,
      memory: location.memory,
    });
    setImagePreview(location.image);
    setImageFile(null);
    setIsAdding(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      visited: false,
      x: 50,
      y: 50,
      image: '',
      memory: '',
    });
    setImageFile(null);
    setImagePreview('');
    setIsPlacing(false);
  };

  const filteredLocations = locations.filter(loc => 
    (showVisited && loc.visited) || (showDream && !loc.visited)
  );

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading locations...</div>
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
        Our Adventure Map
      </motion.h2>

      {/* Add Button */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-end">
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
          Add Location
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
              {editingId ? 'Edit Location' : 'Add New Location'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Location Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <input
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <textarea
                placeholder="Memory or description..."
                value={formData.memory}
                onChange={(e) => setFormData({ ...formData, memory: e.target.value })}
                rows={3}
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
                <div className="md:col-span-2">
                  <button
                    onClick={() => setIsPlacing(!isPlacing)}
                    className={`w-full px-4 py-2 rounded-lg transition-colors ${
                      isPlacing
                        ? 'bg-[#C7AFFF] text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {isPlacing ? 'Click on map to place pin' : 'Click to Place on Map'}
                  </button>
                </div>
              </div>

              {/* Visited Toggle */}
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="visited"
                  checked={formData.visited}
                  onChange={(e) => setFormData({ ...formData, visited: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="visited" className="text-white/80">Mark as visited</label>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#C7AFFF] text-white rounded-lg hover:bg-[#B89FFF] transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : editingId ? 'Update' : 'Add'} Location
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

      {/* Toggle Filters */}
      <div className="flex justify-center gap-4 mb-12">
        <motion.button
          className={`px-6 py-2 rounded-full backdrop-blur-sm border transition-all ${
            showVisited 
              ? 'bg-[#C7AFFF]/30 border-[#C7AFFF] text-[#C7AFFF]' 
              : 'bg-white/5 border-white/10 text-white/40'
          }`}
          onClick={() => setShowVisited(!showVisited)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ✓ Visited
        </motion.button>
        <motion.button
          className={`px-6 py-2 rounded-full backdrop-blur-sm border transition-all ${
            showDream 
              ? 'bg-[#FFC8E2]/30 border-[#FFC8E2] text-[#FFC8E2]' 
              : 'bg-white/5 border-white/10 text-white/40'
          }`}
          onClick={() => setShowDream(!showDream)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ✨ Dream Destinations
        </motion.button>
      </div>

      {/* Map Container */}
      <div className="relative max-w-5xl mx-auto">
        {/* World Map Background */}
        <div 
          className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl"
          onClick={isPlacing ? handleMapClick : undefined}
          style={{ cursor: isPlacing ? 'crosshair' : 'default' }}
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1642009071428-119813340e22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMG1hcCUyMHRyYXZlbHxlbnwxfHx8fDE3NjI5NDU1MDR8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="World Map"
            className="w-full h-full object-cover opacity-40"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E1B3E]/50 to-[#2D2654]/50" />

          {/* Placement Indicator */}
          {isPlacing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border-2 border-white/40">
                <p className="text-white text-sm">Click on the map to place your location</p>
              </div>
            </div>
          )}

          {/* Location Pins */}
          {filteredLocations.map((location, index) => {
            if (!location.id) return null;

            return (
              <motion.div
                key={location.id}
                className="absolute group"
                style={{
                  left: `${location.x}%`,
                  top: `${location.y}%`,
                  transform: 'translate(-50%, -100%)',
                }}
                initial={{ opacity: 0, scale: 0, y: -50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                onMouseEnter={() => setHoveredLocation(location)}
                onMouseLeave={() => setHoveredLocation(null)}
              >
                {/* Edit/Delete Buttons */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(location)}
                    className="p-2 bg-[#C7AFFF] rounded-full hover:bg-[#B89FFF] transition-colors backdrop-blur-sm"
                  >
                    <Edit className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={() => toggleVisited(location.id!, location.visited)}
                    className="p-2 bg-[#FFC8E2] rounded-full hover:bg-[#FFB8D2] transition-colors backdrop-blur-sm"
                    title={location.visited ? 'Mark as dream' : 'Mark as visited'}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(location.id!)}
                    className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors backdrop-blur-sm"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>

                {/* Pin */}
                <motion.div
                  className="relative cursor-pointer"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        `0 0 20px ${location.visited ? '#C7AFFF' : '#FFC8E2'}`,
                        `0 0 40px ${location.visited ? '#C7AFFF' : '#FFC8E2'}`,
                        `0 0 20px ${location.visited ? '#C7AFFF' : '#FFC8E2'}`,
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative"
                  >
                    <MapPin 
                      className="w-8 h-8"
                      style={{ 
                        color: location.visited ? '#C7AFFF' : '#FFC8E2',
                        fill: location.visited ? '#C7AFFF' : '#FFC8E2',
                      }} 
                    />
                    {location.visited && (
                      <Heart className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 fill-white text-white" />
                    )}
                  </motion.div>
                </motion.div>

                {/* Popup Card */}
                {hoveredLocation?.id === location.id && (
                  <motion.div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 pointer-events-none z-10"
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  >
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                      <div className="relative h-32">
                        <ImageWithFallback
                          src={location.image}
                          alt={location.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg text-gray-900 mb-1">
                          {location.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">{location.country}</p>
                        <p className="text-sm text-gray-600">{location.memory}</p>
                        <div className="mt-3">
                          {location.visited ? (
                            <span className="inline-block px-3 py-1 rounded-full bg-[#C7AFFF]/20 text-[#C7AFFF] text-xs">
                              ✓ Visited
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 rounded-full bg-[#FFC8E2]/20 text-[#FFC8E2] text-xs">
                              ✨ Dream
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <div 
                      className="absolute top-full left-1/2 -translate-x-1/2 -mt-2"
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '10px solid transparent',
                        borderRight: '10px solid transparent',
                        borderTop: '10px solid white',
                      }}
                    />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {locations.length === 0 && !isAdding && (
        <div className="text-center text-white/60 mt-12">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl mb-4">No locations yet</p>
          <p>Click "Add Location" to start mapping your adventures!</p>
        </div>
      )}
    </div>
  );
}
