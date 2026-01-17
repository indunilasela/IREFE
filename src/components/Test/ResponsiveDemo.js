import React from 'react';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  ChevronLeft, 
  ChevronRight, 
  Keyboard,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const ResponsiveDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Fully Responsive Layout
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Complete with arrow key navigation and sliding sidebar
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Mobile First</h3>
              </div>
              <p className="text-sm text-gray-600">
                Optimized for mobile devices with touch-friendly navigation and responsive breakpoints.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Keyboard className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Arrow Keys</h3>
              </div>
              <p className="text-sm text-gray-600">
                Press <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Ctrl</kbd> + <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">←</kbd> or <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">→</kbd> to toggle sidebar.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Tablet className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Sliding Sidebar</h3>
              </div>
              <p className="text-sm text-gray-600">
                Smooth animations and transitions for the navigation sidebar on all devices.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Keyboard className="h-6 w-6 mr-3 text-blue-600" />
            How to Use
          </h2>

          <div className="space-y-4">
            {/* Desktop Navigation */}
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Desktop Navigation</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 mr-2 text-blue-600" />
                    Click the arrow button on the left edge to toggle sidebar
                  </li>
                  <li className="flex items-center">
                    <Keyboard className="h-4 w-4 mr-2 text-blue-600" />
                    Press <kbd className="bg-white px-2 py-1 rounded text-xs mx-1">Ctrl</kbd> + <kbd className="bg-white px-2 py-1 rounded text-xs mx-1">←</kbd> to hide sidebar
                  </li>
                  <li className="flex items-center">
                    <Keyboard className="h-4 w-4 mr-2 text-blue-600" />
                    Press <kbd className="bg-white px-2 py-1 rounded text-xs mx-1">Ctrl</kbd> + <kbd className="bg-white px-2 py-1 rounded text-xs mx-1">→</kbd> to show sidebar
                  </li>
                </ul>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex items-start space-x-4 p-4 bg-indigo-50 rounded-lg">
              <div className="flex-shrink-0">
                <Smartphone className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Mobile Navigation</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 mr-2 text-indigo-600" />
                    Tap the arrow button to open the sidebar
                  </li>
                  <li className="flex items-center">
                    <Eye className="h-4 w-4 mr-2 text-indigo-600" />
                    Sidebar slides in from the left with overlay
                  </li>
                  <li className="flex items-center">
                    <EyeOff className="h-4 w-4 mr-2 text-indigo-600" />
                    Tap outside or on overlay to close sidebar
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Responsive Breakpoints */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Responsive Breakpoints
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-sm font-medium text-gray-900">Mobile</span>
                <span className="text-xs text-gray-600">&lt; 640px</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-sm font-medium text-gray-900">Tablet</span>
                <span className="text-xs text-gray-600">640px - 1023px</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-gray-900">Desktop</span>
                <span className="text-xs text-gray-600">&gt; 1024px</span>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <span className="text-sm text-gray-700">Smooth slide animations</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <span className="text-sm text-gray-700">Keyboard shortcuts (Ctrl + Arrow keys)</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <span className="text-sm text-gray-700">Touch-friendly mobile overlay</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <span className="text-sm text-gray-700">Accessible focus states</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <span className="text-sm text-gray-700">Automatic sidebar behavior based on screen size</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Demo Content Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Demo Content Area
          </h2>
          <p className="text-gray-600 mb-4">
            This is the main content area. The layout automatically adjusts based on:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">Screen Size</div>
              <p className="text-sm text-gray-600">Responsive breakpoints for all devices</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 mb-2">Navigation</div>
              <p className="text-sm text-gray-600">Keyboard and mouse/touch support</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">Animation</div>
              <p className="text-sm text-gray-600">Smooth transitions and effects</p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
            <h3 className="text-lg font-bold mb-2">Try It Now!</h3>
            <p className="text-sm opacity-90 mb-4">
              Use the arrow button or keyboard shortcuts to toggle the sidebar and see the responsive behavior in action.
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Ctrl + ←</span>
              </div>
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg">
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">Ctrl + →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveDemo;