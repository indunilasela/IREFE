import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle arrow key navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Left arrow key (37) or ArrowLeft
      if (e.keyCode === 37 || e.key === 'ArrowLeft') {
        if (e.ctrlKey) {
          setSidebarOpen(false);
        }
      }
      // Right arrow key (39) or ArrowRight
      if (e.keyCode === 39 || e.key === 'ArrowRight') {
        if (e.ctrlKey) {
          setSidebarOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar */}
        <div
          className={`
            ${isMobile ? 'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out' : 'relative transition-all duration-300'}
            ${sidebarOpen ? 'translate-x-0' : (isMobile ? '-translate-x-full' : '-ml-64')}
            ${!isMobile && !sidebarOpen ? 'w-0' : 'w-64'}
          `}
        >
          <Sidebar />
        </div>

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>

        {/* Arrow Navigation Button */}
        <button
          onClick={toggleSidebar}
          className={`
            fixed top-20 z-30
            ${sidebarOpen ? (isMobile ? 'left-64' : 'left-64') : 'left-0'}
            bg-blue-600 text-white p-2 rounded-r-lg shadow-lg
            hover:bg-blue-700 transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${isMobile && sidebarOpen ? 'hidden' : ''}
          `}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          title={`Press ${sidebarOpen ? 'Ctrl+←' : 'Ctrl+→'} to toggle`}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="hidden lg:block fixed bottom-4 right-4 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-75">
        <p>Press <kbd className="bg-gray-700 px-2 py-1 rounded">Ctrl</kbd> + <kbd className="bg-gray-700 px-2 py-1 rounded">←</kbd> / <kbd className="bg-gray-700 px-2 py-1 rounded">→</kbd> to toggle sidebar</p>
      </div>
    </div>
  );
};

export default Layout;