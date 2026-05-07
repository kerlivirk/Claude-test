import { Routes } from '@angular/router';
import { PlaceholderComponent } from './features/placeholder/placeholder.component';

export const routes: Routes = [
  { path: '', redirectTo: 'events', pathMatch: 'full' },
  { path: 'events', loadChildren: () => import('./features/events/events.routes').then(m => m.EVENTS_ROUTES) },
  { path: 'series', loadChildren: () => import('./features/series/series.routes').then(m => m.SERIES_ROUTES) },
  { path: 'collections', loadChildren: () => import('./features/collections/collections.routes').then(m => m.COLLECTIONS_ROUTES) },
  { path: 'programme', loadChildren: () => import('./features/programme/programme.routes').then(m => m.PROGRAMME_ROUTES) },
  { path: 'dashboard', component: PlaceholderComponent, data: { title: 'Dashboard' } },
  { path: 'addons', component: PlaceholderComponent, data: { title: 'Add-ons Configuration' } },
  { path: 'templates', component: PlaceholderComponent, data: { title: 'Ticket Templates' } },
  { path: 'event-templates', component: PlaceholderComponent, data: { title: 'Event Templates' } },
];
