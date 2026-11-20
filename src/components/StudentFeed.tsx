import { useMemo, useState } from 'react';
import { Check, Search, Users, X } from 'lucide-react';
import {
  EVENT_CATEGORIES,
  type CampusEvent,
  type EventCategory,
  type UserSession,
} from '../types';
import { formatEventDate, formatEventTime } from '../utils/storage';
import { EventCoverImage } from './EventCoverImage';

interface StudentFeedProps {
  events: CampusEvent[];
  rsvpIds: string[];
  session: UserSession;
  onToggleRsvp: (eventId: string) => void;
  onOpenOrganiser: () => void;
}

type CategoryFilter = 'All' | EventCategory;

export function StudentFeed({
  events,
  rsvpIds,
  session,
  onToggleRsvp,
  onOpenOrganiser,
}: StudentFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [onlyGoing, setOnlyGoing] = useState(false);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events.filter((ev) => {
      if (selectedCategory !== 'All' && ev.category !== selectedCategory) {
        return false;
      }
      if (onlyGoing && !rsvpIds.includes(ev.id)) {
        return false;
      }
      if (!q) return true;
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        ev.organiserName.toLowerCase().includes(q) ||
        ev.category.toLowerCase().includes(q)
      );
    });
  }, [events, searchQuery, selectedCategory, onlyGoing, rsvpIds]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setOnlyGoing(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">
            {session.name} · {session.affiliation}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
            Upcoming Campus Events
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <span className="tabular-nums">
            <strong className="font-semibold text-slate-900">
              {filteredEvents.length}
            </strong>{' '}
            {filteredEvents.length === 1 ? 'event' : 'events'} shown
            {' · '}
            <strong className="font-semibold text-slate-900">
              {rsvpIds.length}
            </strong>{' '}
            attending
          </span>
          <button
            type="button"
            onClick={onOpenOrganiser}
            className="text-sm font-semibold text-blue-700 hover:text-blue-800 underline underline-offset-4 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
          >
            Host an Event
          </button>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="py-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="student-event-search" className="sr-only">
              Search campus events
            </label>
            <input
              id="student-event-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event name, club, or campus hall..."
              className="w-full pl-10 pr-10 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOnlyGoing((prev) => !prev)}
            aria-pressed={onlyGoing}
            className={`px-4 py-2.5 text-sm font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 min-h-[42px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              onlyGoing
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            My Schedule ({rsvpIds.length})
          </button>
        </div>

        {/* Segmented Category Filter Controls */}
        <div
          role="group"
          aria-label="Filter events by category"
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 border border-slate-200 rounded-xl w-fit max-w-full"
        >
          {(['All', ...EVENT_CATEGORIES] as CategoryFilter[]).map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={active}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Event Cards Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <h2 className="font-display text-xl font-semibold text-slate-900 mb-2">
            No campus events match your filters
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
            Try clearing your search terms or switching back to all categories to see what student clubs have scheduled.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors min-h-[40px] whitespace-nowrap"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const isGoing = rsvpIds.includes(ev.id);
            return (
              <article
                key={ev.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden border-b border-slate-200">
                  <EventCoverImage
                    src={ev.imageUrl}
                    alt={`${ev.title} at ${ev.venue}`}
                    title={ev.title}
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  {/* Zero-pill unboxed metadata */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500 mb-2">
                    <span className="text-blue-700 font-semibold">
                      {ev.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatEventDate(ev.date)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {formatEventTime(ev.time)}
                    </span>
                  </div>

                  <h2 className="font-display text-lg font-semibold text-slate-900 leading-snug mb-1.5">
                    {ev.title}
                  </h2>

                  <p className="text-xs font-medium text-slate-600 mb-3">
                    {ev.venue} · {ev.organiserName}
                  </p>

                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-5">
                    {ev.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 tabular-nums">
                      <Users
                        className="w-4 h-4 text-slate-400 shrink-0"
                        aria-hidden="true"
                      />
                      <span>
                        <strong className="font-semibold text-slate-900">
                          {ev.attendeesCount}
                        </strong>
                        {' / '}
                        {ev.capacity} going
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleRsvp(ev.id)}
                      aria-pressed={isGoing}
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                        isGoing
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-blue-700 text-white hover:bg-blue-800'
                      }`}
                    >
                      {isGoing && (
                        <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                      )}
                      <span>{isGoing ? 'Going' : "I'm Going"}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
