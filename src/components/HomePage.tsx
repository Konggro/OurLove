import { motion } from 'motion/react';
import { 
  BookHeart, Heart, Mail, MapPin, Music, Sparkles, 
  Laugh, Dices, Package, Clock, CookingPot, 
  Calendar, Image, Languages, Home
} from 'lucide-react';
import { PageType } from '../App';

interface HomePageProps {
  onNavigate: (page: PageType) => void;
}

const sections = [
  { id: 'story' as PageType, icon: BookHeart, label: 'Our Story', angle: 0, color: '#C7AFFF' },
  { id: 'reasons' as PageType, icon: Heart, label: 'Reasons I Love You', angle: 25.7, color: '#FFC8E2' },
  { id: 'letters' as PageType, icon: Mail, label: 'Love Letters', angle: 51.4, color: '#A9E0FF' },
  { id: 'map' as PageType, icon: MapPin, label: 'Adventure Map', angle: 77.1, color: '#C7AFFF' },
  { id: 'playlist' as PageType, icon: Music, label: 'Playlists', angle: 102.8, color: '#FFC8E2' },
  { id: 'appreciation' as PageType, icon: Sparkles, label: 'Appreciation', angle: 128.5, color: '#A9E0FF' },
  { id: 'jokes' as PageType, icon: Laugh, label: 'Inside Jokes', angle: 154.2, color: '#C7AFFF' },
  { id: 'roulette' as PageType, icon: Dices, label: 'Date Roulette', angle: 180, color: '#FFC8E2' },
  { id: 'care' as PageType, icon: Package, label: 'Care Packages', angle: 205.7, color: '#A9E0FF' },
  { id: 'countdown' as PageType, icon: Clock, label: 'Countdowns', angle: 231.4, color: '#C7AFFF' },
  { id: 'recipes' as PageType, icon: CookingPot, label: 'Recipe Book', angle: 257.1, color: '#FFC8E2' },
  { id: 'messages' as PageType, icon: Calendar, label: 'Daily Messages', angle: 282.8, color: '#A9E0FF' },
  { id: 'museum' as PageType, icon: Image, label: 'Museum of Us', angle: 308.5, color: '#C7AFFF' },
  { id: 'languages' as PageType, icon: Languages, label: 'Language Learning', angle: 334.2, color: '#FFC8E2' },
];

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="relative w-full max-w-4xl aspect-square">
        {/* Central Heart Constellation */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.div
            className="relative"
            animate={{
              boxShadow: [
                '0 0 40px rgba(255, 200, 226, 0.5)',
                '0 0 80px rgba(199, 175, 255, 0.7)',
                '0 0 40px rgba(255, 200, 226, 0.5)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart className="w-32 h-32 fill-[#FFC8E2] text-[#FFC8E2] drop-shadow-2xl" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-white"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 45}deg) translateX(60px)`,
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.5, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.25,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="text-6xl font-['Pacifico'] text-transparent bg-clip-text bg-gradient-to-r from-[#C7AFFF] via-[#FFC8E2] to-[#A9E0FF] drop-shadow-lg">
            Our Love Galaxy
          </h1>
        </motion.div>

        {/* Orbiting Icons */}
        {sections.map((section, index) => {
          const radius = 280;
          const angleRad = (section.angle * Math.PI) / 180;
          const x = Math.cos(angleRad) * radius;
          const y = Math.sin(angleRad) * radius;

          return (
            <motion.div
              key={section.id}
              className="absolute top-1/2 left-1/2"
              style={{
                x: x - 32,
                y: y - 32,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                opacity: { delay: 0.7 + index * 0.1 },
                scale: { delay: 0.7 + index * 0.1 },
                rotate: { duration: 3, repeat: Infinity, delay: index * 0.3 },
              }}
            >
              <motion.button
                className="relative w-16 h-16 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${section.color}40, ${section.color}20)`,
                }}
                whileHover={{
                  scale: 1.3,
                  boxShadow: `0 0 30px ${section.color}`,
                  borderColor: section.color,
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onNavigate(section.id)}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  y: { duration: 2 + index * 0.2, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <section.icon className="w-7 h-7" style={{ color: section.color }} />
                
                {/* Tooltip */}
                <motion.div
                  className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm whitespace-nowrap opacity-0 pointer-events-none text-xs"
                  style={{ color: section.color }}
                  whileHover={{ opacity: 1 }}
                >
                  {section.label}
                </motion.div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
