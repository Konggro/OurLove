import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HomePage } from './components/HomePage';
import { OurStoryTimeline } from './components/OurStoryTimeline';
import { ReasonsILoveYou } from './components/ReasonsILoveYou';
import { VirtualLoveLetters } from './components/VirtualLoveLetters';
import { AdventureMap } from './components/AdventureMap';
import { CustomPlaylist } from './components/CustomPlaylist';
import { AppreciationGenerator } from './components/AppreciationGenerator';
import { InsideJokes } from './components/InsideJokes';
import { DateRoulette } from './components/DateRoulette';
import { CarePackageTracker } from './components/CarePackageTracker';
import { CoupleCountdown } from './components/CoupleCountdown';
import { RecipeBook } from './components/RecipeBook';
import { DailyMessages } from './components/DailyMessages';
import { MuseumOfUs } from './components/MuseumOfUs';
import { LanguageLearning } from './components/LanguageLearning';
import { FloatingElements } from './components/FloatingElements';
import { MusicToggle } from './components/MusicToggle';

export type PageType = 'home' | 'story' | 'reasons' | 'letters' | 'map' | 'playlist' | 
  'appreciation' | 'jokes' | 'roulette' | 'care' | 'countdown' | 'recipes' | 
  'messages' | 'museum' | 'languages';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'story':
        return <OurStoryTimeline onBack={() => setCurrentPage('home')} />;
      case 'reasons':
        return <ReasonsILoveYou onBack={() => setCurrentPage('home')} />;
      case 'letters':
        return <VirtualLoveLetters onBack={() => setCurrentPage('home')} />;
      case 'map':
        return <AdventureMap onBack={() => setCurrentPage('home')} />;
      case 'playlist':
        return <CustomPlaylist onBack={() => setCurrentPage('home')} />;
      case 'appreciation':
        return <AppreciationGenerator onBack={() => setCurrentPage('home')} />;
      case 'jokes':
        return <InsideJokes onBack={() => setCurrentPage('home')} />;
      case 'roulette':
        return <DateRoulette onBack={() => setCurrentPage('home')} />;
      case 'care':
        return <CarePackageTracker onBack={() => setCurrentPage('home')} />;
      case 'countdown':
        return <CoupleCountdown onBack={() => setCurrentPage('home')} />;
      case 'recipes':
        return <RecipeBook onBack={() => setCurrentPage('home')} />;
      case 'messages':
        return <DailyMessages onBack={() => setCurrentPage('home')} />;
      case 'museum':
        return <MuseumOfUs onBack={() => setCurrentPage('home')} />;
      case 'languages':
        return <LanguageLearning onBack={() => setCurrentPage('home')} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1E1B3E] via-[#2D2654] to-[#1E1B3E]">
      <FloatingElements />
      <MusicToggle />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="relative z-10"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
