import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CookingPot, Heart, Plus, Edit, Trash2, X, Upload } from 'lucide-react';
import { BackButton } from './BackButton';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { recipeService, Recipe, imageService } from '../lib/database-supabase';

const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Drink'];

export function RecipeBook({ onBack }: { onBack: () => void }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: categories[0],
    image: '',
    ingredients: [''],
    instructions: [''],
    memory: '',
    is_favorite: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getAll();
      setRecipes(data);
    } catch (error) {
      console.error('Error loading recipes:', error);
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
    if (!formData.title || !formData.ingredients[0] || !formData.instructions[0]) {
      alert('Please fill in title, at least one ingredient, and one instruction');
      return;
    }

    try {
      setUploading(true);
      let imageUrl = formData.image;

      if (imageFile) {
        imageUrl = await imageService.uploadImage(imageFile, 'recipes');
      }

      await recipeService.create({
        ...formData,
        ingredients: formData.ingredients.filter(i => i.trim() !== ''),
        instructions: formData.instructions.filter(i => i.trim() !== ''),
        image: imageUrl,
      });

      setIsAdding(false);
      resetForm();
      await loadRecipes();
    } catch (error) {
      console.error('Error adding recipe:', error);
      alert('Failed to add recipe. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.title || !formData.ingredients[0] || !formData.instructions[0]) {
      alert('Please fill in title, at least one ingredient, and one instruction');
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
        imageUrl = await imageService.uploadImage(imageFile, 'recipes');
      }

      await recipeService.update(id, {
        ...formData,
        ingredients: formData.ingredients.filter(i => i.trim() !== ''),
        instructions: formData.instructions.filter(i => i.trim() !== ''),
        image: imageUrl,
      });

      setEditingId(null);
      resetForm();
      await loadRecipes();
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert('Failed to update recipe. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      await recipeService.delete(id);
      await loadRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  const toggleFavorite = async (id: string, currentFavorite: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await recipeService.toggleFavorite(id, !currentFavorite);
      await loadRecipes();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const startEdit = (recipe: Recipe) => {
    setEditingId(recipe.id || null);
    setFormData({
      title: recipe.title,
      category: recipe.category,
      image: recipe.image,
      ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [''],
      instructions: recipe.instructions.length > 0 ? recipe.instructions : [''],
      memory: recipe.memory,
      is_favorite: recipe.is_favorite,
    });
    setImagePreview(recipe.image);
    setImageFile(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: categories[0],
      image: '',
      ingredients: [''],
      instructions: [''],
      memory: '',
      is_favorite: false,
    });
    setImageFile(null);
    setImagePreview('');
  };

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, ''] });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const addInstruction = () => {
    setFormData({ ...formData, instructions: [...formData.instructions, ''] });
  };

  const removeInstruction = (index: number) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading recipes...</div>
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
        Our Recipe Book
      </motion.h2>

      <motion.p
        className="text-white/60 text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Delicious memories we've cooked together 👨‍🍳💕
      </motion.p>

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
          Add Recipe
        </motion.button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto mb-8 p-6 rounded-3xl bg-white/10 backdrop-blur-xl border-2 border-white/20 max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-['Pacifico'] text-white mb-4">
              {editingId ? 'Edit Recipe' : 'Add New Recipe'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Recipe Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-[#C7AFFF] [&>option]:bg-[#1E1B3E] [&>option]:text-white"
                style={{
                  color: 'white',
                }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} style={{ backgroundColor: '#1E1B3E', color: 'white' }}>{cat}</option>
                ))}
              </select>
              
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

              {/* Ingredients */}
              <div className="md:col-span-2">
                <label className="block text-white/80 mb-2">Ingredients</label>
                <div className="space-y-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Ingredient ${index + 1}`}
                        value={ingredient}
                        onChange={(e) => {
                          const newIngredients = [...formData.ingredients];
                          newIngredients[index] = e.target.value;
                          setFormData({ ...formData, ingredients: newIngredients });
                        }}
                        className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
                      />
                      {formData.ingredients.length > 1 && (
                        <button
                          onClick={() => removeIngredient(index)}
                          className="px-3 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addIngredient}
                    className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                  >
                    + Add Ingredient
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="md:col-span-2">
                <label className="block text-white/80 mb-2">Instructions</label>
                <div className="space-y-2">
                  {formData.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-white/60 pt-2">{index + 1}.</span>
                      <textarea
                        placeholder={`Step ${index + 1}`}
                        value={instruction}
                        onChange={(e) => {
                          const newInstructions = [...formData.instructions];
                          newInstructions[index] = e.target.value;
                          setFormData({ ...formData, instructions: newInstructions });
                        }}
                        rows={2}
                        className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
                      />
                      {formData.instructions.length > 1 && (
                        <button
                          onClick={() => removeInstruction(index)}
                          className="px-3 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors self-start mt-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addInstruction}
                    className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
                  >
                    + Add Instruction
                  </button>
                </div>
              </div>

              {/* Memory */}
              <div className="md:col-span-2">
                <textarea
                  placeholder="Special memory about this recipe..."
                  value={formData.memory}
                  onChange={(e) => setFormData({ ...formData, memory: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-[#C7AFFF]"
                />
              </div>

              {/* Favorite */}
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="favorite"
                  checked={formData.is_favorite}
                  onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="favorite" className="text-white/80">Mark as favorite</label>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#C7AFFF] text-white rounded-lg hover:bg-[#B89FFF] transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : editingId ? 'Update' : 'Add'} Recipe
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

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recipes.map((recipe, index) => {
          if (!recipe.id) return null;
          const isFlipped = flippedCards.has(recipe.id);
          const isFavorite = recipe.is_favorite;

          return (
            <motion.div
              key={recipe.id}
              className="relative h-96 cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ perspective: 1000 }}
              onClick={() => toggleFlip(recipe.id!)}
            >
              {/* Edit/Delete Buttons */}
              <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(recipe);
                  }}
                  className="p-2 bg-[#C7AFFF] rounded-full hover:bg-[#B89FFF] transition-colors"
                >
                  <Edit className="w-3 h-3 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(recipe.id!);
                  }}
                  className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>

              <motion.div
                className="relative w-full h-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front of Card */}
                <div
                  className="absolute inset-0 rounded-2xl shadow-xl overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <div className="relative w-full h-full">
                    <ImageWithFallback
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                      <span className="text-white text-xs">{recipe.category}</span>
                    </div>

                    {/* Favorite Button */}
                    <motion.button
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm z-10"
                      onClick={(e) => toggleFavorite(recipe.id!, isFavorite, e)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart
                        className="w-5 h-5"
                        fill={isFavorite ? '#FFC8E2' : 'none'}
                        color={isFavorite ? '#FFC8E2' : 'white'}
                      />
                    </motion.button>

                    {/* Title and Memory */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white text-xl mb-2">{recipe.title}</h3>
                      <p className="text-white/80 text-sm italic">{recipe.memory}</p>
                    </div>
                  </div>
                </div>

                {/* Back of Card */}
                <div
                  className="absolute inset-0 rounded-2xl shadow-xl bg-gradient-to-br from-[#C7AFFF]/90 to-[#FFC8E2]/90 backdrop-blur-xl p-6 overflow-y-auto"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CookingPot className="w-5 h-5 text-white" />
                    <h3 className="text-white text-xl">{recipe.title}</h3>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-white text-sm mb-2">Ingredients:</h4>
                    <ul className="space-y-1">
                      {recipe.ingredients.map((ingredient, i) => (
                        <li key={i} className="text-white/90 text-xs flex items-start gap-2">
                          <span className="text-white/60">•</span>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-white text-sm mb-2">Instructions:</h4>
                    <ol className="space-y-2">
                      {recipe.instructions.map((instruction, i) => (
                        <li key={i} className="text-white/90 text-xs flex items-start gap-2">
                          <span className="text-white/80">{i + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <p className="text-white/60 text-xs text-center mt-4">
                    Tap to flip back
                  </p>
                </div>
              </motion.div>

              {/* Pulse Animation for Favorites */}
              {isFavorite && !isFlipped && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FFC8E2]"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {recipes.length === 0 && !isAdding && (
        <div className="text-center text-white/60 mt-12">
          <p className="text-xl mb-4">No recipes yet</p>
          <p>Click "Add Recipe" to create your first one!</p>
        </div>
      )}
    </div>
  );
}
