import { Injectable, Signal, computed, signal } from '@angular/core';
import { MOCK_SERIES, Series } from '../models/series.model';

@Injectable({ providedIn: 'root' })
export class SeriesStore {
  private state = signal<Series[]>([...MOCK_SERIES]);
  readonly all: Signal<Series[]> = this.state.asReadonly();

  /** All series the user is allowed to see. System-created hidden series
   *  (wrapping a "single" event) are filtered out. UI surfaces should
   *  almost always read from this, not `all`. */
  readonly visible: Signal<Series[]> = computed(() => this.state().filter(s => !s.hidden));

  getById(id: string): Signal<Series | undefined> {
    return computed(() => this.state().find(s => s.id === id));
  }

  getForEvent(eventId: string): Signal<Series | undefined> {
    return computed(() => this.state().find(s => s.eventIds.includes(eventId)));
  }

  upsert(data: Series): void {
    this.state.update(list => {
      const idx = list.findIndex(s => s.id === data.id);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = { ...next[idx], ...data };
        return next;
      }
      return [...list, data];
    });
  }

  remove(id: string): void {
    this.state.update(list => list.filter(s => s.id !== id));
  }

  nextId(): string {
    return 's' + (this.state().length + 1);
  }

  /** Mirror the backend rule: every event lives inside a Show/Series. For a
   *  "single" event the wrapper series is hidden. Idempotent — returns the
   *  existing hidden series id for this event if one already exists. */
  ensureHiddenSeriesFor(eventId: string): string {
    const existing = this.state().find(s => s.hidden && s.eventIds.includes(eventId));
    if (existing) return existing.id;
    const id = 'sh-' + Date.now();
    this.state.update(list => [
      ...list,
      {
        id,
        name: '(system) hidden series for ' + eventId,
        status: 'Draft',
        eventCount: 1,
        eventIds: [eventId],
        hidden: true,
      },
    ]);
    return id;
  }

  /** Move an event into a (visible) target series, removing it from whatever
   *  series currently holds it. Garbage-collects any hidden wrapper that
   *  becomes empty as a result. */
  attachEventToSeries(eventId: string, targetSeriesId: string): void {
    this.state.update(list => {
      const stripped = list.map(s => {
        if (!s.eventIds.includes(eventId)) return s;
        const eventIds = s.eventIds.filter(id => id !== eventId);
        return { ...s, eventIds, eventCount: eventIds.length };
      });
      const withTarget = stripped.map(s => {
        if (s.id !== targetSeriesId) return s;
        if (s.eventIds.includes(eventId)) return s;
        const eventIds = [...s.eventIds, eventId];
        return { ...s, eventIds, eventCount: eventIds.length };
      });
      return withTarget.filter(s => !(s.hidden && s.eventIds.length === 0));
    });
  }

  /** Take an event out of its current series and drop it into a fresh hidden
   *  wrapper, mirroring the backend invariant (event always has a series). */
  detachEventFromSeries(eventId: string): string {
    const newId = 'sh-' + Date.now();
    this.state.update(list => {
      const stripped = list
        .map(s => {
          if (!s.eventIds.includes(eventId)) return s;
          const eventIds = s.eventIds.filter(id => id !== eventId);
          return { ...s, eventIds, eventCount: eventIds.length };
        })
        .filter(s => !(s.hidden && s.eventIds.length === 0));
      return [
        ...stripped,
        {
          id: newId,
          name: '(system) hidden series for ' + eventId,
          status: 'Draft',
          eventCount: 1,
          eventIds: [eventId],
          hidden: true,
        },
      ];
    });
    return newId;
  }
}
