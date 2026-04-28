export type EventStatus = 'Active' | 'Scheduled' | 'Draft' | 'Hidden' | 'Ended' | 'Cancelled';
export type EventType = 'event' | 'series' | 'collection' | 'timeslot';
export type TicketSalesSource = 'biletomat' | 'external' | 'info-only';

export interface TicketType {
  id: string;
  name: string;
  displayName?: string;
  price: string;
  quantity: string;
  description?: string;
  vatRate?: string;
}

export interface Creator {
  id: string;
  name: string;
  role: string;
}

export interface EventLink {
  id: string;
  label: string;
  url: string;
}

export interface MultimediaLink {
  id: string;
  title: string;
  url: string;
}

export interface EventFormData {
  creationType?: EventType;
  slug?: string;
  autoSlug?: boolean;
  eventCategory?: string;
  selectedGenres?: string[];
  mainGenre?: string;
  descriptions?: Record<string, string>;
  names?: Record<string, string>;
  locationName?: string;
  locationAddress?: string;
  locationCity?: string;
  locationCountry?: string;
  selectedVenue?: string;
  selectedSubvenue?: string;
  eventDate?: string;
  eventTime?: string;
  eventEndDate?: string;
  eventEndTime?: string;
  timezone?: string;
  doorsOpenTime?: string;
  saleStartDate?: string;
  saleEndDate?: string;
  additionalDescription?: string;
  importantInfoUniversal?: string;
  creators?: Creator[];
  selectedArtists?: string[];
  artistsText?: string;
  ticketTypes?: TicketType[];
  ticketSalesSource?: TicketSalesSource;
  externalTicketUrl?: string;
  eventLinks?: EventLink[];
  multimediaLinks?: MultimediaLink[];
  tags?: string[];
  priceInformation?: string;
  eventLength?: string;
  reviewText?: string;
  reviewAuthor?: string;
}

export interface Event {
  id: string;
  name: string;
  category: string;
  date: string;
  venue: string;
  status: EventStatus;
  ticketsSold: number;
  totalTickets: number;
  revenue: number;
  eventRevenue?: number;
  type?: EventType;
  structureType?: string;
  formData?: EventFormData;
}

export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    name: 'Jazz Night',
    category: 'Music',
    date: '2026-02-12',
    venue: 'Tallinn Arena',
    status: 'Active',
    ticketsSold: 324,
    totalTickets: 500,
    revenue: 16200,
    formData: {
      creationType: 'event',
      slug: 'jazz-night-2026',
      eventCategory: 'Music',
      selectedGenres: ['jazz', 'blues'],
      mainGenre: 'jazz',
      ticketSalesSource: 'biletomat',
      ticketTypes: [
        { id: '1', name: 'General', price: '25', quantity: '300' },
        { id: '2', name: 'VIP', price: '75', quantity: '200' },
      ],
      tags: ['jazz', 'live music'],
      descriptions: { Universal: 'An evening of smooth jazz at Tallinn Arena.' },
      eventDate: '2026-02-12',
      eventTime: '20:00',
      timezone: 'Europe/Tallinn',
    }
  },
  {
    id: '2',
    name: 'Rock Festival',
    category: 'Music',
    date: '2026-06-20',
    venue: 'Song Festival Grounds',
    status: 'Scheduled',
    ticketsSold: 0,
    totalTickets: 2000,
    revenue: 0,
    formData: {
      creationType: 'event',
      slug: 'rock-festival-2026',
      eventCategory: 'Music',
      selectedGenres: ['rock', 'metal'],
      ticketSalesSource: 'biletomat',
      ticketTypes: [
        { id: '1', name: 'Day Pass', price: '45', quantity: '1500' },
        { id: '2', name: 'Weekend Pass', price: '80', quantity: '500' },
      ],
      eventDate: '2026-06-20',
      eventTime: '14:00',
      timezone: 'Europe/Tallinn',
    }
  },
  {
    id: '3',
    name: 'Contemporary Dance',
    category: 'Dance',
    date: '2026-03-05',
    venue: 'Estonian National Opera',
    status: 'Active',
    ticketsSold: 180,
    totalTickets: 400,
    revenue: 9000,
    formData: {
      creationType: 'event',
      slug: 'contemporary-dance-2026',
      eventCategory: 'Dance',
      ticketSalesSource: 'biletomat',
      ticketTypes: [
        { id: '1', name: 'Standard', price: '35', quantity: '300' },
        { id: '2', name: 'Premium', price: '65', quantity: '100' },
      ],
      eventDate: '2026-03-05',
      eventTime: '19:00',
    }
  },
  {
    id: '4',
    name: 'Comedy Night',
    category: 'Comedy',
    date: '2026-01-30',
    venue: 'Comedy Club Tallinn',
    status: 'Ended',
    ticketsSold: 150,
    totalTickets: 150,
    revenue: 3750,
    formData: {
      creationType: 'event',
      slug: 'comedy-night-jan-2026',
      eventCategory: 'Comedy',
      ticketSalesSource: 'biletomat',
      ticketTypes: [
        { id: '1', name: 'Standard', price: '25', quantity: '150' },
      ],
      eventDate: '2026-01-30',
      eventTime: '21:00',
    }
  },
  {
    id: '5',
    name: 'Art Exhibition Opening',
    category: 'Art',
    date: '2026-04-10',
    venue: 'Kumu Art Museum',
    status: 'Draft',
    ticketsSold: 0,
    totalTickets: 300,
    revenue: 0,
    formData: {
      creationType: 'event',
      slug: 'art-exhibition-2026',
      eventCategory: 'Art',
      ticketSalesSource: 'info-only',
      eventDate: '2026-04-10',
      eventTime: '18:00',
    }
  }
];
