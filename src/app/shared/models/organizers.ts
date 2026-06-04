export interface Organizer {
  id: string;
  name: string;
  email: string;
}

export const ORGANIZERS: Organizer[] = [
  { id: 'o1', name: 'Maria Tamm', email: 'maria.tamm@piletilevi.ee' },
  { id: 'o2', name: 'Jaan Kask', email: 'jaan.kask@piletilevi.ee' },
  { id: 'o3', name: 'Liis Saar', email: 'liis.saar@piletilevi.ee' },
  { id: 'o4', name: 'Kumu Art Museum', email: 'events@kumu.ee' },
  { id: 'o5', name: 'Tartu Theater', email: 'box@tartuteater.ee' },
  { id: 'o6', name: 'PLG Latvia', email: 'info@bilesuparadize.lv' },
];
