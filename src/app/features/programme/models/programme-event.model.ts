export type ProgrammeStatus = 'Hidden' | 'Scheduled' | 'Published' | 'Draft' | 'Cancelled';

export interface TicketAllocation {
  total: number;
  sellRatio: number;
  sold: number;
  reserved: number;
  blocked: number;
  available: number;
}

export interface ChartDataPoint {
  date: string;
  label: string;
  categories: { name: string; value: number; color: string }[];
}

export interface TicketCategory {
  id: string;
  name: string;
  totalAmount: number;
  color: string;
  visible: boolean;
}

export interface SalesData {
  soldTickets: number;
  seatedCount: number;
  unseatedCount: number;
  salesValue: number;
  transactions: number;
  productsSold: number;
  chartData: ChartDataPoint[];
  categories: TicketCategory[];
}

export interface ProgrammeEvent {
  id: string;
  name: string;
  eventId: string;
  date: string;
  time: string;
  venue: string;
  venueCity: string;
  status: ProgrammeStatus;
  nameBadge?: string;
  locked?: boolean;
  lastEdited: string;
  seated: TicketAllocation;
  generalAdmission: TicketAllocation;
  children?: ProgrammeEvent[];
  expanded?: boolean;
  salesData?: SalesData;
  artist?: string;
}

/* ───── Mock data ───── */

const CATS: TicketCategory[] = [
  { id: 'c1', name: 'Gold €169 ADULT + Service', totalAmount: 2000, color: '#efb100', visible: true },
  { id: 'c2', name: 'Gold €169 ADULT + Service', totalAmount: 2000, color: '#06d373', visible: true },
  { id: 'c3', name: 'Gold €169 ADULT + Service', totalAmount: 2000, color: '#4a90d9', visible: true },
  { id: 'c4', name: 'Gold €169 ADULT + Service', totalAmount: 2000, color: '#c70f87', visible: true },
];

function genChart(): ChartDataPoint[] {
  const pts: ChartDataPoint[] = [];
  const base = new Date('2025-11-01');
  for (let i = 0; i < 14; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    pts.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      categories: CATS.map(c => ({
        name: c.name,
        value: Math.floor(Math.random() * 200 + 50),
        color: c.color,
      })),
    });
  }
  return pts;
}

const SALES: SalesData = {
  soldTickets: 189_000,
  seatedCount: 145,
  unseatedCount: 84,
  salesValue: 450_000_000_000.02,
  transactions: 189_000,
  productsSold: 189_000,
  chartData: genChart(),
  categories: CATS,
};

export const MOCK_PROGRAMME: ProgrammeEvent[] = [
  {
    id: 'p1',
    name: '50 PRZEŁOMOWYCH UTWORÓW W HISTORII POLSKIEGO HIP-HOPU – HOSTED BY O.S.T.R.',
    eventId: '523733',
    date: '2025-11-18',
    time: '16:32',
    venue: 'Tallinn Arena',
    venueCity: 'Tallinn',
    status: 'Hidden',
    nameBadge: 'Cancelled',
    lastEdited: '18/11/2025 16.32',
    seated: { total: 223_000, sellRatio: 65, sold: 120_000, reserved: 5000, blocked: 10_000, available: 120_000 },
    generalAdmission: { total: 0, sellRatio: 0, sold: 0, reserved: 0, blocked: 0, available: 0 },
    salesData: SALES,
  },
  {
    id: 'p2',
    name: 'W 80 dni dookoła świata. Tam i z powrotem',
    eventId: '523733',
    date: '2025-11-18',
    time: '16:32',
    venue: 'Tallinn Arena',
    venueCity: 'Tallinn',
    status: 'Scheduled',
    lastEdited: '18/11/2025 16.32',
    seated: { total: 223_000, sellRatio: 65, sold: 120_000, reserved: 5000, blocked: 10_000, available: 120_000 },
    generalAdmission: { total: 223_000, sellRatio: 75, sold: 120_000, reserved: 5000, blocked: 10_000, available: 120_000 },
    salesData: SALES,
    expanded: true,
    children: [
      {
        id: 'p2a',
        name: 'W 80 dni dookoła świata. Tam i z powrotem',
        eventId: '523733',
        date: '2025-02-12',
        time: '19:00',
        venue: 'Tallinn Arena',
        venueCity: 'Tallinn',
        status: 'Published',
        locked: true,
        lastEdited: '18/11/2025 16.32',
        seated: { total: 223_000, sellRatio: 65, sold: 120_000, reserved: 5000, blocked: 10_000, available: 120_000 },
        generalAdmission: { total: 223_000, sellRatio: 65, sold: 120_000, reserved: 5000, blocked: 10_000, available: 120_000 },
      },
      {
        id: 'p2b',
        name: 'W 80 dni dookoła świata. Tam i z powrotem',
        eventId: '523733',
        artist: 'Justin Timberlake',
        date: '2025-02-12',
        time: '19:00',
        venue: 'Tallinn Arena',
        venueCity: 'Tallinn',
        status: 'Draft',
        locked: true,
        lastEdited: '18/11/2025 16.32',
        seated: { total: 223_000, sellRatio: 65, sold: 120_000, reserved: 5000, blocked: 10_000, available: 120_000 },
        generalAdmission: { total: 223_000, sellRatio: 65, sold: 120_000, reserved: 5000, blocked: 10_000, available: 120_000 },
      },
      {
        id: 'p2c',
        name: 'Justin Timberlake',
        eventId: '523733',
        date: '2025-02-12',
        time: '19:00',
        venue: 'Tallinn Arena',
        venueCity: 'Tallinn',
        status: 'Draft',
        lastEdited: '18/11/2025 16.32',
        seated: { total: 223_000, sellRatio: 65, sold: 120_000, reserved: 5000, blocked: 10_000, available: 120_000 },
        generalAdmission: { total: 223_000, sellRatio: 65, sold: 120_000, reserved: 5000, blocked: 10_000, available: 120_000 },
      },
    ],
  },
];
