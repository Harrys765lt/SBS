import { Button } from './ui/button';
import { Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onAuthClick: () => void;
}

export function Navbar({ onNavigate, currentPage, onAuthClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Browse', page: 'browse' },
    { label: 'Categories', page: 'categories' },
    { label: 'How it works', page: 'how-it-works' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fein Booking
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`text-sm transition-all duration-300 relative group ${
                  currentPage === link.page
                    ? 'text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {link.label}
                {currentPage === link.page && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Desktop Auth Button */}
          <div className="hidden md:block">
            <Button
              onClick={onAuthClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl px-6 h-11 hover:scale-105"
            >
              Sign in
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-[var(--color-text-primary)]" />
            ) : (
              <Menu className="w-6 h-6 text-[var(--color-text-primary)]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => {
                  onNavigate(link.page);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left transition-colors py-2 px-3 rounded-lg ${
                  currentPage === link.page
                    ? 'bg-gray-100 text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-gray-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <Button
              onClick={() => {
                onAuthClick();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 rounded-xl h-11"
            >
              Sign in
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
