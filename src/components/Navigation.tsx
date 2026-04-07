import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sprout } from 'lucide-react';
import { useState, useEffect } from 'react';

type ApiStatus = 'checking' | 'online' | 'offline';

function ApiStatusDot({ status }: { status: ApiStatus }) {
  if (status === 'checking') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-forest-muted">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="hidden sm:inline">Waking up</span>
      </span>
    );
  }
  if (status === 'online') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-forest-muted">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="hidden sm:inline">API online</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-forest-muted">
      <span className="w-2 h-2 rounded-full bg-red-400" />
      <span className="hidden sm:inline">API offline</span>
    </span>
  );
}

export function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Poll API health every 60 s
  useEffect(() => {
    let cancelled = false;
    const check = () => {
      fetch('https://imtisal-maize-api.onrender.com/')
        .then((r) => { if (!cancelled) setApiStatus(r.ok ? 'online' : 'offline'); })
        .catch(() => { if (!cancelled) setApiStatus('offline'); });
    };
    check();
    const id = setInterval(check, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const links = [
    { path: '/',            label: 'Dashboard' },
    { path: '/forecaster',  label: 'Price Forecaster' },
    { path: '/performance', label: 'Model Performance' },
    { path: '/validation',  label: 'Validation' },
    { path: '/guide',       label: 'System Guide' },
    { path: '/about',       label: 'About' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-nav' : 'border-b border-forest-border'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
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

          {/* Desktop nav — scrollable on smaller screens */}
          <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto flex-1 justify-center">
            {links.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-150 ${
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

          {/* Right side: API status + flag */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <ApiStatusDot status={apiStatus} />
            <div className="flex items-center gap-2 pl-3 border-l border-forest-border">
              <span className="text-lg leading-none">🇳🇬</span>
              <span className="text-xs text-forest-muted font-medium">Adamawa</span>
            </div>
          </div>

          {/* Mobile: status dot + hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <ApiStatusDot status={apiStatus} />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-forest-muted hover:text-forest hover:bg-forest-50 transition-colors duration-150"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
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
            <div className="px-4 pt-2 pb-1 flex items-center justify-between border-t border-forest-border mt-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇳🇬</span>
                <span className="text-xs text-forest-muted">Adamawa State, Nigeria</span>
              </div>
              <ApiStatusDot status={apiStatus} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
