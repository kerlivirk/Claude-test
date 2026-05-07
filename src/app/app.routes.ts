import { Routes } from '@angular/router';
import { ShellLayoutComponent } from './layout/shell/shell-layout.component';
import { PlaceholderComponent } from './features/placeholder/placeholder.component';

export const routes: Routes = [
  // Full-screen routes (rendered without sidebar)
  {
    path: 'events/create',
    loadComponent: () =>
      import('./features/events/create-event/create-event.component').then(m => m.CreateEventComponent),
  },
  {
    path: 'events/edit/:id',
    loadComponent: () =>
      import('./features/events/create-event/create-event.component').then(m => m.CreateEventComponent),
  },
  {
    path: 'events/create-series',
    loadComponent: () =>
      import('./features/events/create-series/create-series.component').then(m => m.CreateSeriesComponent),
  },
  {
    path: 'events/series/:id',
    loadComponent: () =>
      import('./features/events/create-series/create-series.component').then(m => m.CreateSeriesComponent),
  },

  // Shell-wrapped routes
  {
    path: '',
    component: ShellLayoutComponent,
    children: [
      { path: '', redirectTo: 'events', pathMatch: 'full' },
      { path: 'events', loadChildren: () => import('./features/events/events.routes').then(m => m.EVENTS_ROUTES) },
      { path: 'series', loadChildren: () => import('./features/series/series.routes').then(m => m.SERIES_ROUTES) },
      { path: 'collections', loadChildren: () => import('./features/collections/collections.routes').then(m => m.COLLECTIONS_ROUTES) },
      { path: 'programme', loadChildren: () => import('./features/programme/programme.routes').then(m => m.PROGRAMME_ROUTES) },
      { path: 'dashboard', component: PlaceholderComponent, data: { title: 'Dashboard' } },
      { path: 'addons', component: PlaceholderComponent, data: { title: 'Add-ons Configuration' } },
      { path: 'templates', component: PlaceholderComponent, data: { title: 'Ticket Templates' } },
      { path: 'event-templates', component: PlaceholderComponent, data: { title: 'Event Templates' } },
    ],
  },
];
