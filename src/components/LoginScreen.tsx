import { useState } from 'react';
import { ArrowRight, GraduationCap, Megaphone } from 'lucide-react';
import type { UserRole, UserSession } from '../types';
import { EventCoverImage } from './EventCoverImage';

interface LoginScreenProps {
  initialRole: UserRole;
  totalEvents: number;
  totalRegistrations: number;
  onLogin: (session: UserSession) => void;
}

const ROLE_DEFAULTS: Record<
  UserRole,
  {
    name: string;
    email: string;
    affiliation: string;
    summary: string;
    cta: string;
  }
> = {
  student: {
    name: 'Maya Lin',
    email: 'maya.lin@university.edu',
    affiliation: 'Class of 2027 · Computer Science',
    summary:
      'Discover lectures, hackathons, intramurals, and evening quad concerts with live seat availability.',
    cta: 'Enter Student Event Feed',
  },
  organiser: {
    name: 'Alex Rivera',
    email: 'events@studentunion.edu',
    affiliation: 'Student Activities Board',
    summary:
      'Publish campus events to the live student feed, track RSVPs in real time, and draft copy with Gemini AI.',
    cta: 'Enter Organiser Dashboard',
  },
};

export function LoginScreen({
  initialRole,
  totalEvents,
  totalRegistrations,
  onLogin,
}: LoginScreenProps) {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState<string>(ROLE_DEFAULTS[initialRole].name);
  const [email, setEmail] = useState<string>(ROLE_DEFAULTS[initialRole].email);
  const [affiliation, setAffiliation] = useState<string>(
    ROLE_DEFAULTS[initialRole].affiliation
  );
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleRoleToggle = (nextRole: UserRole) => {
    setRole(nextRole);
    setName(ROLE_DEFAULTS[nextRole].name);
    setEmail(ROLE_DEFAULTS[nextRole].email);
    setAffiliation(ROLE_DEFAULTS[nextRole].affiliation);
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) {
      setErrorMessage('Please enter both your name and university email.');
      return;
    }
    onLogin({
      role,
      name: trimmedName,
      email: trimmedEmail,
      affiliation: affiliation.trim() || ROLE_DEFAULTS[role].affiliation,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left column: Sign-in form and role toggle */}
          <div className="lg:col-span-6 flex flex-col justify-center bg-white border border-slate-200 rounded-2xl p-6 sm:p-10">
            <div className="mb-8">
              <div className="font-display text-2xl font-bold tracking-tight text-slate-900 mb-3">
                CampusPulse
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-[1.15] text-balance mb-3">
                Your university calendar, live in one place.
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-lg">
                {ROLE_DEFAULTS[role].summary}
              </p>
            </div>

            {/* Student vs Organiser Role Toggle */}
            <div className="mb-6">
              <span className="block text-xs font-semibold text-slate-700 mb-2">
                Select Workspace Role
              </span>
              <div
                role="group"
                aria-label="Account role selector"
                className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200"
              >
                <button
                  type="button"
                  onClick={() => handleRoleToggle('student')}
                  aria-pressed={role === 'student'}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all whitespace-nowrap min-h-[42px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    role === 'student'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleToggle('organiser')}
                  aria-pressed={role === 'organiser'}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all whitespace-nowrap min-h-[42px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    role === 'organiser'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Megaphone className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Organiser</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-name"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="login-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    University Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-affiliation"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    {role === 'student' ? 'Major / Class Year' : 'Club / Department'}
                  </label>
                  <input
                    id="login-affiliation"
                    type="text"
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    placeholder={
                      role === 'student'
                        ? 'Class of 2027'
                        : 'Student Activities Board'
                    }
                    className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              {errorMessage && (
                <p
                  role="alert"
                  className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2"
                >
                  {errorMessage}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors min-h-[44px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <span>{ROLE_DEFAULTS[role].cta}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                Signing in as{' '}
                <strong className="font-semibold text-slate-800">
                  {role === 'student' ? 'Student Attendee' : 'Campus Organiser'}
                </strong>
              </span>
              <span>Events and RSVPs save locally in your browser</span>
            </div>
          </div>

          {/* Right column: Campus editorial photography */}
          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-slate-200 min-h-[340px] lg:min-h-[560px]">
            <EventCoverImage
              src="/src/assets/images/campus_quad_festival_1795212846586.jpg"
              alt="Students gathered on the historic university quad at dusk under string lights"
              title="CampusPulse Quad Gathering"
              className="lg:h-full"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">
              <p className="text-xs font-medium text-slate-200 mb-2">
                Fall Term Directory · Live Campus Schedule
              </p>
              <p className="font-display text-xl sm:text-2xl font-semibold leading-snug text-balance mb-5">
                From engineering build nights to late-afternoon gallery walks across every quad.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/20">
                <div>
                  <div className="font-mono text-2xl font-semibold tabular-nums">
                    {totalEvents}
                  </div>
                  <div className="text-xs text-slate-200 mt-0.5">
                    Published Events
                  </div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-semibold tabular-nums">
                    {totalRegistrations}
                  </div>
                  <div className="text-xs text-slate-200 mt-0.5">
                    Live Student RSVPs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
