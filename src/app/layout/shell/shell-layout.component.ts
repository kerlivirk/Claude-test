import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Series } from '../../shared/models/series.model';
import { SeriesStore } from '../../shared/state/series-store.service';
import { SeriesConfigDialogComponent, SeriesConfigResult } from '../../features/events/series-config-dialog/series-config-dialog.component';
import { EventStructureDialogComponent, EventStructureChoice } from '../../features/events/event-structure-dialog/event-structure-dialog.component';
import {
  PlgBackOfficeLayoutModule,
  PlgMenuDialogMobileComponent,
  PlgSideMenuDesktopComponent,
  PlgTopBarComponent,
  PlgAppSwitcherComponent,
  PlgAppListPanelComponent,
  PlgAppListPanelItemDirective,
  PlgAppSwitcherItem,
  PlgUserContextMenuComponent,
  LegalEntitySwitchPanelViewModel,
} from '@piletilevi/common-angular';

interface NavPage {
  id: string;
  label: string;
  icon: string;
  route: string;
}
interface NavSection {
  id: string;
  label: string;
  icon: string;
  showDividerAfterSection?: boolean;
  pages: NavPage[];
}

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    PlgBackOfficeLayoutModule,
    PlgAppSwitcherComponent,
    PlgAppListPanelComponent,
    PlgAppListPanelItemDirective,
    PlgUserContextMenuComponent,
  ],
  template: `
    <plg-app-layout>
      <plg-top-bar #topBar (sideMenuToggled)="toggleSideMenu()" (mobileMenuToggled)="toggleMobileMenu()">
        <div left class="topbar-left">
          <plg-app-switcher #appSwitcher>
            <ng-template #plgAppSwitcherLocalAppsTab>
              <plg-app-list-panel>
                @for (app of localApps; track app.id) {
                  <a
                    plgAppListItem
                    href="#"
                    [class.active]="selectedAppId() === app.id"
                    (click)="selectedAppId.set(app.id); appSwitcher.closeDropdown(); $event.preventDefault()">
                    @if (app.icon) { <mat-icon>{{ app.icon }}</mat-icon> }
                    <span>{{ app.label }}</span>
                  </a>
                }
              </plg-app-list-panel>
            </ng-template>
            <ng-template #plgAppSwitcherGlobalAppsTab>
              <plg-app-list-panel>
                @for (app of globalApps; track app.id) {
                  <a plgAppListItem href="#" (click)="$event.preventDefault()">
                    @if (app.icon) { <mat-icon>{{ app.icon }}</mat-icon> }
                    <span>{{ app.label }}</span>
                  </a>
                }
              </plg-app-list-panel>
            </ng-template>
          </plg-app-switcher>
          <h2 class="topbar-brand">piletilevi PLG</h2>
        </div>

        <div right class="topbar-right">
          <button class="topbar-create" (click)="openCreateDialog()">
            <mat-icon>Add 1</mat-icon>
            <span>Create</span>
          </button>

          <plg-user-context-menu
            [legalEntities]="legalEntities"
            [selectedLegalEntity]="selectedLegalEntity()"
            (selectedLegalEntityChange)="selectedLegalEntity.set($event)"
            [username]="'Annika Kütt'"
            [email]="'annika.kutt@piletilevi.ee'">
            <ng-template #plgUserContextMenuFooter>
              Contact Piletilevi admin:
              <a href="mailto:info@piletilevi.ee">info&#64;piletilevi.ee</a>
              <br />
              (Mon-Fri 9-21, Sat-Sun 10-21)
            </ng-template>
          </plg-user-context-menu>
        </div>
      </plg-top-bar>

      <plg-side-menu-desktop #sideMenu>
        <plg-sections-menu>
          @for (section of sections; track section.id) {
            <plg-sections-menu-item
              [id]="section.id"
              [label]="section.label"
              [icon]="section.icon"
              [active]="section.id === selectedSectionId()"
              (click)="selectedSectionId.set(section.id)" />
          }
        </plg-sections-menu>

        <plg-pages-menu>
          <plg-pages-menu-group [label]="selectedSection().label">
            @for (page of selectedSection().pages; track page.id) {
              <a
                plgPagesMenuItem
                [routerLink]="page.route"
                routerLinkActive
                #rla="routerLinkActive"
                [active]="rla.isActive">
                <mat-icon plgPagesMenuItemIcon>{{ page.icon }}</mat-icon>
                {{ page.label }}
              </a>
            }
          </plg-pages-menu-group>
        </plg-pages-menu>
      </plg-side-menu-desktop>

      <plg-content contentClass="app-content-pad">
        <router-outlet />
      </plg-content>

      <plg-menu-dialog-mobile #mobileMenu (close)="onMobileMenuClose()">
        <plg-sections-menu>
          @for (section of sections; track section.id) {
            <plg-sections-menu-item
              [id]="section.id"
              [label]="section.label"
              [icon]="section.icon"
              [active]="section.id === selectedSectionId()"
              (click)="selectedSectionId.set(section.id)" />
          }
        </plg-sections-menu>
        <plg-pages-menu>
          <plg-pages-menu-group [label]="selectedSection().label">
            @for (page of selectedSection().pages; track page.id) {
              <a plgPagesMenuItem [routerLink]="page.route" (clicked)="closeMobile()">
                <mat-icon plgPagesMenuItemIcon>{{ page.icon }}</mat-icon>
                {{ page.label }}
              </a>
            }
          </plg-pages-menu-group>
        </plg-pages-menu>
      </plg-menu-dialog-mobile>
    </plg-app-layout>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .topbar-left { display: flex; align-items: center; gap: 12px; }
    .topbar-brand {
      margin: 0;
      font-family: Mulish, sans-serif;
      font-weight: 700;
      font-weight: var(--font-weight-bold, 700);
      font-size: 16px;
      color: var(--text-on-surface-primary, #11002b);
      white-space: nowrap;
    }
    ::ng-deep .app-content-pad { padding: 0 0 0 var(--space-2xl, 16px); }
    .topbar-right { display: inline-flex; align-items: center; gap: 12px; }
    .topbar-create {
      display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 14px;
      background: #06d373; border: 1px solid #06d373; border-radius: 9999px;
      font: 700 14px/20px Mulish, sans-serif; color: #002b1a; cursor: pointer;
    }
    .topbar-create:hover { background: #04a85b; }
    .topbar-create mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .topbar-create-caret { font-size: 14px !important; width: 14px !important; height: 14px !important; opacity: .7; }
    @media (max-width: 600px) {
      .topbar-create { padding: 0; width: 38px; }
      .topbar-create span, .topbar-create-caret { display: none; }
    }
  `],
})
export class ShellLayoutComponent {
  private readonly mobileMenu = viewChild(PlgMenuDialogMobileComponent);
  private readonly sideMenu = viewChild<PlgSideMenuDesktopComponent>('sideMenu');
  private readonly topBar = viewChild<PlgTopBarComponent>('topBar');
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly store = inject(SeriesStore);

  /** Topbar "Create" — opens the same Event-or-Series picker used everywhere
   *  else, then routes to the matching create flow. */
  openCreateDialog() {
    const ref = this.dialog.open(EventStructureDialogComponent, {
      width: '720px', maxWidth: '95vw', panelClass: 'event-structure-dialog',
    });
    ref.afterClosed().subscribe((choice: EventStructureChoice | undefined) => {
      if (choice === 'single') this.router.navigate(['/events/create']);
      else if (choice === 'series') this.createSeries();
    });
  }

  private createSeries() {
    const ref = this.dialog.open(SeriesConfigDialogComponent, {
      width: '760px', maxWidth: '96vw', maxHeight: '92vh', panelClass: 'series-config-dialog-panel',
    });
    ref.afterClosed().subscribe((result: SeriesConfigResult | undefined) => {
      if (!result) return;
      const id = this.store.nextId();
      const newSeries: Series = {
        ...result, id, name: result.name ?? 'Untitled series',
        status: 'Draft', eventCount: 0, eventIds: [],
      };
      this.store.upsert(newSeries);
      this.router.navigate(['/events/series', id]);
    });
  }

  readonly legalEntities: LegalEntitySwitchPanelViewModel[] = [
    { id: 1, name: 'PLG Estonia', description: 'Piletilevi Group AS' },
    { id: 2, name: 'PLG Latvia', description: 'Biļešu Paradīze SIA' },
    { id: 3, name: 'PLG Lithuania', description: 'Bilietai LT UAB' },
    { id: 4, name: 'Kumu Art Museum', description: 'Eesti Kunstimuuseum' },
    { id: 5, name: 'Tallinn Arena', description: 'Saku Suurhall AS' },
    { id: 6, name: 'Estonian National Opera', description: 'Rahvusooper Estonia' },
  ];
  readonly selectedLegalEntity = signal<LegalEntitySwitchPanelViewModel | null>(this.legalEntities[0]);

  readonly localApps: PlgAppSwitcherItem[] = [
    { id: 'event-admin', label: 'Event Admin', icon: 'Events' },
    { id: 'pos', label: 'Point of Sale', icon: 'Ticket' },
    { id: 'portal', label: 'Portal', icon: 'Store 1' },
  ];
  readonly globalApps: PlgAppSwitcherItem[] = [
    { id: 'gds', label: 'Global Data System', icon: 'Cloud' },
  ];
  readonly selectedAppId = signal<string>('event-admin');

  readonly sections: NavSection[] = [
    {
      id: 'events',
      label: 'Events',
      icon: 'Calendar Check',
      pages: [
        { id: 'dashboard', label: 'Dashboard', icon: 'Chart Column', route: '/dashboard' },
        { id: 'events', label: 'Series & Events', icon: 'Blank Calendar', route: '/events' },
        { id: 'collections', label: 'Collections', icon: 'Tag', route: '/collections' },
        { id: 'programme', label: 'Programme of all events', icon: 'Calendar Check', route: '/programme' },
        { id: 'addons', label: 'Add-ons Configuration', icon: 'Dashboard Square', route: '/addons' },
      ],
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: 'Ticket',
      pages: [
        { id: 'templates', label: 'Templates', icon: 'Ticket 1', route: '/templates' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Cog 1',
      pages: [
        { id: 'event-templates', label: 'Event templates', icon: 'Copy 1', route: '/event-templates' },
      ],
    },
  ];

  readonly selectedSectionId = signal<string>('events');
  readonly selectedSection = computed(() =>
    this.sections.find(s => s.id === this.selectedSectionId()) ?? this.sections[0]);

  toggleSideMenu() { this.sideMenu()?.toggle(); }
  toggleMobileMenu() { this.mobileMenu()?.toggle(); }
  closeMobile() { this.mobileMenu()?.closeDialog(); }
  onMobileMenuClose() { this.topBar()?.resetMobileMenuToggleButton(); }
}
