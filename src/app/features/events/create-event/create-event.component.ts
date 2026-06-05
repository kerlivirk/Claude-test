import { Component, OnInit, Signal, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ShareDialogComponent, ShareOrganizer, ShareResult } from './share-dialog.component';

import { Event, MOCK_EVENTS } from '../../../shared/models/event.model';
import { Series } from '../../../shared/models/series.model';
import { SeriesStore } from '../../../shared/state/series-store.service';
import { TicketsStepComponent } from './tickets-step.component';
import { SearchSelectComponent } from '../../../shared/components/search-select/search-select.component';
import { CATEGORY_OPTIONS, GENRE_OPTIONS } from '../../../shared/models/taxonomy';
import { LineupSlot, LineupRole } from '../../../shared/models/artists';
import { AddArtistDialogComponent, AddArtistResult } from './add-artist-dialog.component';
import { ArtistDialogComponent } from './artist-dialog.component';
import { SyncConfirmDialogComponent } from './sync-confirm-dialog.component';
import { TranslationsFieldComponent, TransField, TransLanguage, TransValues } from '../../../shared/components/translations-field/translations-field.component';

type SyncKey = 'name' | 'important' | 'description' | 'additional' | 'category' | 'lineup' | 'internal';

type DetailSectionKey =
  | 'name' | 'cover' | 'slug' | 'date' | 'text' | 'category' | 'lineup' | 'internal';
type StepMode = 'details' | 'tickets' | 'extras' | 'summary';

interface DetailSection { key: DetailSectionKey; label: string; icon: string; }
interface TextBlock { key: string; label: string; helpText?: string; }

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatIconModule, MatMenuModule, MatTooltipModule, MatSnackBarModule,
    TicketsStepComponent, SearchSelectComponent, TranslationsFieldComponent,
  ],
  // ArtistDialogComponent / AddArtistDialogComponent are opened via MatDialog (no template ref needed)
  templateUrl: './create-event.html',
  styleUrl: './create-event.scss',
})
export class CreateEventComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private store = inject(SeriesStore);
  private dialog = inject(MatDialog);

  readonly shareOrganizers: ShareOrganizer[] = [
    { id: 'o1', name: 'Maria Tamm', email: 'maria.tamm@piletilevi.ee' },
    { id: 'o2', name: 'Jaan Kask', email: 'jaan.kask@piletilevi.ee' },
    { id: 'o3', name: 'Liis Saar', email: 'liis.saar@piletilevi.ee' },
    { id: 'o4', name: 'Kumu Art Museum', email: 'events@kumu.ee' },
    { id: 'o5', name: 'Tartu Theater', email: 'box@tartuteater.ee' },
  ];

  readonly categoryOptions = CATEGORY_OPTIONS;
  readonly genreOptions = GENRE_OPTIONS;

  readonly detailSections: DetailSection[] = [
    { key: 'name', label: 'Event Name', icon: 'Text Style' },
    { key: 'slug', label: 'Slug', icon: 'Link Chain' },
    { key: 'cover', label: 'Cover Image', icon: 'Image' },
    { key: 'date', label: 'Date & Venue', icon: 'Location Pin 1' },
    { key: 'text', label: 'Text blocks', icon: 'Text File' },
    { key: 'category', label: 'Category', icon: 'Dashboard Square' },
    { key: 'lineup', label: 'Artists', icon: 'User Group' },
    { key: 'internal', label: 'Cashier Instructions', icon: 'Chat Bubble Text Oval' },
  ];

  readonly textBlocks: TextBlock[] = [
    { key: 'important', label: 'Important Information', helpText: 'Shown directly under the event name on the public ticket page.' },
    { key: 'description', label: 'Event Description' },
  ];

  /** POS Notes removed per Arturs: cashiers use POS, so separate POS Notes
   *  added no signal vs. Cashier Instructions. One field, one audience. */
  readonly internalBlocks: TextBlock[] = [
    { key: 'cashier', label: 'Cashier Instructions' },
  ];

  activeGroup = signal<'details' | 'tickets' | null>('details');
  activeSection = signal<DetailSectionKey | 'tickets' | 'extras' | 'summary'>('name');
  /** Active ticket sub-section (driven by scroll-spy + click) so the
   *  left-rail nav can highlight the right item while the user scrolls
   *  through the tickets step. */
  activeTicketKey = signal<string>('tk-source');

  readonly ticketSections = [
    { key: 'tk-source', label: 'Sales source', icon: 'Ticket' },
    { key: 'tk-places', label: 'Tickets setup', icon: 'Location Pin 1' },
    { key: 'tk-sale', label: 'Sale period', icon: 'Circle Clock' },
    { key: 'tk-categories', label: 'Price categories', icon: 'Tag' },
    { key: 'tk-rules', label: 'Ticket rules', icon: 'Cog 1' },
    { key: 'tk-sales-overview', label: 'Sales overview', icon: 'Pie Chart' },
  ];

  /* Mobile: the section nav (table of contents) opens as a drawer */
  sidebarOpen = signal(false);
  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  closeSidebar() { this.sidebarOpen.set(false); }
  selectStep(s: 'tickets' | 'extras' | 'summary') {
    this.activeSection.set(s);
    this.sidebarOpen.set(false);
  }
  scrollToTicket(anchor: string) {
    this.activeSection.set('tickets');
    this.activeTicketKey.set(anchor);
    this.sidebarOpen.set(false);
    setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }

  /** Topbar title click — jumps the user to the Event Name section so they
   *  can edit it inline (was hidden inside the form per user test feedback). */
  focusEventName() {
    this.activeSection.set('name');
    setTimeout(() => {
      const section = document.getElementById('sec-name');
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Focus the first text input inside the translations-field for the name.
      const input = section?.querySelector('app-translations-field input') as HTMLInputElement | null;
      input?.focus();
    }, 80);
  }

  private readonly detailKeys: string[] = ['name', 'cover', 'slug', 'date', 'text', 'category', 'lineup', 'internal'];
  mode = computed<StepMode>(() => {
    const s = this.activeSection();
    return this.detailKeys.includes(s) ? 'details' : (s as StepMode);
  });

  eventId = signal<string>('');
  seriesIdHint = signal<string>('');
  /** The resolved parent series. Returns `undefined` for hidden (system)
   *  wrappers so the UI still renders "Standalone event" — the user never
   *  knows the wrapping series exists, matching backend behaviour. */
  parentSeries: Signal<Series | undefined> = computed(() => {
    const hint = this.seriesIdHint();
    const found = hint ? this.store.getById(hint)() : this.store.getForEvent(this.eventId())();
    return found?.hidden ? undefined : found;
  });

  /** All series available for the connect-to-series picker — visible only.
   *  Hidden wrappers must never appear as a target. */
  allSeries = computed(() => this.store.visible());

  /** Connect this draft event to a visible series. Backend invariant: the
   *  hidden wrapper that previously held the event is garbage-collected. */
  connectToSeries(id: string) {
    if (!id) return;
    this.store.attachEventToSeries(this.eventId(), id);
    this.seriesIdHint.set(id);
  }
  /** Disconnect from the current series. Backend invariant: the event still
   *  belongs to a series — we create a fresh hidden wrapper for it. */
  disconnectFromSeries() {
    this.store.detachEventFromSeries(this.eventId());
    this.seriesIdHint.set('');
  }

  /* Local (per-event) overrides — used when sync is OFF */
  localName = signal<string>('50 Landmark Tracks in the History of Polish Hip-Hop - Performed by O.S.T.R.');
  localImportant = signal<string>('');
  localDescription = signal<string>('');
  localAdditional = signal<string>('');
  localCashier = signal<string>('');
  localPos = signal<string>('');
  localCategory = signal<string>('');
  localTags = signal<string>('');

  eventDate = signal<string>('2026-04-18');
  venue = signal<string>('Tartu Theater');
  slug = signal<string>('summer-concert-event-new');
  autoSlug = signal(true);

  /* Cover image — data URL (prototype). In prod this would upload to a CDN
     and the signal would hold the public URL instead. */
  coverImageUrl = signal<string>('');
  coverFileName = signal<string>('');
  coverError = signal<string>('');
  private readonly COVER_MAX_BYTES = 5 * 1024 * 1024;

  onCoverFileSelected(event: globalThis.Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.coverError.set('');
    if (!file.type.startsWith('image/')) {
      this.coverError.set('Please choose an image file.');
      input.value = '';
      return;
    }
    if (file.size > this.COVER_MAX_BYTES) {
      this.coverError.set('Image must be 5 MB or smaller.');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.coverImageUrl.set(String(reader.result ?? ''));
      this.coverFileName.set(file.name);
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeCover() {
    this.coverImageUrl.set('');
    this.coverFileName.set('');
    this.coverError.set('');
  }

  /* Date & Venue — interactive fields */
  readonly timezones = [
    'Europe / Tallinn (EET, UTC+3)',
    'Europe / Riga (EET, UTC+3)',
    'Europe / Vilnius (EET, UTC+3)',
    'Europe / Helsinki (EET, UTC+3)',
  ];
  timezone = signal(this.timezones[0]);
  startDate = signal('2026-04-18');
  startTime = signal('19:00');
  endDate = signal('2026-04-18');
  endTime = signal('23:00');
  doorsTime = signal('18:00');
  eventLength = signal('');

  /** Map preview is collapsed by default — it's decorative, not actionable.
   *  User can expand it explicitly if they want to verify the location. */
  showVenueMap = signal(false);

  /** Auto-shift end date forward when start date moves past it. Per user-test
   *  feedback (Klára): "if I change the start date, I would automatically
   *  change also the end date" — and end < start should never be valid. */
  onStartDateChange(v: string) {
    this.startDate.set(v);
    if (v && (!this.endDate() || this.endDate() < v)) {
      this.endDate.set(v);
    }
  }

  onSlugInput(v: string) { this.autoSlug.set(false); this.slug.set(v); }

  private slugify(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  toggleAutoSlug() {
    this.autoSlug.update(v => !v);
    if (this.autoSlug()) this.slug.set(this.slugify(this.eventName()));
  }

  syncName = signal(true);
  syncImportant = signal(true);
  syncDescription = signal(true);
  syncAdditional = signal(true);
  syncCategory = signal(true);
  syncLineup = signal(true);
  syncInternal = signal(true);

  /* Locked = sync toggle on AND this event belongs to a series.
     When locked, the field mirrors the series value (even if empty) and is read-only. */
  isSyncedName = computed(() => this.syncName() && !!this.parentSeries());
  isSyncedImportant = computed(() => this.syncImportant() && !!this.parentSeries());
  isSyncedDescription = computed(() => this.syncDescription() && !!this.parentSeries());
  isSyncedAdditional = computed(() => this.syncAdditional() && !!this.parentSeries());
  isSyncedCashier = computed(() => this.syncInternal() && !!this.parentSeries());
  isSyncedPos = computed(() => this.syncInternal() && !!this.parentSeries());
  isSyncedCategory = computed(() => this.syncCategory() && !!this.parentSeries());
  isSyncedLineup = computed(() => this.syncLineup() && !!this.parentSeries());

  /* Map each sync key to its signal + a human label for the confirm dialog */
  private syncSignalFor(key: SyncKey) {
    switch (key) {
      case 'name': return this.syncName;
      case 'important': return this.syncImportant;
      case 'description': return this.syncDescription;
      case 'additional': return this.syncAdditional;
      case 'category': return this.syncCategory;
      case 'lineup': return this.syncLineup;
      case 'internal': return this.syncInternal;
    }
  }
  private readonly syncLabels: Record<SyncKey, string> = {
    name: 'Event Name',
    important: 'Important Information',
    description: 'Event Description',
    additional: 'Additional Description',
    category: 'Category & Tags',
    lineup: 'Lineup',
    internal: 'Internal Information',
  };

  /** Open the confirm dialog, then flip the sync flag only if the user confirms. */
  requestSyncToggle(key: SyncKey) {
    const sig = this.syncSignalFor(key);
    const turningOn = !sig();
    const ref = this.dialog.open(SyncConfirmDialogComponent, {
      width: '420px', maxWidth: '96vw', panelClass: 'series-config-dialog-panel',
      data: { fieldLabel: this.syncLabels[key], turningOn },
    });
    ref.afterClosed().subscribe((ok: boolean | undefined) => {
      if (ok) sig.set(turningOn);
    });
  }

  /* Displayed values: series value when synced, else the local override */
  eventName = computed(() => this.isSyncedName() ? (this.parentSeries()?.name ?? '') : this.localName());
  importantInfo = computed(() => this.isSyncedImportant() ? (this.parentSeries()?.importantInfo ?? '') : this.localImportant());
  description = computed(() => this.isSyncedDescription() ? (this.parentSeries()?.description ?? '') : this.localDescription());
  additionalDesc = computed(() => this.isSyncedAdditional() ? (this.parentSeries()?.additionalDesc ?? '') : this.localAdditional());
  cashierInfo = computed(() => this.isSyncedCashier() ? (this.parentSeries()?.cashierInstructions ?? '') : this.localCashier());
  posInfo = computed(() => this.isSyncedPos() ? (this.parentSeries()?.posNotes ?? '') : this.localPos());
  category = computed(() => this.isSyncedCategory() ? (this.parentSeries()?.category ?? '') : this.localCategory());
  tags = computed(() => this.isSyncedCategory() ? (this.parentSeries()?.genre ?? '') : this.localTags());

  syncedTextKey(key: string) {
    if (key === 'important') return this.isSyncedImportant();
    if (key === 'description') return this.isSyncedDescription();
    if (key === 'additional') return this.isSyncedAdditional();
    return false;
  }
  syncTextFlag(key: string): boolean {
    if (key === 'important') return this.syncImportant();
    if (key === 'description') return this.syncDescription();
    if (key === 'additional') return this.syncAdditional();
    return false;
  }
  syncedInternalKey(key: string) {
    if (key === 'cashier') return this.isSyncedCashier();
    if (key === 'pos') return this.isSyncedPos();
    return false;
  }
  internalBlockValue(key: string): string {
    if (key === 'cashier') return this.cashierInfo();
    if (key === 'pos') return this.posInfo();
    return '';
  }
  onInternalBlockInput(key: string, v: string) {
    if (key === 'cashier') this.localCashier.set(v);
    else if (key === 'pos') this.localPos.set(v);
  }

  /* Lineup slots (role / time / members) */
  lineup = signal<LineupSlot[]>([
    {
      id: 'sl1', name: 'Arctic Monkeys', avatar: 'linear-gradient(135deg, #7f56d9, #4b39a4)',
      role: 'opener', time: '19:00',
      members: [
        { id: 'm1', name: 'Alex Turner', role: 'Vocals' },
        { id: 'm2', name: 'Matt Helders', role: 'Drums' },
        { id: 'm3', name: 'Jamie Cook', role: 'Guitar' },
      ],
    },
    {
      id: 'sl2', name: 'In Flames', avatar: 'linear-gradient(135deg, #f59e0b, #b45309)',
      role: 'opener', time: '20:00',
      members: [
        { id: 'm4', name: 'Anders Fridén', role: 'Vocals' },
        { id: 'm5', name: 'Björn Gelotte', role: 'Guitar' },
        { id: 'm6', name: 'Tanner Wayne', role: 'Drums' },
        { id: 'm7', name: 'Bryce Paul', role: 'Bass' },
      ],
    },
    {
      id: 'sl3', name: 'Rammstein', avatar: 'linear-gradient(135deg, #ef4444, #991b1b)',
      role: 'headliner', time: '21:00',
      members: [
        { id: 'm8', name: 'Till Lindemann', role: 'Vocalist' },
        { id: 'm9', name: 'Richard Z. Kruspe', role: 'Guitarist' },
        { id: 'm10', name: 'Oliver Riedel', role: 'Bassist' },
        { id: 'm11', name: 'Christoph Schneider', role: 'Drummer' },
        { id: 'm12', name: 'Christian Lorenz', role: 'Keys' },
        { id: 'm13', name: 'Paul Landers', role: 'Guitarist' },
      ],
    },
  ]);

  lineupSummary = computed(() => {
    const list = this.lineup();
    const h = list.filter(s => s.role === 'headliner').length;
    return `${list.length} artist${list.length === 1 ? '' : 's'} · ${h} headliner`;
  });
  roleLabel(r: LineupRole) { return r.charAt(0).toUpperCase() + r.slice(1); }

  constructor() {
    /* When user turns sync OFF, fork the current series value into the local override
       so the input keeps showing what they saw, ready for editing. */
    effect(() => {
      if (!this.syncName()) {
        const seriesName = this.parentSeries()?.name;
        if (seriesName && !this.localName()) this.localName.set(seriesName);
      }
    }, { allowSignalWrites: true });
    effect(() => {
      const s = this.parentSeries();
      if (!this.syncImportant() && s?.importantInfo && !this.localImportant()) this.localImportant.set(s.importantInfo);
      if (!this.syncDescription() && s?.description && !this.localDescription()) this.localDescription.set(s.description);
      if (!this.syncAdditional() && s?.additionalDesc && !this.localAdditional()) this.localAdditional.set(s.additionalDesc);
    }, { allowSignalWrites: true });
    effect(() => {
      if (!this.syncCategory()) {
        const s = this.parentSeries();
        if (s?.category && !this.localCategory()) this.localCategory.set(s.category);
        if (s?.genre && !this.localTags()) this.localTags.set(s.genre);
      }
    }, { allowSignalWrites: true });
    effect(() => {
      if (!this.syncInternal()) {
        const s = this.parentSeries();
        if (s?.cashierInstructions && !this.localCashier()) this.localCashier.set(s.cashierInstructions);
        if (s?.posNotes && !this.localPos()) this.localPos.set(s.posNotes);
      }
    }, { allowSignalWrites: true });
    /* Keep the slug in sync with the event name while auto-generate is on. */
    effect(() => {
      const name = this.eventName();
      if (this.autoSlug()) this.slug.set(this.slugify(name));
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const seriesIdParam = this.route.snapshot.queryParamMap.get('seriesId');

    if (id) {
      this.eventId.set(id);
      const ev = MOCK_EVENTS.find(e => e.id === id);
      if (ev) {
        this.localName.set(ev.name);
        this.eventDate.set(ev.date);
        this.venue.set(ev.venue);
        if (ev.formData?.slug) this.slug.set(ev.formData.slug);
      }
      // Edited event already has a series in the store (possibly hidden) —
      // no init bookkeeping needed.
    } else {
      // Brand-new event. Assign a frontend draft id immediately so the
      // backend invariant (event always lives inside a series) can be
      // mirrored from the very first render.
      const draftId = 'evt-draft-' + Date.now();
      this.eventId.set(draftId);
      if (seriesIdParam) {
        // Created via /events/create?seriesId=… — attach to that visible series.
        this.store.attachEventToSeries(draftId, seriesIdParam);
        this.seriesIdHint.set(seriesIdParam);
      } else {
        // Truly standalone — wrap it in a hidden system series.
        this.store.ensureHiddenSeriesFor(draftId);
      }
    }

    // Deep link straight to a step, e.g. ?step=tickets from the event card "Tickets" button
    if (this.route.snapshot.queryParamMap.get('step') === 'tickets') {
      this.activeSection.set('tickets');
      this.activeGroup.set('tickets');
    }
  }

  /* Input handlers — only update locals; sync toggle decides what's displayed */
  onNameInput(v: string) { this.localName.set(v); }
  onImportantInput(v: string) { this.localImportant.set(v); }
  onDescriptionInput(v: string) { this.localDescription.set(v); }
  onAdditionalInput(v: string) { this.localAdditional.set(v); }
  onCategoryInput(v: string) { this.localCategory.set(v); }
  onTagsInput(v: string) { this.localTags.set(v); }

  textBlockValue(key: string): string {
    if (key === 'important') return this.importantInfo();
    if (key === 'description') return this.description();
    if (key === 'additional') return this.additionalDesc();
    return '';
  }
  onTextBlockInput(key: string, v: string) {
    if (key === 'important') this.onImportantInput(v);
    else if (key === 'description') this.onDescriptionInput(v);
    else if (key === 'additional') this.onAdditionalInput(v);
  }

  scrollTo(key: DetailSectionKey) {
    this.activeSection.set(key);
    this.sidebarOpen.set(false);
    const el = document.getElementById('sec-' + key);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* Scroll-spy: highlight the nav sub-item for whichever section is in view.
     Handles both modes:
       - Details mode → which detail section is at the top → activeSection
       - Tickets mode → which ticket sub-section is at the top → activeTicketKey */
  onFormScroll(container: HTMLElement) {
    const refTop = container.getBoundingClientRect().top + 96;

    if (this.mode() === 'details') {
      let current: DetailSectionKey = this.detailSections[0].key;
      for (const s of this.detailSections) {
        const el = document.getElementById('sec-' + s.key);
        if (el && el.getBoundingClientRect().top <= refTop) current = s.key;
      }
      if (this.activeSection() !== current) {
        this.activeSection.set(current);
        document.querySelector('.ce-nav-sub-item.active')?.scrollIntoView({ block: 'nearest' });
      }
      return;
    }

    if (this.mode() === 'tickets') {
      let current: string = this.ticketSections[0].key;
      for (const s of this.ticketSections) {
        const el = document.getElementById(s.key);
        if (el && el.getBoundingClientRect().top <= refTop) current = s.key;
      }
      if (this.activeTicketKey() !== current) {
        this.activeTicketKey.set(current);
        document.querySelector('.ce-nav-sub-item.active')?.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  openAddArtist() {
    const ref = this.dialog.open(AddArtistDialogComponent, {
      width: '420px', maxWidth: '96vw', panelClass: 'series-config-dialog-panel',
    });
    ref.afterClosed().subscribe((res: AddArtistResult | undefined) => {
      if (!res) return;
      const slot: LineupSlot = {
        id: 'sl' + Date.now(), name: res.name, avatar: res.avatar,
        role: 'opener', time: '', members: [],
      };
      this.lineup.update(l => [...l, slot]);
      this.openArtist(slot);
    });
  }

  openArtist(slot: LineupSlot) {
    const ref = this.dialog.open(ArtistDialogComponent, {
      width: '440px', maxWidth: '96vw', maxHeight: '90vh', panelClass: 'series-config-dialog-panel',
      data: { slot },
    });
    ref.afterClosed().subscribe((res: { action: 'save' | 'remove'; slot: LineupSlot } | undefined) => {
      if (!res) return;
      if (res.action === 'remove') {
        this.lineup.update(l => l.filter(s => s.id !== slot.id));
      } else {
        this.lineup.update(l => l.map(s => s.id === res.slot.id ? res.slot : s));
      }
    });
  }

  formatDate(d?: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /* Translations (inline, side-by-side) */
  readonly baseLang = 'en';
  readonly languages: TransLanguage[] = [
    { code: 'en', name: 'English' },
    { code: 'et', name: 'Estonian' },
    { code: 'lv', name: 'Latvian' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'ru', name: 'Russian' },
    { code: 'fi', name: 'Finnish' },
  ];
  readonly nameFields: TransField[] = [{ key: 'name', label: 'Event Name', placeholder: 'New event' }];

  /** translations for the name field, keyed by language (base lang is the event name itself) */
  nameTrans = signal<TransValues>({});
  nameValues = computed<TransValues>(() => ({ ...this.nameTrans(), [this.baseLang]: { name: this.eventName() } }));
  onNameValuesChange(v: TransValues) {
    if (!this.isSyncedName() && v[this.baseLang]?.['name'] !== undefined) {
      this.localName.set(v[this.baseLang]['name']);
    }
    const rest: TransValues = { ...v };
    delete rest[this.baseLang];
    this.nameTrans.set(rest);
  }

  /** Translations for text blocks (Important Information, Event Description,
   *  Cashier Instructions). Single store keyed by langCode → fieldKey → value
   *  — the base-lang value lives on the matching local signal and is merged
   *  in at render time. Mirrors the series-config-dialog approach. */
  private blockTrans = signal<TransValues>({});

  /** Display label per block key — shown in the translation-widget header. */
  private blockLabel(key: string): string {
    switch (key) {
      case 'important': return 'Important Information';
      case 'description': return 'Event Description';
      case 'cashier': return 'Cashier Instructions';
      default: return key;
    }
  }

  /** Effective base-language value for a block — series value when synced,
   *  else the local override. */
  private blockBaseValue(key: string): string {
    switch (key) {
      case 'important': return this.importantInfo();
      case 'description': return this.description();
      case 'cashier': return this.cashierInfo();
      default: return '';
    }
  }

  /** Apply a new base-language value back to the right local signal (only
   *  when the block isn't synced from a series). */
  private setBlockBase(key: string, v: string) {
    if (this.syncedTextKey(key)) return;
    switch (key) {
      case 'important': this.localImportant.set(v); break;
      case 'description': this.localDescription.set(v); break;
      case 'cashier': this.localCashier.set(v); break;
    }
  }

  /** TransField[] for a block — multiline textarea variant. */
  fieldsForBlock(key: string): TransField[] {
    return [{ key, label: this.blockLabel(key), multiline: true }];
  }

  /** TransValues for a block — base-lang value + per-lang slices from blockTrans. */
  valuesForBlock(key: string): TransValues {
    const out: TransValues = { [this.baseLang]: { [key]: this.blockBaseValue(key) } };
    for (const [lang, fields] of Object.entries(this.blockTrans())) {
      if (lang === this.baseLang) continue;
      out[lang] = { [key]: fields[key] ?? '' };
    }
    return out;
  }

  /** Persist a block's TransValues — base goes to the matching local signal,
   *  the rest into blockTrans. */
  onBlockValuesChange(key: string, v: TransValues) {
    this.setBlockBase(key, v[this.baseLang]?.[key] ?? '');
    this.blockTrans.update(prev => {
      const next: TransValues = { ...prev };
      for (const [lang, fields] of Object.entries(v)) {
        if (lang === this.baseLang) continue;
        next[lang] = { ...(next[lang] ?? {}), [key]: fields[key] ?? '' };
      }
      return next;
    });
  }

  share() {
    const ref = this.dialog.open(ShareDialogComponent, {
      width: '460px',
      maxWidth: '96vw',
      panelClass: 'series-config-dialog-panel',
      data: { eventName: this.eventName(), organizers: this.shareOrganizers },
    });
    ref.afterClosed().subscribe((result: ShareResult | undefined) => {
      if (!result) return;
      const n = result.organizerIds.length;
      this.snack.open(`Shared with ${n} organizer${n === 1 ? '' : 's'} (${result.permission})`, 'OK', { duration: 2800 });
    });
  }

  publish() { this.publishEvent(); }
  saveDraft() { this.snack.open('Draft saved', 'OK', { duration: 2500 }); }

  /* ---------- Step navigation (bottom bar) ---------- */
  readonly stepOrder: StepMode[] = ['details', 'tickets', 'extras', 'summary'];
  private readonly stepLabels: Record<StepMode, string> = {
    details: 'Event Details', tickets: 'Tickets', extras: 'Extras', summary: 'Summary',
  };
  isFirstStep = computed(() => this.mode() === this.stepOrder[0]);
  isLastStep = computed(() => this.mode() === this.stepOrder[this.stepOrder.length - 1]);

  private goToStep(step: StepMode) {
    if (step === 'details') { this.activeGroup.set('details'); this.activeSection.set('name'); }
    else if (step === 'tickets') { this.activeGroup.set('tickets'); this.activeSection.set('tickets'); }
    else { this.activeGroup.set(null); this.activeSection.set(step); }
    this.sidebarOpen.set(false);
    setTimeout(() => document.querySelector('.ce-form')?.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  }

  nextStep() {
    const i = this.stepOrder.indexOf(this.mode());
    if (i < 0 || i >= this.stepOrder.length - 1) return;
    const next = this.stepOrder[i + 1];
    this.goToStep(next);
    this.snack.open(`Saved. Next: ${this.stepLabels[next]}`, 'OK', { duration: 1800 });
  }

  prevStep() {
    const i = this.stepOrder.indexOf(this.mode());
    if (i <= 0) { this.back(); return; }
    this.goToStep(this.stepOrder[i - 1]);
  }

  /* ---------- Final actions ---------- */
  publishEvent() {
    this.snack.open('Event published 🎉', 'OK', { duration: 3000 });
    this.router.navigate(this.exitTarget());
  }
  saveDraftAndExit() {
    this.snack.open('Saved as draft', 'OK', { duration: 2500 });
    this.router.navigate(this.exitTarget());
  }

  private exitTarget(): string[] {
    const series = this.parentSeries();
    return series ? ['/events/series', series.id] : ['/events'];
  }

  back() { this.router.navigate(this.exitTarget()); }
  close() { this.router.navigate(this.exitTarget()); }
}
