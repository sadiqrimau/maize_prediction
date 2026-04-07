export function Footer() {
  return (
    <footer className="bg-white border-t border-forest-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-forest-muted text-center sm:text-left leading-relaxed">
            <span className="font-semibold text-forest-dark">IMTISAL</span> Maize Price Prediction System
            {' '}·{' '}Adamawa State, Nigeria
            {' '}·{' '}Al-Hikmah University 2026
          </p>
          <div className="flex items-center gap-4 text-xs text-forest-muted">
            <span>Data: FEWS NET · NASA POWER · NFPT</span>
            <span className="hidden sm:inline text-forest-border">|</span>
            <span className="hidden sm:inline">NGN per kg</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
