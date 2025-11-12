import { motion } from 'motion/react';
import { Heart, Sparkles, Star } from 'lucide-react';

export function FloatingElements() {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
  }));

  const floatingHearts = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 15 + Math.random() * 10,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Twinkling Stars */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut',
          }}
        >
          <Star className="w-1 h-1 fill-white text-white" />
        </motion.div>
      ))}

      {/* Floating Hearts */}
      {floatingHearts.map((heart) => (
        <motion.div
          key={`heart-${heart.id}`}
          className="absolute"
          style={{
            left: `${heart.x}%`,
          }}
          animate={{
            y: ['100vh', '-10vh'],
            x: [0, Math.sin(heart.id) * 50, 0],
            rotate: [0, 360],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: 'linear',
          }}
        >
          <Heart className="w-4 h-4 fill-pink-300/30 text-pink-300/30" />
        </motion.div>
      ))}

      {/* Sparkles */}
      {Array.from({ length: 15 }, (_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        >
          <Sparkles className="w-3 h-3 text-[#FFC8E2]" />
        </motion.div>
      ))}
    </div>
  );
}
