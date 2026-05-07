import { Routes } from '@angular/router';
import { EventsListComponent } from './events-list/events-list.component';
import { CreateEventComponent } from './create-event/create-event.component';

export const EVENTS_ROUTES: Routes = [
  { path: '', component: EventsListComponent },
  { path: 'create', component: CreateEventComponent },
  { path: 'edit/:id', component: CreateEventComponent },
  {
    path: 'create-series',
    loadComponent: () =>
      import('./create-series-stub/create-series-stub.component').then(m => m.CreateSeriesStubComponent),
  },
  {
    path: 'series/:id',
    loadComponent: () =>
      import('./create-series-stub/create-series-stub.component').then(m => m.CreateSeriesStubComponent),
  },
];
