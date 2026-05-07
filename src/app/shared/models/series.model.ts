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
  },
];
