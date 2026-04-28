import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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
          <span>🎫</span><span class="logo-text">PLG Back Office</span>
        </div>
        <nav class="nav">
          <p class="nav-group">EVENTS & SERIES</p>
          <a routerLink="/programme" routerLinkActive="nav-active" class="nav-item">
            <mat-icon class="nav-icon">view_list</mat-icon>
            <span>Programme of Events</span>
          </a>
          <a routerLink="/events" routerLinkActive="nav-active" class="nav-item">
            <mat-icon class="nav-icon">calendar_today</mat-icon>
            <span>Single Events & Series</span>
          </a>
          <a routerLink="/collections" routerLinkActive="nav-active" class="nav-item">
            <mat-icon class="nav-icon">folder_open</mat-icon>
            <span>Collections</span>
          </a>
          <p class="nav-group">REPORTS</p>
          <a routerLink="/reports" routerLinkActive="nav-active" class="nav-item">
            <mat-icon class="nav-icon">bar_chart</mat-icon>
            <span>Sales Overview</span>
          </a>
          <p class="nav-group">SETTINGS</p>
          <a routerLink="/settings" routerLinkActive="nav-active" class="nav-item">
            <mat-icon class="nav-icon">settings</mat-icon>
            <span>General Settings</span>
          </a>
        </nav>
        <div class="user">
          <div class="avatar">AK</div>
          <div><p class="uname">Annika Kütt</p><p class="urole">Admin</p></div>
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
    .app-sidenav { width: 244px; background: #11002b; border-right: none; display: flex; flex-direction: column; }
    .logo { display: flex; align-items: center; gap: 10px; padding: 20px 16px 16px; border-bottom: 1px solid rgba(255,255,255,.08); }
    .logo-text { font-size: 13px; font-weight: 700; color: #fff; font-family: Mulish, sans-serif; }
    .nav { flex: 1; padding: 12px 10px; overflow-y: auto; }
    .nav-group { font-size: 10px; font-weight: 700; letter-spacing: .08em; color: rgba(255,255,255,.3); margin: 16px 0 6px 8px; font-family: Mulish, sans-serif; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; text-decoration: none; color: rgba(255,255,255,.6); font-size: 13px; font-weight: 500; font-family: Mulish, sans-serif; margin-bottom: 2px; transition: all .15s; }
    .nav-item:hover { background: rgba(255,255,255,.08); color: #fff; }
    .nav-active { background: #06d373 !important; color: #11002b !important; font-weight: 600; }
    .nav-icon { font-size: 18px; width: 18px; height: 18px; color: inherit; }
    .user { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-top: 1px solid rgba(255,255,255,.08); }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: #06d373; color: #11002b; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; font-family: Mulish, sans-serif; flex-shrink: 0; }
    .uname { font-size: 13px; font-weight: 600; color: #fff; margin: 0; font-family: Mulish, sans-serif; }
    .urole { font-size: 11px; color: rgba(255,255,255,.4); margin: 0; font-family: Mulish, sans-serif; }
    .app-content { background: #f4f2f5; }
    .topbar { background: #fff; border-bottom: 1px solid #e9e7ed; height: 56px; display: flex; align-items: center; justify-content: flex-end; padding: 0 24px; position: sticky; top: 0; z-index: 10; }
    .topbar-right { display: flex; gap: 4px; }
    .page { padding: 24px; }
  `]
})
export class App {}
