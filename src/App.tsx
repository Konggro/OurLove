import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HomePage } from './components/HomePage';
import { HomePageMobile } from './components/HomePageMobile';
import { OurStoryTimeline } from './components/OurStoryTimeline';
import { OurStoryTimelineMobile } from './components/OurStoryTimelineMobile';
import { ReasonsILoveYou } from './components/ReasonsILoveYou';
import { ReasonsILoveYouMobile } from './components/ReasonsILoveYouMobile';
import { VirtualLoveLetters } from './components/VirtualLoveLetters';
import { VirtualLoveLettersMobile } from './components/VirtualLoveLettersMobile';
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
import { Login } from './components/Login';
import { NotificationBell } from './components/NotificationBell';
import { AuthProvider, useAuth } from './contexts/AuthContext';

export type PageType = 'home' | 'story' | 'reasons' | 'letters' | 'map' | 'playlist' | 
  'appreciation' | 'jokes' | 'roulette' | 'care' | 'countdown' | 'recipes' | 
  'messages' | 'museum' | 'languages';

function AppContent() {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      console.log('Screen width:', window.innerWidth, 'isMobile:', mobile);
      setIsMobile(mobile);
    };

    handleResize(); // Call once on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!currentUser) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return isMobile ? (
          <HomePageMobile onNavigate={setCurrentPage} />
        ) : (
          <HomePage onNavigate={setCurrentPage} />
        );
      case 'story':
        return isMobile ? (
          <OurStoryTimelineMobile onBack={() => setCurrentPage('home')} />
        ) : (
          <OurStoryTimeline onBack={() => setCurrentPage('home')} />
        );
      case 'reasons':
        return isMobile ? (
          <ReasonsILoveYouMobile onBack={() => setCurrentPage('home')} />
        ) : (
          <ReasonsILoveYou onBack={() => setCurrentPage('home')} />
        );
      case 'letters':
        return isMobile ? (
          <VirtualLoveLettersMobile onBack={() => setCurrentPage('home')} />
        ) : (
          <VirtualLoveLetters onBack={() => setCurrentPage('home')} />
        );
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
      <NotificationBell />
      
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
