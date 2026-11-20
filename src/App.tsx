import { useEffect, useMemo, useState } from 'react';
import type { AppScreen, CampusEvent, UserRole, UserSession } from './types';
import {
  loadEvents,
  loadRsvps,
  loadSession,
  resetEventsToSeed,
  saveEvents,
  saveRsvps,
  saveSession,
} from './utils/storage';
import { TopNav } from './components/TopNav';
import { LoginScreen } from './components/LoginScreen';
import { StudentFeed } from './components/StudentFeed';
import { OrganiserDashboard } from './components/OrganiserDashboard';

const DEFAULT_SESSIONS: Record<UserRole, UserSession> = {
  student: {
    role: 'student',
    name: 'Maya Lin',
    email: 'maya.lin@university.edu',
    affiliation: 'Class of 2027 · Computer Science',
  },
  organiser: {
    role: 'organiser',
    name: 'Alex Rivera',
    email: 'events@studentunion.edu',
    affiliation: 'Student Activities Board',
  },
};

export default function App() {
  const [events, setEvents] = useState<CampusEvent[]>(() => loadEvents());
  const [rsvpIds, setRsvpIds] = useState<string[]>(() => loadRsvps());
  const [session, setSession] = useState<UserSession | null>(() => loadSession());
  const [activeScreen, setActiveScreen] = useState<AppScreen>(() => {
    const saved = loadSession();
    if (!saved) return 'login';
    return saved.role === 'organiser' ? 'organiser' : 'student';
  });

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  useEffect(() => {
    saveRsvps(rsvpIds);
  }, [rsvpIds]);

  const totalRegistrations = useMemo(
    () => events.reduce((sum, ev) => sum + ev.attendeesCount, 0),
    [events]
  );

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    saveSession(newSession);
    setActiveScreen(newSession.role === 'organiser' ? 'organiser' : 'student');
  };

  const handleNavigate = (screen: AppScreen, nextRole?: UserRole) => {
    if (screen === 'login') {
      setActiveScreen('login');
      return;
    }

    const targetRole: UserRole =
      nextRole ?? (screen === 'organiser' ? 'organiser' : 'student');

    if (!session || session.role !== targetRole) {
      const updatedSession = DEFAULT_SESSIONS[targetRole];
      setSession(updatedSession);
      saveSession(updatedSession);
    }
    setActiveScreen(screen);
  };

  const handleSignOut = () => {
    setSession(null);
    saveSession(null);
    setActiveScreen('login');
  };

  const handleToggleRsvp = (eventId: string) => {
    const alreadyGoing = rsvpIds.includes(eventId);
    setRsvpIds((prev) =>
      alreadyGoing ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const delta = alreadyGoing ? -1 : 1;
        return {
          ...ev,
          attendeesCount: Math.max(0, ev.attendeesCount + delta),
        };
      })
    );
  };

  const handlePublishEvent = (newEvent: CampusEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    setRsvpIds((prev) => prev.filter((id) => id !== eventId));
  };

  const handleResetEvents = () => {
    const fresh = resetEventsToSeed();
    setEvents(fresh);
    setRsvpIds([]);
  };

  const activeSession = session ?? DEFAULT_SESSIONS.student;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {activeScreen !== 'login' && (
        <TopNav
          activeScreen={activeScreen}
          activeRole={activeSession.role}
          onNavigate={handleNavigate}
          onSignOut={handleSignOut}
        />
      )}

      {activeScreen === 'login' && (
        <LoginScreen
          initialRole={session?.role ?? 'student'}
          totalEvents={events.length}
          totalRegistrations={totalRegistrations}
          onLogin={handleLogin}
        />
      )}

      {activeScreen === 'student' && (
        <StudentFeed
          events={events}
          rsvpIds={rsvpIds}
          session={
            session?.role === 'student' ? session : DEFAULT_SESSIONS.student
          }
          onToggleRsvp={handleToggleRsvp}
          onOpenOrganiser={() => handleNavigate('organiser', 'organiser')}
        />
      )}

      {activeScreen === 'organiser' && (
        <OrganiserDashboard
          events={events}
          session={
            session?.role === 'organiser'
              ? session
              : DEFAULT_SESSIONS.organiser
          }
          onPublishEvent={handlePublishEvent}
          onDeleteEvent={handleDeleteEvent}
          onResetEvents={handleResetEvents}
          onNavigateFeed={() => handleNavigate('student', 'student')}
        />
      )}
    </div>
  );
}
