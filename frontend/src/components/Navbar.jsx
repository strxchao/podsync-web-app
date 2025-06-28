// File: frontend/src/components/Navbar.jsx - RESPONSIVE VERSION

import { Navbar as FlowbiteNavbar } from 'flowbite-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <FlowbiteNavbar fluid={false} className="bg-white shadow-lg border-b sticky top-0 z-50">
      {/* Container dengan padding yang sama dengan konten */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand/Logo */}
          <FlowbiteNavbar.Brand as={Link} to="/" className="flex items-center">
            <img 
              src="/podsync_logo.svg" 
              className="mr-3 h-6 sm:h-8 transition-all duration-200 hover:scale-105" 
              alt="PodSync Logo" 
            />
          </FlowbiteNavbar.Brand>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                isActive('/') 
                  ? 'text-green-700 bg-green-100 shadow-sm' 
                  : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
              }`}
            >
              Dashboard
            </Link>
            
            <Link 
              to="/schedule" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                isActive('/schedule') 
                  ? 'text-green-700 bg-green-100 shadow-sm' 
                  : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
              }`}
            >
              Schedule
            </Link>
            
            <Link 
              to="/signage-content" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                isActive('/signage-content') 
                  ? 'text-green-700 bg-green-100 shadow-sm' 
                  : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
              }`}
            >
              Signage Content
            </Link>
            
            <Link 
              to="/analytics" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                isActive('/analytics') 
                  ? 'text-green-700 bg-green-100 shadow-sm' 
                  : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
              }`}
            >
              Analytics
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-green-700 hover:bg-green-50 transition-colors duration-200"
            onClick={toggleMobileMenu}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            <Link 
              to="/" 
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                isActive('/') 
                  ? 'text-green-700 bg-green-100 shadow-sm' 
                  : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
              }`}
              onClick={closeMobileMenu}
            >
              Dashboard
            </Link>
            
            <Link 
              to="/schedule" 
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                isActive('/schedule') 
                  ? 'text-green-700 bg-green-100 shadow-sm' 
                  : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
              }`}
              onClick={closeMobileMenu}
            >
              Schedule
            </Link>
            
            <Link 
              to="/signage-content" 
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                isActive('/signage-content') 
                  ? 'text-green-700 bg-green-100 shadow-sm' 
                  : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
              }`}
              onClick={closeMobileMenu}
            >
              Signage Content
            </Link>
            
            <Link 
              to="/analytics" 
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                isActive('/analytics') 
                  ? 'text-green-700 bg-green-100 shadow-sm' 
                  : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
              }`}
              onClick={closeMobileMenu}
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>
    </FlowbiteNavbar>
  );
}