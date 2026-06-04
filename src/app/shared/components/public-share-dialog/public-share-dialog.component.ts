import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

/**
 * Shares the public, live portal link for an event (the URL a buyer would open
 * on piletilevi.ee). Distinct from the organizer-share flow, which grants
 * back-office access to other organizers.
 */
@Component({
  selector: 'app-public-share-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="ps-dialog">
      <header class="ps-head">
        <div>
          <h1>Share event link</h1>
          <p>This is the public link buyers use on the Piletilevi portal.</p>
        </div>
        <button class="ps-close" (click)="close()" aria-label="Close"><mat-icon>Delete 1</mat-icon></button>
      </header>

      <div class="ps-body">
        <span class="ps-label">Public event page</span>
        <div class="ps-linkrow">
          <mat-icon class="ps-link-ico">Globe</mat-icon>
          <input class="ps-link" type="text" [value]="url" readonly (focus)="$any($event.target).select()" />
          <button class="ps-copy" [class.done]="copied()" (click)="copy()">
            <mat-icon>{{ copied() ? 'Check' : 'Copy 1' }}</mat-icon>
            {{ copied() ? 'Copied' : 'Copy' }}
          </button>
        </div>

        <span class="ps-label">Share to</span>
        <div class="ps-channels">
          <a class="ps-channel" [href]="url" target="_blank" rel="noopener">
            <mat-icon>Web</mat-icon> Open page
          </a>
          <a class="ps-channel" [href]="'mailto:?subject=' + encodedName + '&body=' + encodedUrl" target="_blank" rel="noopener">
            <mat-icon>Mail Send Envelope</mat-icon> Email
          </a>
        </div>
      </div>

      <footer class="ps-foot">
        <button class="ps-btn ps-btn-primary" (click)="close()">Done</button>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: Mulish, sans-serif; color: #11002b; }
    .ps-dialog { display: flex; flex-direction: column; background: #fff; width: min(480px, 96vw); border-radius: 16px; overflow: hidden; }
    .ps-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 20px 24px 14px; border-bottom: 1px solid #e9e7ed; }
    .ps-head h1 { margin: 0 0 4px; font-family: 'Panel Sans', Mulish, sans-serif; font-weight: 800; font-size: 18px; line-height: 24px; }
    .ps-head p { margin: 0; font: 400 13px/18px Mulish, sans-serif; color: #6d5f79; }
    .ps-close { width: 32px; height: 32px; border: 0; background: transparent; border-radius: 8px; cursor: pointer; color: #11002b; display: inline-flex; align-items: center; justify-content: center; }
    .ps-close:hover { background: #f8f7f9; }
    .ps-close mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .ps-body { padding: 16px 24px; }
    .ps-label { display: block; font: 500 12px/16px Mulish, sans-serif; color: #11002b; margin: 14px 0 6px; }
    .ps-label:first-child { margin-top: 0; }
    .ps-linkrow { display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 8px 0 12px; border: 1px solid #e9e7ed; border-radius: 10px; background: #f8f7f9; }
    .ps-link-ico { font-size: 16px; width: 16px; height: 16px; color: #6d5f79; flex-shrink: 0; }
    .ps-link { flex: 1; min-width: 0; border: 0; outline: none; background: transparent; font: 400 13px/20px Mulish, sans-serif; color: #11002b; }
    .ps-copy { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border: 0; border-radius: 8px; background: #11002b; color: #fff; font: 600 12px/16px Mulish, sans-serif; cursor: pointer; flex-shrink: 0; }
    .ps-copy:hover { background: #2a1547; }
    .ps-copy.done { background: #06d373; }
    .ps-copy mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .ps-channels { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .ps-channel { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 12px; border: 1px solid #e9e7ed; border-radius: 10px; background: #fff; color: #11002b; text-decoration: none; font: 600 13px/18px Mulish, sans-serif; }
    .ps-channel:hover { background: #f8f7f9; }
    .ps-channel mat-icon { font-size: 16px; width: 16px; height: 16px; color: #6d5f79; }
    .ps-foot { display: flex; justify-content: flex-end; padding: 14px 24px; border-top: 1px solid #e9e7ed; }
    .ps-btn { display: inline-flex; align-items: center; height: 40px; padding: 0 18px; border: 1px solid #e9e7ed; border-radius: 8px; background: #fff; font: 600 13px/18px Mulish, sans-serif; color: #11002b; cursor: pointer; }
    .ps-btn-primary { background: #11002b; border-color: #11002b; color: #fff; }
    .ps-btn-primary:hover { background: #2a1547; }
    @media (max-width: 480px) { .ps-channels { grid-template-columns: 1fr; } }
  `],
})
export class PublicShareDialogComponent {
  readonly eventName: string;
  readonly url: string;
  readonly encodedUrl: string;
  readonly encodedName: string;
  copied = signal(false);

  constructor(
    public ref: MatDialogRef<PublicShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { eventName: string; slug?: string },
  ) {
    this.eventName = data?.eventName ?? 'this event';
    const slug = (data?.slug || this.slugify(this.eventName)) || 'event';
    this.url = `https://www.piletilevi.ee/event/${slug}`;
    this.encodedUrl = encodeURIComponent(this.url);
    this.encodedName = encodeURIComponent(this.eventName);
  }

  private slugify(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  copy() {
    navigator.clipboard?.writeText(this.url).catch(() => {});
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  close() { this.ref.close(); }
}
