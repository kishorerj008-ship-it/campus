import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  RotateCcw,
  Trash2,
  Wand2,
} from 'lucide-react';
import {
  CATEGORY_COVER_MAP,
  COVER_OPTIONS,
  EVENT_CATEGORIES,
  type CampusEvent,
  type EventCategory,
  type UserSession,
} from '../types';
import {
  formatEventDate,
  formatEventTime,
  loadSavedGeminiKey,
  saveGeminiKey,
} from '../utils/storage';

interface OrganiserDashboardProps {
  events: CampusEvent[];
  session: UserSession;
  onPublishEvent: (event: CampusEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onResetEvents: () => void;
  onNavigateFeed: () => void;
}

export function OrganiserDashboard({
  events,
  session,
  onPublishEvent,
  onDeleteEvent,
  onResetEvents,
  onNavigateFeed,
}: OrganiserDashboardProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-11-28');
  const [time, setTime] = useState('18:30');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState('120');
  const [organiserName, setOrganiserName] = useState(
    session.affiliation || 'Student Activities Board'
  );
  const [category, setCategory] = useState<EventCategory>('Tech & AI');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState<string>(
    CATEGORY_COVER_MAP['Tech & AI']
  );
  const [coverManuallySelected, setCoverManuallySelected] = useState(false);

  // Gemini API Key & Auto-Fill state
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() =>
    loadSavedGeminiKey()
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuccessNote, setAiSuccessNote] = useState('');

  // Form submission state
  const [formError, setFormError] = useState('');
  const [publishedTitle, setPublishedTitle] = useState('');

  // Live metrics computed directly from state
  const metrics = useMemo(() => {
    const totalRegistrations = events.reduce(
      (sum, ev) => sum + ev.attendeesCount,
      0
    );
    const totalCapacity = events.reduce((sum, ev) => sum + ev.capacity, 0);
    const fillRate =
      totalCapacity > 0
        ? Math.round((totalRegistrations / totalCapacity) * 100)
        : 0;

    const countsByCategory = new Map<string, number>();
    for (const ev of events) {
      countsByCategory.set(
        ev.category,
        (countsByCategory.get(ev.category) ?? 0) + ev.attendeesCount
      );
    }
    let topCategory = 'None';
    let maxCount = -1;
    for (const [cat, count] of countsByCategory.entries()) {
      if (count > maxCount) {
        maxCount = count;
        topCategory = cat;
      }
    }

    return {
      totalEvents: events.length,
      totalRegistrations,
      fillRate,
      topCategory,
    };
  }, [events]);

  const handleApiKeyChange = (value: string) => {
    setGeminiApiKey(value);
    saveGeminiKey(value);
    if (aiError) setAiError('');
  };

  const handleCategoryChange = (nextCategory: EventCategory) => {
    setCategory(nextCategory);
    if (!coverManuallySelected) {
      setCoverUrl(CATEGORY_COVER_MAP[nextCategory]);
    }
  };

  const handleAutoFillWithAI = async () => {
    setAiError('');
    setAiSuccessNote('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setAiError(
        'Enter an Event Title first so Gemini knows what to draft.'
      );
      return;
    }

    setIsAutoFilling(true);
    try {
      const response = await fetch('/api/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          venue: venue.trim(),
          date,
          time,
          apiKey: geminiApiKey.trim(),
        }),
      });

      const data = (await response.json()) as {
        category?: EventCategory;
        description?: string;
        error?: string;
      };

      if (!response.ok) {
        setAiError(
          data.error || 'Could not generate event details with Gemini.'
        );
        return;
      }

      if (data.category && EVENT_CATEGORIES.includes(data.category)) {
        setCategory(data.category);
        if (!coverManuallySelected) {
          setCoverUrl(CATEGORY_COVER_MAP[data.category]);
        }
      }
      if (data.description) {
        setDescription(data.description);
      }
      setAiSuccessNote('Description and category drafted with Gemini.');
    } catch {
      setAiError(
        'Network error reaching the server. Make sure the CampusPulse server is running.'
      );
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setPublishedTitle('');

    const trimmedTitle = title.trim();
    const trimmedVenue = venue.trim();
    const trimmedDesc = description.trim();
    const parsedCapacity = Number(capacity);

    if (!trimmedTitle) {
      setFormError('Please enter an event title.');
      return;
    }
    if (!trimmedVenue) {
      setFormError('Please enter a campus venue or room.');
      return;
    }
    if (!trimmedDesc) {
      setFormError(
        'Please write an event description or use Auto-Fill with AI.'
      );
      return;
    }

    const newEvent: CampusEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: trimmedTitle,
      description: trimmedDesc,
      category,
      date: date || '2026-11-28',
      time: time || '18:00',
      venue: trimmedVenue,
      organiserName: organiserName.trim() || 'Campus Organiser',
      capacity:
        Number.isFinite(parsedCapacity) && parsedCapacity > 0
          ? Math.round(parsedCapacity)
          : 120,
      attendeesCount: 1,
      imageUrl: coverUrl || CATEGORY_COVER_MAP[category],
      createdAt: new Date().toISOString(),
      isCustom: true,
    };

    onPublishEvent(newEvent);
    setPublishedTitle(trimmedTitle);
    setTitle('');
    setVenue('');
    setDescription('');
    setAiSuccessNote('');
    setCoverManuallySelected(false);
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
            Organiser Event Studio
          </h1>
        </div>

        <button
          type="button"
          onClick={onNavigateFeed}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span>Preview Student Feed</span>
          <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </button>
      </div>

      {/* Live Metrics Strip */}
      <section
        aria-label="Live event metrics"
        className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200 my-6"
      >
        <div className="p-5">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Published Events
          </div>
          <div className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {metrics.totalEvents}
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Total Registrations
          </div>
          <div className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {metrics.totalRegistrations}
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Overall Capacity Filled
          </div>
          <div className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {metrics.fillRate}%
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-slate-500 mb-1">
            Top Category by RSVP
          </div>
          <div className="font-display text-lg font-semibold text-slate-900 truncate pt-1">
            {metrics.topCategory}
          </div>
        </div>
      </section>

      {/* Main 2-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Create & Publish Event Form */}
        <section
          aria-labelledby="create-event-heading"
          className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6"
        >
          <h2
            id="create-event-heading"
            className="font-display text-xl font-bold text-slate-900 mb-1"
          >
            Create Campus Event
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            New events publish directly to the live Student Event Feed.
          </p>

          {publishedTitle && (
            <div
              role="status"
              className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5 text-sm text-emerald-900">
                <CheckCircle2
                  className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <span className="font-semibold">{publishedTitle}</span> is now
                  live on the Student Event Feed.
                </div>
              </div>
              <button
                type="button"
                onClick={onNavigateFeed}
                className="text-xs font-semibold text-emerald-800 underline underline-offset-2 whitespace-nowrap shrink-0"
              >
                Open Feed
              </button>
            </div>
          )}

          <form onSubmit={handlePublishSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="event-title"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Event Title
              </label>
              <input
                id="event-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midnight Robotics Hackathon"
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="event-date"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Date
                </label>
                <input
                  id="event-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 tabular-nums"
                />
              </div>

              <div>
                <label
                  htmlFor="event-time"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Start Time
                </label>
                <input
                  id="event-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label
                  htmlFor="event-venue"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Campus Venue
                </label>
                <input
                  id="event-venue"
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Gates Hall 104"
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="event-capacity"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Capacity
                </label>
                <input
                  id="event-capacity"
                  type="number"
                  min={5}
                  max={5000}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 tabular-nums"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="event-organiser"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Hosting Club or Department
              </label>
              <input
                id="event-organiser"
                type="text"
                value={organiserName}
                onChange={(e) => setOrganiserName(e.target.value)}
                placeholder="Student Activities Board"
                className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            {/* Gemini AI Auto-Fill Section (separated by hairline divider, no nested card) */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="gemini-api-key"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Gemini API Key
                </label>
                {geminiApiKey && (
                  <button
                    type="button"
                    onClick={() => handleApiKeyChange('')}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 underline underline-offset-2"
                  >
                    Clear key
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  id="gemini-api-key"
                  type={showApiKey ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="Paste your Gemini API key (AIza...)"
                  autoComplete="off"
                  className="w-full pl-3.5 pr-10 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((prev) => !prev)}
                  aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-800 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-slate-500 leading-snug">
                  Enter an event title above, then draft category and description with Gemini.
                </p>
                <button
                  type="button"
                  onClick={handleAutoFillWithAI}
                  disabled={isAutoFilling}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {isAutoFilling ? (
                    <>
                      <Loader2
                        className="w-4 h-4 animate-spin shrink-0"
                        aria-hidden="true"
                      />
                      <span>Drafting...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Auto-Fill with AI</span>
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <p
                  role="alert"
                  className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                >
                  {aiError}
                </p>
              )}

              {aiSuccessNote && (
                <p
                  role="status"
                  className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2"
                >
                  {aiSuccessNote}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-4">
              <div>
                <label
                  htmlFor="event-category"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Category
                </label>
                <select
                  id="event-category"
                  value={category}
                  onChange={(e) =>
                    handleCategoryChange(e.target.value as EventCategory)
                  }
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="event-description"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Event Description
                </label>
                <textarea
                  id="event-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what students can expect, speakers, or supplies provided..."
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 leading-relaxed"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-2">
                  Campus Cover Photo
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {COVER_OPTIONS.map((opt) => {
                    const selected = coverUrl === opt.url;
                    return (
                      <button
                        key={opt.url}
                        type="button"
                        onClick={() => {
                          setCoverUrl(opt.url);
                          setCoverManuallySelected(true);
                        }}
                        title={opt.label}
                        aria-label={`Select ${opt.label} cover`}
                        aria-pressed={selected}
                        className={`relative aspect-[4/3] rounded-md overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                          selected
                            ? 'border-blue-700 ring-1 ring-blue-700'
                            : 'border-slate-200 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={opt.url}
                          alt={opt.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {formError && (
              <p
                role="alert"
                className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors min-h-[44px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Publish Campus Event
            </button>
          </form>
        </section>

        {/* Right: Published Events Management Table */}
        <section
          aria-labelledby="published-events-heading"
          className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h2
                id="published-events-heading"
                className="font-display text-lg font-bold text-slate-900"
              >
                Live Campus Schedule ({events.length})
              </h2>
              <p className="text-xs text-slate-500">
                Registration counts update in real time as students click I&apos;m Going.
              </p>
            </div>
            <button
              type="button"
              onClick={onResetEvents}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Reset Demo Data</span>
            </button>
          </div>

          {events.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-slate-800 mb-1">
                No published events yet
              </p>
              <p className="text-xs text-slate-500">
                Use the Create Campus Event form to publish your first event.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-6">Event</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Registrations</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {events.map((ev) => {
                    const pct = Math.min(
                      100,
                      Math.round((ev.attendeesCount / Math.max(1, ev.capacity)) * 100)
                    );
                    return (
                      <tr
                        key={ev.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3.5 px-6 align-top">
                          <div className="font-semibold text-slate-900 leading-snug">
                            {ev.title}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                            {formatEventDate(ev.date)} · {formatEventTime(ev.time)} ·{' '}
                            {ev.venue}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-top text-xs font-medium text-slate-700 whitespace-nowrap">
                          {ev.category}
                        </td>
                        <td className="py-3.5 px-4 align-top text-right">
                          <div className="font-mono text-xs font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                            {ev.attendeesCount} / {ev.capacity}
                          </div>
                          <div className="w-24 ml-auto h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                            <div
                              className="h-full bg-blue-700 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-6 align-top text-right">
                          <button
                            type="button"
                            onClick={() => onDeleteEvent(ev.id)}
                            aria-label={`Remove ${ev.title}`}
                            className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
