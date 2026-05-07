import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule],
  template: `
    <mat-sidenav-container class="app-container">
      <mat-sidenav mode="side" opened class="app-sidenav">
        <div class="logo">
          <span class="logo-icon">🎫</span>
          <span class="logo-text">PLG Back Office</span>
        </div>
        <nav class="nav">
          @for (group of navGroups; track group.title) {
            <div class="nav-group">
              <p class="nav-group-title">{{ group.title }}</p>
              <div class="nav-items">
                @for (item of group.items; track item.route) {
                  <a [routerLink]="item.route" routerLinkActive="nav-active" class="nav-item">
                    <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                    <span class="nav-label">{{ item.label }}</span>
                  </a>
                }
              </div>
            </div>
          }
        </nav>
        <div class="user">
          <div class="avatar">AK</div>
          <div class="user-info">
            <p class="uname">Annika Kütt</p>
            <p class="urole">Admin</p>
          </div>
        </div>
      </mat-sidenav>
      <mat-sidenav-content class="app-content">
        <div class="topbar">
          <div class="topbar-right">
            <button mat-icon-button><mat-icon>notifications_none</mat-icon></button>
            <button mat-icon-button><mat-icon>help_outline</mat-icon></button>
          </div>
        </div>
        <div class="page"><router-outlet /></div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .app-container { height: 100vh; }
    .app-sidenav {
      width: 244px;
      background: #f5f5f5;
      border-right: 1px solid #e9e7ed;
      display: flex;
      flex-direction: column;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 20px 16px;
      border-bottom: 1px solid #e9e7ed;
    }
    .logo-icon { font-size: 18px; }
    .logo-text {
      font-size: 13px;
      font-weight: 700;
      color: #11002b;
      font-family: Mulish, sans-serif;
    }
    .nav { flex: 1; padding: 16px 16px; overflow-y: auto; }
    .nav-group { margin-bottom: 24px; }
    .nav-group-title {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: .5px;
      color: #84738f;
      margin: 0 16px 12px;
      font-family: Mulish, sans-serif;
    }
    .nav-items { display: flex; flex-direction: column; gap: 4px; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      text-decoration: none;
      color: #11002b;
      font-size: 14px;
      font-family: Mulish, sans-serif;
      letter-spacing: .1px;
      transition: background .15s;
    }
    .nav-item:hover { background: rgba(17,0,43,.05); }
    .nav-active {
      background: #11002b !important;
      color: #fff !important;
      border-radius: 9999px !important;
      font-weight: 500;
    }
    .nav-active .nav-icon { color: #fff; }
    .nav-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #11002b;
      flex-shrink: 0;
    }
    .nav-label { flex: 1; }
    .user {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 20px;
      border-top: 1px solid #e9e7ed;
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #06d373;
      color: #11002b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      font-family: Mulish, sans-serif;
      flex-shrink: 0;
    }
    .user-info { min-width: 0; }
    .uname { font-size: 13px; font-weight: 600; color: #11002b; margin: 0; font-family: Mulish, sans-serif; }
    .urole { font-size: 11px; color: #84738f; margin: 0; font-family: Mulish, sans-serif; }
    .app-content { background: #fff; }
    .topbar {
      background: #fff;
      border-bottom: 1px solid #e9e7ed;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .topbar-right { display: flex; gap: 4px; }
    .page { padding: 24px; min-height: calc(100vh - 56px); }
  `]
})
export class App {
  navGroups: NavGroup[] = [
    {
      title: 'EVENTS & SERIES',
      items: [
        { label: 'Dashboard', icon: 'bar_chart', route: '/dashboard' },
        { label: 'Single Events & Series', icon: 'calendar_today', route: '/events' },
        { label: 'Collections', icon: 'sell', route: '/collections' },
        { label: 'Programme of all events', icon: 'event', route: '/programme' },
        { label: 'Add-ons Configuration', icon: 'extension', route: '/addons' },
      ],
    },
    {
      title: 'TICKET SETUP',
      items: [
        { label: 'Templates', icon: 'confirmation_number', route: '/templates' },
      ],
    },
    {
      title: 'EVENT SETTINGS',
      items: [
        { label: 'Event templates', icon: 'content_copy', route: '/event-templates' },
      ],
    },
  ];
}
