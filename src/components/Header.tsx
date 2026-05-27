import { Link, useLocation } from 'react-router-dom';
import { Calculator } from 'lucide-react';

export function Header() {
  const location = useLocation();
  const isCalculator = location.pathname.startsWith('/calculator') || 
                       location.pathname.startsWith('/unlock') || 
                       location.pathname.startsWith('/results');
  
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-primary">
            <Calculator className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground leading-tight">InstaCoverage</span>
            <span className="text-xs text-muted-foreground leading-tight">AI</span>
          </div>
        </Link>
        
        {!isCalculator && (
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/trust" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Trust Center
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
