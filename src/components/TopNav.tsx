import type { AppScreen, UserRole } from '../types';

interface TopNavProps {
  activeScreen: AppScreen;
  activeRole: UserRole;
  onNavigate: (screen: AppScreen, nextRole?: UserRole) => void;
  onSignOut: () => void;
}

export function TopNav({
  activeScreen,
  activeRole,
  onNavigate,
  onSignOut,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() =>
            onNavigate(activeRole === 'organiser' ? 'organiser' : 'student')
          }
          className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded"
        >
          CampusPulse
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-6 sm:gap-8 overflow-x-auto"
        >
          <button
            type="button"
            onClick={() => onNavigate('student', 'student')}
            className={`py-1.5 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-t ${
              activeScreen === 'student'
                ? 'border-blue-700 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Student Feed
          </button>

          <button
            type="button"
            onClick={() => onNavigate('organiser', 'organiser')}
            className={`py-1.5 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-t ${
              activeScreen === 'organiser'
                ? 'border-blue-700 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Organiser Studio
          </button>

          <button
            type="button"
            onClick={() => onNavigate('login')}
            className={`py-1.5 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-t ${
              activeScreen === 'login'
                ? 'border-blue-700 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Role Login
          </button>
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onSignOut}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
