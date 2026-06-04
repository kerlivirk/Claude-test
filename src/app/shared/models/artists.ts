export type LineupRole = 'headliner' | 'opener' | 'support';

export interface LineupMember {
  id: string;
  name: string;
  role: string;
}

export interface LineupSlot {
  id: string;
  name: string;
  avatar: string;
  role: LineupRole;
  time: string;
  description?: string;
  internalNotes?: string;
  slug?: string;
  members: LineupMember[];
}

export interface MockArtist {
  id: string;
  name: string;
  avatar: string;
}

const GRADIENTS = [
  'linear-gradient(135deg, #7f56d9, #4b39a4)',
  'linear-gradient(135deg, #f59e0b, #b45309)',
  'linear-gradient(135deg, #ef4444, #991b1b)',
  'linear-gradient(135deg, #0ea5a5, #0b6e6e)',
  'linear-gradient(135deg, #06d373, #047a48)',
  'linear-gradient(135deg, #e0588b, #a12d5e)',
  'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  'linear-gradient(135deg, #6366f1, #3730a3)',
];

export function gradientForName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export const ARTIST_DB: MockArtist[] = [
  { id: 'db1', name: 'Arctic Monkeys', avatar: GRADIENTS[0] },
  { id: 'db2', name: 'In Flames', avatar: GRADIENTS[1] },
  { id: 'db3', name: 'Rammstein', avatar: GRADIENTS[2] },
  { id: 'db4', name: 'Tamikrest', avatar: GRADIENTS[3] },
  { id: 'db5', name: 'Trad.Attack!', avatar: GRADIENTS[4] },
  { id: 'db6', name: 'Puuluup', avatar: GRADIENTS[5] },
  { id: 'db7', name: 'Nublu', avatar: GRADIENTS[6] },
  { id: 'db8', name: 'Tommy Cash', avatar: GRADIENTS[7] },
  { id: 'db9', name: 'Maarja Nuut', avatar: GRADIENTS[3] },
  { id: 'db10', name: 'Metallica', avatar: GRADIENTS[2] },
];
