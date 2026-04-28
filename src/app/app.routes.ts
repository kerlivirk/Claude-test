import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'events', pathMatch: 'full' },
  { path: 'events', loadChildren: () => import('./features/events/events.routes').then(m => m.EVENTS_ROUTES) },
  { path: 'series', loadChildren: () => import('./features/series/series.routes').then(m => m.SERIES_ROUTES) },
  { path: 'collections', loadChildren: () => import('./features/collections/collections.routes').then(m => m.COLLECTIONS_ROUTES) },
  { path: 'programme', loadChildren: () => import('./features/programme/programme.routes').then(m => m.PROGRAMME_ROUTES) },
];
