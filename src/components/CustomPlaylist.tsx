import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Play, Pause, X, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { BackButton } from './BackButton';
import { playlistService, Playlist, Song } from '../lib/database-supabase';

const colors = ['#C7AFFF', '#FFC8E2', '#A9E0FF', '#FFE5A9', '#B5E7A0', '#FFAFCC', '#D4A5FF'];

export function CustomPlaylist({ onBack }: { onBack: () => void }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    color: colors[0],
    songs: [{ title: '', artist: '', note: '', url: '' }] as Song[],
  });

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const data = await playlistService.getAll();
      setPlaylists(data);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a playlist title');
      return;
    }

    const validSongs = formData.songs.filter(s => s.title.trim() && s.artist.trim());
    if (validSongs.length === 0) {
      alert('Please add at least one song');
      return;
    }

    try {
      await playlistService.create({
        title: formData.title.trim(),
        color: formData.color,
        songs: validSongs,
      });
      setIsAdding(false);
      resetForm();
      await loadPlaylists();
    } catch (error) {
      console.error('Error adding playlist:', error);
      alert('Failed to add playlist. Please try again.');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.title.trim()) {
      alert('Please enter a playlist title');
      return;
    }

    const validSongs = formData.songs.filter(s => s.title.trim() && s.artist.trim());
    if (validSongs.length === 0) {
      alert('Please add at least one song');
      return;
    }

    try {
      await playlistService.update(id, {
        title: formData.title.trim(),
        color: formData.color,
        songs: validSongs,
      });
      setEditingId(null);
      resetForm();
      await loadPlaylists();
      if (selectedPlaylist?.id === id) {
        setSelectedPlaylist(null);
      }
    } catch (error) {
      console.error('Error updating playlist:', error);
      alert('Failed to update playlist. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await playlistService.delete(id);
      await loadPlaylists();
      if (selectedPlaylist?.id === id) {
        setSelectedPlaylist(null);
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      alert('Failed to delete playlist. Please try again.');
    }
  };

  const startEdit = (playlist: Playlist) => {
    setEditingId(playlist.id || null);
    setFormData({
      title: playlist.title,
      color: playlist.color,
      songs: playlist.songs.length > 0 ? playlist.songs.map(s => ({ ...s, url: s.url || '' })) : [{ title: '', artist: '', note: '', url: '' }],
    });
    setIsAdding(false);
    setSelectedPlaylist(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      color: colors[0],
      songs: [{ title: '', artist: '', note: '', url: '' }],
    });
  };

  const addSongField = () => {
    setFormData({
      ...formData,
      songs: [...formData.songs, { title: '', artist: '', note: '', url: '' }],
    });
  };

  const removeSongField = (index: number) => {
    setFormData({
      ...formData,
      songs: formData.songs.filter((_, i) => i !== index),
    });
  };

  const updateSong = (index: number, field: keyof Song, value: string) => {
    const newSongs = [...formData.songs];
    newSongs[index] = { ...newSongs[index], [field]: value };
    setFormData({ ...formData, songs: newSongs });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading playlists...</div>
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
        Our Playlists
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
          Create Playlist
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
              {editingId ? 'Edit Playlist' : 'Create New Playlist'}
            </h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Playlist Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

              <div>
                <label className="block text-white/80 mb-2 text-sm">Songs</label>
                <div className="space-y-3">
                  {formData.songs.map((song, index) => (
                    <div key={index} className="space-y-2">
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <input
                          type="text"
                          placeholder="Song Title"
                          value={song.title}
                          onChange={(e) => updateSong(index, 'title', e.target.value)}
                          className="col-span-4 px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF] text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Artist"
                          value={song.artist}
                          onChange={(e) => updateSong(index, 'artist', e.target.value)}
                          className="col-span-3 px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF] text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Note (optional)"
                          value={song.note}
                          onChange={(e) => updateSong(index, 'note', e.target.value)}
                          className="col-span-4 px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF] text-sm"
                        />
                        {formData.songs.length > 1 && (
                          <button
                            onClick={() => removeSongField(index)}
                            className="col-span-1 p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="Song Link (Spotify, YouTube, Apple Music, etc.)"
                        value={song.url || ''}
                        onChange={(e) => updateSong(index, 'url', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF] text-sm"
                      />
                    </div>
                  ))}
                  <button
                    onClick={addSongField}
                    className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                  >
                    + Add Song
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#C7AFFF] text-white rounded-lg hover:bg-[#B89FFF] transition-colors"
              >
                {editingId ? 'Update' : 'Create'} Playlist
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

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
        {playlists.map((playlist, index) => {
          if (!playlist.id) return null;

          return (
            <motion.div
              key={playlist.id}
              className="relative group"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Edit/Delete Buttons */}
              <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(playlist)}
                  className="p-2 bg-[#C7AFFF] rounded-full hover:bg-[#B89FFF] transition-colors backdrop-blur-sm"
                >
                  <Edit className="w-3 h-3 text-white" />
                </button>
                <button
                  onClick={() => handleDelete(playlist.id!)}
                  className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors backdrop-blur-sm"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>

              <motion.button
                className="relative w-full"
                onClick={() => setSelectedPlaylist(playlist)}
                whileHover={{ y: -10 }}
              >
                {/* Cassette Tape */}
                <motion.div
                  className="relative w-full aspect-[3/2] rounded-2xl shadow-xl overflow-hidden cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${playlist.color}90, ${playlist.color}60)`,
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: `0 20px 40px ${playlist.color}80`,
                  }}
                >
                  {/* Cassette Body */}
                  <div className="absolute inset-4 border-2 border-white/20 rounded-lg">
                    {/* Reels */}
                    <div className="absolute top-1/2 left-[20%] -translate-y-1/2">
                      <motion.div
                        className="w-12 h-12 rounded-full border-4 border-white/40 bg-black/20"
                        animate={playing === parseInt(playlist.id || '0') ? { rotate: 360 } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <div className="absolute inset-2 rounded-full border-2 border-white/20" />
                      </motion.div>
                    </div>
                    <div className="absolute top-1/2 right-[20%] -translate-y-1/2">
                      <motion.div
                        className="w-12 h-12 rounded-full border-4 border-white/40 bg-black/20"
                        animate={playing === parseInt(playlist.id || '0') ? { rotate: 360 } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <div className="absolute inset-2 rounded-full border-2 border-white/20" />
                      </motion.div>
                    </div>

                    {/* Tape Window */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-8 bg-black/10 rounded-lg" />

                    {/* Label */}
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <p className="text-white text-sm">{playlist.title}</p>
                    </div>
                  </div>

                  {/* Music Notes Animation */}
                  {playing === parseInt(playlist.id || '0') && (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          initial={{ y: '100%', x: `${30 + i * 20}%`, opacity: 0 }}
                          animate={{ y: '-100%', opacity: [0, 1, 0] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                          }}
                        >
                          <Music className="w-4 h-4 text-white" />
                        </motion.div>
                      ))}
                    </>
                  )}
                </motion.div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Playlist Modal */}
      <AnimatePresence>
        {selectedPlaylist && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedPlaylist(null);
                setPlaying(null);
              }}
            />
            
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
            >
              <div 
                className="rounded-3xl p-8 shadow-2xl backdrop-blur-xl border border-white/20"
                style={{
                  background: `linear-gradient(135deg, ${selectedPlaylist.color}40, ${selectedPlaylist.color}20)`,
                }}
              >
                <button
                  onClick={() => {
                    setSelectedPlaylist(null);
                    setPlaying(null);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <h3 
                  className="text-3xl font-['Pacifico'] mb-6 text-center"
                  style={{ color: selectedPlaylist.color }}
                >
                  {selectedPlaylist.title}
                </h3>

                <div className="space-y-3">
                  {selectedPlaylist.songs.map((song, index) => (
                    <motion.div
                      key={index}
                      className="backdrop-blur-sm rounded-xl p-4 border border-white/10"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => setPlaying(playing === index ? null : index)}
                          className="mt-1 p-2 rounded-full transition-colors"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                        >
                          {playing === index ? (
                            <Pause className="w-4 h-4 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white" />
                          )}
                        </button>
                        <div className="flex-1">
                          <h4 className="text-white mb-1">{song.title}</h4>
                          <p className="text-white/60 text-sm mb-2">{song.artist}</p>
                          {song.note && (
                            <p className="text-white/80 text-xs italic mb-2">{song.note}</p>
                          )}
                          {song.url && (
                            <a
                              href={song.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#C7AFFF]/30 hover:bg-[#C7AFFF]/50 text-white text-xs transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-3 h-3" />
                              Open Song
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Sound Waves */}
                      {playing === index && (
                        <div className="flex gap-1 mt-3 justify-center">
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1 bg-white rounded-full"
                              animate={{
                                height: ['10px', '30px', '10px'],
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.1,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {playlists.length === 0 && !isAdding && (
        <div className="text-center text-white/60 mt-12">
          <Music className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl mb-4">No playlists yet</p>
          <p>Click "Create Playlist" to add your first playlist!</p>
        </div>
      )}
    </div>
  );
}
