import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">

      <!-- Sidebar -->
      <mat-sidenav mode="side" opened class="sidenav">

        <!-- Logo / App name -->
        <div class="sidenav-header">
          <div class="logo">
            <span class="logo-icon">🎫</span>
            <span class="logo-text">PLG Back Office</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="sidenav-nav">
          @for (section of navSections; track section.label) {
            <div class="nav-section">
              <p class="nav-section-label">{{ section.label }}</p>
              @for (item of section.items; track item.route) {
                <a
                  [routerLink]="item.route"
                  routerLinkActive="active"
                  class="nav-item"
                  [matTooltip]="item.label"
                  matTooltipPosition="right"
                >
                  <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                  <span class="nav-label">{{ item.label }}</span>
                </a>
              }
            </div>
          }
        </nav>

        <!-- User section -->
        <div class="sidenav-footer">
          <div class="user-info">
            <div class="user-avatar">AK</div>
            <div class="user-details">
              <p class="user-name">Annika Kütt</p>
              <p class="user-role">Admin</p>
            </div>
          </div>
        </div>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="main-content">

        <!-- Top bar -->
        <mat-toolbar class="topbar">
          <div class="topbar-left">
            <ng-content select="[topbar-title]" />
          </div>
          <div class="topbar-right">
            <button mat-icon-button>
              <mat-icon>notifications_none</mat-icon>
            </button>
            <button mat-icon-button>
              <mat-icon>help_outline</mat-icon>
            </button>
          </div>
        </mat-toolbar>

        <!-- Page content -->
        <div class="page-content">
          <ng-content />
        </div>
      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    /* ── Sidebar ── */
    .sidenav {
      width: 240px;
      background-color: var(--bg-surface-dark, #11002b);
      display: flex;
      flex-direction: column;
    }

    .sidenav-header {
      padding: 1.5rem 1rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 1.5rem;
    }

    .logo-text {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-on-surface-dark-primary, #fff);
      letter-spacing: -0.01em;
    }

    /* ── Nav ── */
    .sidenav-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      overflow-y: auto;
    }

    .nav-section {
      margin-bottom: 1.5rem;
    }

    .nav-section-label {
      font-size: 0.625rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.35);
      margin: 0 0 0.5rem 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: var(--radius-md, 0.5rem);
      text-decoration: none;
      color: rgba(255,255,255,0.6);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.15s ease;
      margin-bottom: 0.125rem;

      &:hover {
        background-color: rgba(255,255,255,0.08);
        color: #fff;
      }

      &.active {
        background-color: var(--bg-brand, #06d373);
        color: var(--text-on-brand-primary, #11002b);

        .nav-icon {
          color: var(--text-on-brand-primary, #11002b);
        }
      }
    }

    .nav-icon {
      font-size: 1.125rem;
      width: 1.125rem;
      height: 1.125rem;
      color: inherit;
    }

    .nav-label {
      line-height: 1;
    }

    /* ── Footer ── */
    .sidenav-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background-color: var(--bg-brand, #06d373);
      color: var(--text-on-brand-primary, #11002b);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #fff;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.6875rem;
      color: rgba(255,255,255,0.45);
      margin: 0;
    }

    /* ── Topbar ── */
    .topbar {
      background-color: var(--bg-surface, #fff);
      border-bottom: 1px solid var(--stroke-on-surface-primary, #e9e7ed);
      height: 56px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 0.25rem;

      button {
        color: var(--text-on-surface-secondary, #5a5062);
      }
    }

    /* ── Main content ── */
    .main-content {
      background-color: var(--bg-neutral, #f4f2f5);
    }

    .page-content {
      padding: 1.5rem;
      min-height: calc(100vh - 56px);
    }
  `]
})
export class SidenavComponent {
  readonly navSections: NavSection[] = [
    {
      label: 'Events & Series',
      items: [
        { label: 'Single Events & Series', icon: 'calendar_today', route: '/events' },
        { label: 'Collections', icon: 'folder_open', route: '/collections' },
      ]
    },
    {
      label: 'Reports',
      items: [
        { label: 'Sales Overview', icon: 'bar_chart', route: '/reports/sales' },
        { label: 'Daily Reports', icon: 'today', route: '/reports/daily' },
      ]
    },
    {
      label: 'Settings',
      items: [
        { label: 'General Settings', icon: 'settings', route: '/settings' },
        { label: 'Venues', icon: 'location_on', route: '/venues' },
        { label: 'Tracking Pixels', icon: 'track_changes', route: '/tracking' },
      ]
    }
  ];
}
