import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sprout } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const links = [
    { path: '/', label: 'Dashboard' },
    { path: '/forecaster', label: 'Price Forecaster' },
    { path: '/performance', label: 'Model Performance' },
    { path: '/about', label: 'About' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-nav' : 'border-b border-forest-border'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-forest flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <Sprout size={18} className="text-white" />
            </div>
            <div className="leading-none">
              <div className="text-base font-bold text-forest-dark tracking-tight font-display">
                IMTISAL
              </div>
              <div className="text-[10px] text-forest-muted font-medium tracking-widest uppercase mt-0.5">
                Maize Price System
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    active
                      ? 'text-forest bg-forest-50'
                      : 'text-forest-muted hover:text-forest hover:bg-forest-50'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Adamawa badge */}
          <div className="hidden md:flex items-center gap-2 pl-6 border-l border-forest-border">
            <span className="text-lg leading-none">🇳🇬</span>
            <span className="text-xs text-forest-muted font-medium">Adamawa State</span>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-forest-muted hover:text-forest hover:bg-forest-50 transition-colors duration-150"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-forest-border bg-white" style={{ animation: 'slideDown 0.2s ease-out both' }}>
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    active
                      ? 'bg-forest text-white'
                      : 'text-forest-muted hover:bg-forest-50 hover:text-forest'
                  }`}
                >
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-gold mr-3" />}
                  {link.label}
                </Link>
              );
            })}
            <div className="px-4 pt-2 pb-1 flex items-center gap-2 border-t border-forest-border mt-2">
              <span className="text-lg">🇳🇬</span>
              <span className="text-xs text-forest-muted">Adamawa State, Nigeria</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
