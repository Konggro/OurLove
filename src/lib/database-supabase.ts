import { supabase } from './supabase';

// Notifications (defined early as it's used by other services)
export interface Notification {
  id?: string;
  user_id: string;
  type: 'memory' | 'milestone' | 'recipe' | 'location' | 'love_letter' | 'playlist' | 'joke' | 'date_idea' | 'care_package' | 'countdown' | 'daily_message' | 'reason' | 'compliment' | 'language_entry';
  title: string;
  message: string;
  read: boolean;
  created_at?: string;
}

export const notificationService = {
  async getAll(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Notification[];
  },

  async getUnread(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Notification[];
  },

  async create(notification: Omit<Notification, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
  },

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Countdowns
export interface Countdown {
  id?: string;
  title: string;
  date: Date;
  emoji: string;
  color: string;
  created_at?: string;
}

export const countdownService = {
  async getAll(): Promise<Countdown[]> {
    const { data, error } = await supabase
      .from('countdowns')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      date: new Date(item.date),
    })) as Countdown[];
  },

  async create(countdown: Omit<Countdown, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('countdowns')
      .insert({
        title: countdown.title,
        date: countdown.date.toISOString(),
        emoji: countdown.emoji,
        color: countdown.color,
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async update(id: string, countdown: Partial<Omit<Countdown, 'id' | 'created_at'>>): Promise<void> {
    const updateData: any = { ...countdown };
    if (countdown.date) {
      updateData.date = countdown.date.toISOString();
    }

    const { error } = await supabase
      .from('countdowns')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('countdowns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Memories (Museum of Us)
export interface Memory {
  id?: string;
  title: string;
  date: string;
  story: string;
  quote: string;
  image: string;
  x: number;
  y: number;
  user_id?: string;
  created_at?: string;
}

export const memoryService = {
  async getAll(): Promise<Memory[]> {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Memory[];
  },

  async create(memory: Omit<Memory, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('memories')
      .insert(memory)
      .select()
      .single();

    if (error) throw error;
    
    // Create notification for the other user
    if (memory.user_id) {
      const otherUserId = memory.user_id === 'user1' ? 'user2' : 'user1';
      try {
        await notificationService.create({
          user_id: otherUserId,
          type: 'memory',
          title: 'New Memory Added',
          message: `${memory.user_id === 'user1' ? 'Me' : 'Boyfriend'} added a new memory: "${memory.title}"`,
          read: false,
        });
      } catch (err) {
        console.error('Error creating notification:', err);
      }
    }
    
    return data.id;
  },

  async update(id: string, memory: Partial<Omit<Memory, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('memories')
      .update(memory)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    // Get memory to check if image needs deletion
    const { data: memory } = await supabase
      .from('memories')
      .select('image')
      .eq('id', id)
      .single();

    // Delete image from storage if it's uploaded
    if (memory?.image && memory.image.includes('supabase.co')) {
      try {
        const imagePath = memory.image.split('/storage/v1/object/public/')[1]?.split('?')[0];
        if (imagePath) {
          await supabase.storage.from('images').remove([imagePath]);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getById(id: string): Promise<Memory | null> {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Memory;
  },
};

// Milestones (Our Story Timeline)
export interface Milestone {
  id?: string;
  date: string;
  title: string;
  description: string;
  image: string;
  user_id?: string;
  created_at?: string;
}

export const milestoneService = {
  async getAll(): Promise<Milestone[]> {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Milestone[];
  },

  async create(milestone: Omit<Milestone, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('milestones')
      .insert(milestone)
      .select()
      .single();

    if (error) throw error;
    
    // Create notification for the other user
    if (milestone.user_id) {
      const otherUserId = milestone.user_id === 'user1' ? 'user2' : 'user1';
      try {
        await notificationService.create({
          user_id: otherUserId,
          type: 'milestone',
          title: 'New Milestone Added',
          message: `${milestone.user_id === 'user1' ? 'Me' : 'Boyfriend'} added a new milestone: "${milestone.title}"`,
          read: false,
        });
      } catch (err) {
        console.error('Error creating notification:', err);
      }
    }
    
    return data.id;
  },

  async update(id: string, milestone: Partial<Omit<Milestone, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('milestones')
      .update(milestone)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    // Get milestone to check if image needs deletion
    const { data: milestone } = await supabase
      .from('milestones')
      .select('image')
      .eq('id', id)
      .single();

    // Delete image from storage if it's uploaded
    if (milestone?.image && milestone.image.includes('supabase.co')) {
      try {
        const imagePath = milestone.image.split('/storage/v1/object/public/')[1]?.split('?')[0];
        if (imagePath) {
          await supabase.storage.from('images').remove([imagePath]);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getById(id: string): Promise<Milestone | null> {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Milestone;
  },
};

// Recipes (Recipe Book)
export interface Recipe {
  id?: string;
  title: string;
  category: string;
  image: string;
  ingredients: string[];
  instructions: string[];
  memory: string;
  is_favorite: boolean;
  user_id?: string;
  created_at?: string;
}

export const recipeService = {
  async getAll(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      ingredients: Array.isArray(item.ingredients) ? item.ingredients : JSON.parse(item.ingredients || '[]'),
      instructions: Array.isArray(item.instructions) ? item.instructions : JSON.parse(item.instructions || '[]'),
    })) as Recipe[];
  },

  async create(recipe: Omit<Recipe, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        title: recipe.title,
        category: recipe.category,
        image: recipe.image,
        ingredients: JSON.stringify(recipe.ingredients),
        instructions: JSON.stringify(recipe.instructions),
        memory: recipe.memory,
        is_favorite: recipe.is_favorite || false,
        user_id: recipe.user_id,
      })
      .select()
      .single();

    if (error) throw error;
    
    // Create notification for the other user
    if (recipe.user_id) {
      const otherUserId = recipe.user_id === 'user1' ? 'user2' : 'user1';
      try {
        await notificationService.create({
          user_id: otherUserId,
          type: 'recipe',
          title: 'New Recipe Added',
          message: `${recipe.user_id === 'user1' ? 'Me' : 'Boyfriend'} added a new recipe: "${recipe.title}"`,
          read: false,
        });
      } catch (err) {
        console.error('Error creating notification:', err);
      }
    }
    
    return data.id;
  },

  async update(id: string, recipe: Partial<Omit<Recipe, 'id' | 'created_at'>>): Promise<void> {
    const updateData: any = { ...recipe };
    if (recipe.ingredients) {
      updateData.ingredients = JSON.stringify(recipe.ingredients);
    }
    if (recipe.instructions) {
      updateData.instructions = JSON.stringify(recipe.instructions);
    }

    const { error } = await supabase
      .from('recipes')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    // Get recipe to check if image needs deletion
    const { data: recipe } = await supabase
      .from('recipes')
      .select('image')
      .eq('id', id)
      .single();

    // Delete image from storage if it's uploaded
    if (recipe?.image && recipe.image.includes('supabase.co')) {
      try {
        const imagePath = recipe.image.split('/storage/v1/object/public/')[1]?.split('?')[0];
        if (imagePath) {
          await supabase.storage.from('images').remove([imagePath]);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from('recipes')
      .update({ is_favorite: isFavorite })
      .eq('id', id);

    if (error) throw error;
  },

  async getById(id: string): Promise<Recipe | null> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return {
      ...data,
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : JSON.parse(data.ingredients || '[]'),
      instructions: Array.isArray(data.instructions) ? data.instructions : JSON.parse(data.instructions || '[]'),
    } as Recipe;
  },
};

// Language Learning
export interface LanguageEntry {
  id?: string;
  language: string;
  word_or_phrase: string;
  translation: string;
  notes?: string;
  created_at?: string;
}

export const languageService = {
  async getAll(): Promise<LanguageEntry[]> {
    const { data, error } = await supabase
      .from('language_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as LanguageEntry[];
  },

  async getByLanguage(language: string): Promise<LanguageEntry[]> {
    const { data, error } = await supabase
      .from('language_entries')
      .select('*')
      .eq('language', language)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as LanguageEntry[];
  },

  async create(entry: Omit<LanguageEntry, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('language_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async update(id: string, entry: Partial<Omit<LanguageEntry, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('language_entries')
      .update(entry)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('language_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Love Letters
export interface LoveLetter {
  id?: string;
  title: string;
  date: string;
  content: string;
  color: string;
  created_at?: string;
}

export const loveLetterService = {
  async getAll(): Promise<LoveLetter[]> {
    const { data, error } = await supabase
      .from('love_letters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as LoveLetter[];
  },

  async create(letter: Omit<LoveLetter, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('love_letters')
      .insert(letter)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async update(id: string, letter: Partial<Omit<LoveLetter, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('love_letters')
      .update(letter)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('love_letters')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getById(id: string): Promise<LoveLetter | null> {
    const { data, error } = await supabase
      .from('love_letters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as LoveLetter;
  },
};

// Adventure Map Locations
export interface Location {
  id?: string;
  name: string;
  country: string;
  visited: boolean;
  x: number;
  y: number;
  image: string;
  memory: string;
  user_id?: string;
  created_at?: string;
}

export const locationService = {
  async getAll(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      visited: item.visited || false,
    })) as Location[];
  },

  async create(location: Omit<Location, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('locations')
      .insert({
        ...location,
        visited: location.visited || false,
        user_id: location.user_id,
      })
      .select()
      .single();

    if (error) throw error;
    
    // Create notification for the other user
    if (location.user_id) {
      const otherUserId = location.user_id === 'user1' ? 'user2' : 'user1';
      try {
        await notificationService.create({
          user_id: otherUserId,
          type: 'location',
          title: 'New Location Added',
          message: `${location.user_id === 'user1' ? 'Me' : 'Boyfriend'} added a new location: "${location.name}"`,
          read: false,
        });
      } catch (err) {
        console.error('Error creating notification:', err);
      }
    }
    
    return data.id;
  },

  async update(id: string, location: Partial<Omit<Location, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('locations')
      .update(location)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    // Get location to check if image needs deletion
    const { data: location } = await supabase
      .from('locations')
      .select('image')
      .eq('id', id)
      .single();

    // Delete image from storage if it's uploaded
    if (location?.image && location.image.includes('supabase.co')) {
      try {
        const imagePath = location.image.split('/storage/v1/object/public/')[1]?.split('?')[0];
        if (imagePath) {
          await supabase.storage.from('images').remove([imagePath]);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleVisited(id: string, visited: boolean): Promise<void> {
    const { error } = await supabase
      .from('locations')
      .update({ visited })
      .eq('id', id);

    if (error) throw error;
  },

  async getById(id: string): Promise<Location | null> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return { ...data, visited: data.visited || false } as Location;
  },
};

// Daily Messages
export interface DailyMessage {
  id?: string;
  date: string; // Format: YYYY-MM-DD
  message: string;
  mood: string;
  created_at?: string;
}

export const dailyMessageService = {
  async getAll(): Promise<DailyMessage[]> {
    const { data, error } = await supabase
      .from('daily_messages')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return (data || []) as DailyMessage[];
  },

  async getByDate(date: string): Promise<DailyMessage | null> {
    const { data, error } = await supabase
      .from('daily_messages')
      .select('*')
      .eq('date', date)
      .single();

    if (error) return null;
    return data as DailyMessage;
  },

  async create(message: Omit<DailyMessage, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('daily_messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async update(id: string, message: Partial<Omit<DailyMessage, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('daily_messages')
      .update(message)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('daily_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteByDate(date: string): Promise<void> {
    const { error } = await supabase
      .from('daily_messages')
      .delete()
      .eq('date', date);

    if (error) throw error;
  },
};

// Reasons I Love You
export interface Reason {
  id?: string;
  text: string;
  created_at?: string;
}

export const reasonService = {
  async getAll(): Promise<Reason[]> {
    const { data, error } = await supabase
      .from('reasons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Reason[];
  },

  async create(reason: Omit<Reason, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('reasons')
      .insert(reason)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reasons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Custom Playlists
export interface Song {
  title: string;
  artist: string;
  note: string;
  url?: string;
}

export interface Playlist {
  id?: string;
  title: string;
  color: string;
  songs: Song[];
  created_at?: string;
}

export const playlistService = {
  async getAll(): Promise<Playlist[]> {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      songs: typeof item.songs === 'string' ? JSON.parse(item.songs) : item.songs,
    })) as Playlist[];
  },

  async create(playlist: Omit<Playlist, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('playlists')
      .insert({
        ...playlist,
        songs: JSON.stringify(playlist.songs),
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async update(id: string, playlist: Partial<Omit<Playlist, 'id' | 'created_at'>>): Promise<void> {
    const updateData: any = { ...playlist };
    if (playlist.songs) {
      updateData.songs = JSON.stringify(playlist.songs);
    }

    const { error } = await supabase
      .from('playlists')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Appreciation Compliments
export interface Compliment {
  id?: string;
  text: string;
  created_at?: string;
}

export const complimentService = {
  async getAll(): Promise<Compliment[]> {
    const { data, error } = await supabase
      .from('compliments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Compliment[];
  },

  async create(compliment: Omit<Compliment, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('compliments')
      .insert(compliment)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('compliments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Inside Jokes
export interface Joke {
  id?: string;
  title: string;
  origin: string;
  story: string;
  emoji: string;
  created_at?: string;
}

export const jokeService = {
  async getAll(): Promise<Joke[]> {
    const { data, error } = await supabase
      .from('jokes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Joke[];
  },

  async create(joke: Omit<Joke, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('jokes')
      .insert(joke)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async update(id: string, joke: Partial<Omit<Joke, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('jokes')
      .update(joke)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('jokes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Date Ideas
export interface DateIdea {
  id?: string;
  title: string;
  description: string;
  emoji: string;
  created_at?: string;
}

export const dateIdeaService = {
  async getAll(): Promise<DateIdea[]> {
    const { data, error } = await supabase
      .from('date_ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as DateIdea[];
  },

  async create(dateIdea: Omit<DateIdea, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('date_ideas')
      .insert(dateIdea)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async update(id: string, dateIdea: Partial<Omit<DateIdea, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('date_ideas')
      .update(dateIdea)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('date_ideas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Care Packages
export interface CarePackage {
  id?: string;
  title: string;
  date: string;
  status: 'sent' | 'received' | 'planned';
  items: string[];
  note: string;
  color: string;
  created_at?: string;
}

export const carePackageService = {
  async getAll(): Promise<CarePackage[]> {
    const { data, error } = await supabase
      .from('care_packages')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      items: typeof item.items === 'string' ? JSON.parse(item.items) : item.items,
    })) as CarePackage[];
  },

  async create(pkg: Omit<CarePackage, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('care_packages')
      .insert({
        ...pkg,
        items: JSON.stringify(pkg.items),
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async update(id: string, pkg: Partial<Omit<CarePackage, 'id' | 'created_at'>>): Promise<void> {
    const updateData: any = { ...pkg };
    if (pkg.items) {
      updateData.items = JSON.stringify(pkg.items);
    }

    const { error } = await supabase
      .from('care_packages')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('care_packages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Image Upload Utility
export const imageService = {
  async uploadImage(file: File, folder: string = 'images'): Promise<string> {
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}_${file.name}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  async deleteImage(imageUrl: string): Promise<void> {
    if (imageUrl.includes('supabase.co')) {
      try {
        const imagePath = imageUrl.split('/storage/v1/object/public/')[1]?.split('?')[0];
        if (imagePath) {
          await supabase.storage.from('images').remove([imagePath]);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  },
};


