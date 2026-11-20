export type UserRole = 'student' | 'organiser';

export type AppScreen = 'login' | 'student' | 'organiser';

export const EVENT_CATEGORIES = [
  'Tech & AI',
  'Arts & Culture',
  'Sports',
  'Career',
  'Social',
  'Academic',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  organiserName: string;
  capacity: number;
  attendeesCount: number;
  imageUrl: string;
  createdAt: string;
  isCustom?: boolean;
}

export interface UserSession {
  role: UserRole;
  name: string;
  email: string;
  affiliation: string;
}

export const CATEGORY_COVER_MAP: Record<EventCategory, string> = {
  'Tech & AI': '/src/assets/images/campus_tech_hackathon_1795212846179.jpg',
  'Arts & Culture': '/src/assets/images/campus_arts_gallery_1795212845961.jpg',
  Sports: '/src/assets/images/campus_sports_intramural_1795212846170.jpg',
  Career: '/src/assets/images/campus_career_symposium_1795212846290.jpg',
  Social: '/src/assets/images/campus_quad_festival_1795212846586.jpg',
  Academic: '/src/assets/images/campus_career_symposium_1795212846290.jpg',
};

export const COVER_OPTIONS: { label: string; url: string }[] = [
  {
    label: 'Engineering Atrium',
    url: '/src/assets/images/campus_tech_hackathon_1795212846179.jpg',
  },
  {
    label: 'Campus Gallery',
    url: '/src/assets/images/campus_arts_gallery_1795212845961.jpg',
  },
  {
    label: 'Main Auditorium',
    url: '/src/assets/images/campus_career_symposium_1795212846290.jpg',
  },
  {
    label: 'Historic Quad',
    url: '/src/assets/images/campus_quad_festival_1795212846586.jpg',
  },
  {
    label: 'Athletics Arena',
    url: '/src/assets/images/campus_sports_intramural_1795212846170.jpg',
  },
];
