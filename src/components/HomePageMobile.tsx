import { motion } from 'motion/react';
import { 
  BookHeart, Heart, Mail, MapPin, Music, Sparkles, 
  Laugh, Dices, Package, Clock, CookingPot, 
  Calendar, Image, Languages, LogOut
} from 'lucide-react';
import { PageType } from '../App';
import { useAuth } from '../contexts/AuthContext';

interface HomePageMobileProps {
  onNavigate: (page: PageType) => void;
}

const sections = [
  { id: 'story' as PageType, icon: BookHeart, label: 'Our Story', color: '#C7AFFF' },
  { id: 'reasons' as PageType, icon: Heart, label: 'Reasons I Love You', color: '#FFC8E2' },
  { id: 'letters' as PageType, icon: Mail, label: 'Love Letters', color: '#A9E0FF' },
  { id: 'map' as PageType, icon: MapPin, label: 'Adventure Map', color: '#C7AFFF' },
  { id: 'playlist' as PageType, icon: Music, label: 'Playlists', color: '#FFC8E2' },
  { id: 'appreciation' as PageType, icon: Sparkles, label: 'Appreciation', color: '#A9E0FF' },
  { id: 'jokes' as PageType, icon: Laugh, label: 'Inside Jokes', color: '#C7AFFF' },
  { id: 'roulette' as PageType, icon: Dices, label: 'Date Roulette', color: '#FFC8E2' },
  { id: 'care' as PageType, icon: Package, label: 'Care Packages', color: '#A9E0FF' },
  { id: 'countdown' as PageType, icon: Clock, label: 'Countdowns', color: '#C7AFFF' },
  { id: 'recipes' as PageType, icon: CookingPot, label: 'Recipe Book', color: '#FFC8E2' },
  { id: 'messages' as PageType, icon: Calendar, label: 'Daily Messages', color: '#A9E0FF' },
  { id: 'museum' as PageType, icon: Image, label: 'Museum of Us', color: '#C7AFFF' },
  { id: 'languages' as PageType, icon: Languages, label: 'Language Learning', color: '#FFC8E2' },
];

export function HomePageMobile({ onNavigate }: HomePageMobileProps) {
  const { logout, userName } = useAuth();

  return (
    <div className="min-h-screen w-full flex flex-col justify-center p-4 pt-16 pb-8 overflow-x-hidden">
      {/* Logout Button */}
      <motion.button
        onClick={logout}
        className="fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-lg hover:bg-white/20 transition-all flex items-center gap-2 text-white text-xs"
        whileTap={{ scale: 0.95 }}
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
        <span>{userName}</span>
      </motion.button>

      {/* Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl sm:text-5xl font-['Pacifico'] text-transparent bg-clip-text bg-gradient-to-r from-[#C7AFFF] via-[#FFC8E2] to-[#A9E0FF] drop-shadow-lg">
          Our Love Galaxy
        </h1>
      </motion.div>

      {/* 3-Column Grid with Heart in Center */}
      <div style={{ maxWidth: '100%', width: '100%', padding: '0 12px' }}>
        {/* First Row - 3 icons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          {sections.slice(0, 3).map((section, index) => {
            const SectionIcon = section.icon;
            return (
              <motion.button
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className="w-full aspect-square rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg touch-manipulation"
                style={{
                  background: `linear-gradient(135deg, ${section.color}40, ${section.color}20)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileTap={{ scale: 0.92 }}
              >
                <SectionIcon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: section.color }} />
              </motion.button>
            );
          })}
        </div>

        {/* Second Row - 3 icons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          {sections.slice(3, 6).map((section, index) => {
            const SectionIcon = section.icon;
            return (
              <motion.button
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className="w-full aspect-square rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg touch-manipulation"
                style={{
                  background: `linear-gradient(135deg, ${section.color}40, ${section.color}20)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + index * 0.05 }}
                whileTap={{ scale: 0.92 }}
              >
                <SectionIcon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: section.color }} />
              </motion.button>
            );
          })}
        </div>

        {/* Third Row - 1 icon, Heart, 1 icon */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
          {(() => {
            const section = sections[6];
            const SectionIcon = section.icon;
            return (
              <motion.button
                onClick={() => onNavigate(section.id)}
                className="w-full aspect-square rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg touch-manipulation"
                style={{
                  background: `linear-gradient(135deg, ${section.color}40, ${section.color}20)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                whileTap={{ scale: 0.92 }}
              >
                <SectionIcon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: section.color }} />
              </motion.button>
            );
          })()}

          {/* Large Heart in Center */}
          <motion.div
            className="w-full aspect-square flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <motion.div
              className="inline-block"
              animate={{
                filter: [
                  'drop-shadow(0 0 15px rgba(255, 200, 226, 0.5)) drop-shadow(0 0 30px rgba(199, 175, 255, 0.7))',
                  'drop-shadow(0 0 25px rgba(255, 200, 226, 0.7)) drop-shadow(0 0 40px rgba(199, 175, 255, 0.9))',
                  'drop-shadow(0 0 15px rgba(255, 200, 226, 0.5)) drop-shadow(0 0 30px rgba(199, 175, 255, 0.7))',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Heart className="w-16 h-16 sm:w-20 sm:h-20 fill-[#FFC8E2] text-[#FFC8E2]" />
            </motion.div>
          </motion.div>

          {(() => {
            const section = sections[7];
            const SectionIcon = section.icon;
            return (
              <motion.button
                onClick={() => onNavigate(section.id)}
                className="w-full aspect-square rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg touch-manipulation"
                style={{
                  background: `linear-gradient(135deg, ${section.color}40, ${section.color}20)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.65 }}
                whileTap={{ scale: 0.92 }}
              >
                <SectionIcon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: section.color }} />
              </motion.button>
            );
          })()}
        </div>

        {/* Fourth Row - 3 icons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          {sections.slice(8, 11).map((section, index) => {
            const SectionIcon = section.icon;
            return (
              <motion.button
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className="w-full aspect-square rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg touch-manipulation"
                style={{
                  background: `linear-gradient(135deg, ${section.color}40, ${section.color}20)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                whileTap={{ scale: 0.92 }}
              >
                <SectionIcon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: section.color }} />
              </motion.button>
            );
          })}
        </div>

        {/* Fifth Row - 3 icons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {sections.slice(11, 14).map((section, index) => {
            const SectionIcon = section.icon;
            return (
              <motion.button
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className="w-full aspect-square rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg touch-manipulation"
                style={{
                  background: `linear-gradient(135deg, ${section.color}40, ${section.color}20)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.85 + index * 0.05 }}
                whileTap={{ scale: 0.92 }}
              >
                <SectionIcon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: section.color }} />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

