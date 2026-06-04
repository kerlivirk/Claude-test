import { EventStatus } from './event.model';

export interface Series {
  id: string;
  name: string;
  slug?: string;
  legalEntity?: string;
  description?: string;
  status: EventStatus;
  eventCount: number;
  eventIds: string[];
  mainEventId?: string;
  coverImage?: string;
  /**
   * Hidden / system-created series wrapping a "single" event. The backend always
   * stores Show/Series + Event as a pair; for events the user thinks of as
   * standalone, the wrapping series stays out of every user-facing surface
   * (events list, dropdowns, share dialogs). Promote via `attachEventToSeries`;
   * detach recreates a fresh hidden wrapper.
   */
  hidden?: boolean;

  /* Translations: language code -> { fieldKey -> value } (base language is the main fields) */
  translations?: Record<string, Record<string, string>>;

  /* Extended fields from the Create Series modal */
  importantInfo?: string;
  additionalDesc?: string;
  cashierInstructions?: string;
  posNotes?: string;
  category?: string;
  genre?: string;
  cast?: string;
  creators?: string;
  priceInfo?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  venue?: string;
  location?: string;
  subLocation?: string;
  seatingPlan?: string;
  organizerAccess?: 'all' | 'select';
  selectedOrganizers?: string;
  reviewHomepage?: string;
  reviewAuthor?: string;
  vodLinks?: string;
  poster?: string;
  photos?: string;
  photoSource?: string;
  multimedia?: string;
}

export const MOCK_SERIES: Series[] = [
  {
    id: 's1',
    name: 'Summer Jazz Festival 2026',
    slug: 'summer-jazz-festival-2026',
    legalEntity: 'PLG Estonia',
    description: 'Three nights of world-class jazz across Tallinn.',
    status: 'Scheduled',
    eventCount: 3,
    eventIds: ['1', '3'],
    mainEventId: '1',
    category: 'Festival',
    genre: 'Jazz',
  },
  {
    id: 's2',
    name: 'Comedy Tour 2026',
    slug: 'comedy-tour-2026',
    legalEntity: 'PLG Estonia',
    description: 'Stand-up tour across the Baltics.',
    status: 'Active',
    eventCount: 5,
    eventIds: ['4'],
    mainEventId: '4',
    category: 'Comedy',
    genre: 'Comedy',
  },
  {
    id: 's3',
    name: 'Art Gallery Series',
    slug: 'art-gallery-series',
    legalEntity: 'Kumu Art Museum',
    description: 'Recurring openings at Kumu.',
    status: 'Draft',
    eventCount: 2,
    eventIds: ['5'],
    category: 'Art',
    genre: 'Classical',
  },
];
