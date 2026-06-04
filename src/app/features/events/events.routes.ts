import { Routes } from '@angular/router';
import { EventsListComponent } from './events-list/events-list.component';

export const EVENTS_ROUTES: Routes = [
  { path: '', component: EventsListComponent },
  {
    path: 'series/:id',
    loadComponent: () =>
      import('./series-detail/series-detail.component').then(m => m.SeriesDetailComponent),
  },
];
