import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LineupSlot, LineupRole, LineupMember, gradientForName } from '../../../shared/models/artists';

type Page = 'menu' | 'profile' | 'slot' | 'members' | 'member';

@Component({
  selector: 'app-artist-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  template: `
    <div class="ad-dialog">
      <header class="ad-head">
        @if (page() !== 'menu') {
          <button class="ad-back" (click)="back()"><mat-icon>Tailless Line Arrow Left 1</mat-icon></button>
        }
        <h1>{{ title() }}</h1>
        <button class="ad-close" (click)="cancel()" aria-label="Close"><mat-icon>Delete 1</mat-icon></button>
      </header>

      <div class="ad-body">
        @switch (page()) {
          @case ('menu') {
            <div class="ad-hero">
              <span class="ad-avatar lg" [style.background]="slot.avatar">{{ slot.name.charAt(0) }}</span>
              <div>
                <h2>{{ slot.name }}</h2>
                <span class="ad-meta">
                  <span class="ad-badge" [class]="'ad-badge--' + slot.role">{{ roleLabel(slot.role) }}</span>
                  · {{ slot.time || '—' }} · {{ slot.members.length }} members
                </span>
              </div>
            </div>
            <button class="ad-row" (click)="page.set('profile')">
              <mat-icon>Pencil</mat-icon>
              <span class="ad-row-text"><strong>Edit profile</strong><small>photo · bio · socials</small></span>
              <mat-icon class="ad-row-caret">Tailless Line Arrow Right 1</mat-icon>
            </button>
            <button class="ad-row" (click)="page.set('slot')">
              <mat-icon>Circle Clock</mat-icon>
              <span class="ad-row-text"><strong>Slot settings</strong><small>{{ roleLabel(slot.role) }} · {{ slot.time || 'no time' }}</small></span>
              <mat-icon class="ad-row-caret">Tailless Line Arrow Right 1</mat-icon>
            </button>
            <button class="ad-row" (click)="page.set('members')">
              <mat-icon>User Group</mat-icon>
              <span class="ad-row-text"><strong>Members</strong><small>{{ slot.members.length }} members</small></span>
              <mat-icon class="ad-row-caret">Tailless Line Arrow Right 1</mat-icon>
            </button>
          }

          @case ('profile') {
            <span class="ad-label">Name</span>
            <input class="ad-input" type="text" [ngModel]="slot.name" (ngModelChange)="slot.name = $event" />
            <span class="ad-label">Slug</span>
            <input class="ad-input" type="text" [ngModel]="slot.slug" (ngModelChange)="slot.slug = $event" placeholder="/artist-name" />
            <span class="ad-label">Description <span class="ad-lang">English</span></span>
            <textarea class="ad-input" rows="4" [ngModel]="slot.description" (ngModelChange)="slot.description = $event" placeholder="Artist biography, achievements and background…"></textarea>
            <span class="ad-label">Internal notes</span>
            <textarea class="ad-input" rows="3" [ngModel]="slot.internalNotes" (ngModelChange)="slot.internalNotes = $event"></textarea>
          }

          @case ('slot') {
            <span class="ad-label">Role</span>
            <div class="ad-seg">
              @for (r of roles; track r) {
                <button class="ad-seg-btn" [class.active]="slot.role === r" (click)="slot.role = r">{{ roleLabel(r) }}</button>
              }
            </div>
            <span class="ad-label">Time on stage</span>
            <input class="ad-input" type="time" [ngModel]="slot.time" (ngModelChange)="slot.time = $event" />
          }

          @case ('members') {
            <div class="ad-members">
              @for (m of slot.members; track m.id) {
                <button class="ad-member" (click)="openMember(m)">
                  <span class="ad-avatar sm" [style.background]="memberAvatar(m.name)">{{ m.name.charAt(0) }}</span>
                  <span class="ad-row-text"><strong>{{ m.name }}</strong><small>{{ m.role }}</small></span>
                  <mat-icon class="ad-row-caret">Tailless Line Arrow Right 1</mat-icon>
                </button>
              }
              @if (slot.members.length === 0) {
                <div class="ad-empty">No members yet.</div>
              }
            </div>
            <button class="ad-add" (click)="addMember()"><mat-icon>Add 1</mat-icon> Add member</button>
          }

          @case ('member') {
            <span class="ad-label">Name</span>
            <input class="ad-input" type="text" [ngModel]="editMember()!.name" (ngModelChange)="editMember()!.name = $event" />
            <span class="ad-label">Role <span class="ad-lang">English</span></span>
            <input class="ad-input" type="text" [ngModel]="editMember()!.role" (ngModelChange)="editMember()!.role = $event" placeholder="e.g. Vocalist, Guitarist" />
            <button class="ad-remove-member" (click)="removeMember(editMember()!)"><mat-icon>Trash</mat-icon> Remove member</button>
          }
        }
      </div>

      <footer class="ad-foot">
        @if (page() === 'menu') {
          <button class="ad-btn ad-btn-danger" (click)="removeSlot()"><mat-icon>Trash</mat-icon> Remove</button>
        }
        <span class="ad-foot-spacer"></span>
        <button class="ad-btn ad-btn-ghost" (click)="page() === 'menu' ? cancel() : back()">{{ page() === 'menu' ? 'Cancel' : 'Back' }}</button>
        <button class="ad-btn ad-btn-primary" (click)="page() === 'menu' ? save() : back()">{{ page() === 'menu' ? 'Save' : 'Done' }}</button>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: Mulish, sans-serif; color: #11002b; }
    .ad-dialog { display: flex; flex-direction: column; background: #fff; width: min(440px, 96vw); max-height: 88vh; border-radius: 16px; overflow: hidden; }
    .ad-head { display: flex; align-items: center; gap: 8px; padding: 16px 20px 12px; border-bottom: 1px solid #e9e7ed; }
    .ad-head h1 { margin: 0; flex: 1; font-family: 'Panel Sans', Mulish, sans-serif; font-weight: 800; font-size: 17px; line-height: 22px; }
    .ad-back, .ad-close { width: 30px; height: 30px; border: 0; background: transparent; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    .ad-back:hover, .ad-close:hover { background: #f8f7f9; }
    .ad-back mat-icon, .ad-close mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .ad-body { flex: 1; overflow-y: auto; padding: 16px 20px; }
    .ad-hero { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .ad-hero h2 { margin: 0; font: 700 16px/22px Mulish, sans-serif; }
    .ad-meta { font: 500 12px/16px Mulish, sans-serif; color: #6d5f79; display: inline-flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .ad-avatar { border-radius: 9999px; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
    .ad-avatar.lg { width: 48px; height: 48px; font-size: 18px; }
    .ad-avatar.sm { width: 32px; height: 32px; font-size: 13px; }
    .ad-badge { display: inline-flex; align-items: center; height: 20px; padding: 0 8px; border-radius: 9999px; font: 600 10px/20px Mulish, sans-serif; }
    .ad-badge--headliner { background: #ddfbea; color: #19633d; }
    .ad-badge--opener { background: #ddfbea; color: #19633d; }
    .ad-badge--support { background: #f4f2f5; color: #6d5f79; }
    .ad-row, .ad-member { display: grid; grid-template-columns: 20px 1fr 18px; align-items: center; gap: 12px; width: 100%; padding: 12px 14px; background: #fff; border: 1px solid #e9e7ed; border-radius: 10px; cursor: pointer; text-align: left; margin-bottom: 8px; }
    .ad-member { grid-template-columns: 32px 1fr 18px; }
    .ad-row:hover, .ad-member:hover { background: #f8f7f9; }
    .ad-row > mat-icon:first-child { font-size: 18px; width: 18px; height: 18px; color: #6d5f79; }
    .ad-row-text { display: flex; flex-direction: column; min-width: 0; }
    .ad-row-text strong { font: 600 14px/20px Mulish, sans-serif; }
    .ad-row-text small { font: 400 12px/16px Mulish, sans-serif; color: #6d5f79; }
    .ad-row-caret { font-size: 16px; width: 16px; height: 16px; color: #6d5f79; }
    .ad-label { display: inline-flex; gap: 6px; align-items: center; font: 500 12px/16px Mulish, sans-serif; margin: 14px 0 6px; }
    .ad-label:first-child { margin-top: 0; }
    .ad-lang { height: 18px; padding: 0 6px; background: #ddfbea; color: #19633d; border-radius: 9999px; font: 600 10px/18px Mulish, sans-serif; }
    .ad-input { width: 100%; padding: 0 12px; height: 40px; border: 1px solid #e9e7ed; border-radius: 8px; font: 400 14px/20px Mulish, sans-serif; color: #11002b; outline: none; }
    textarea.ad-input { height: auto; padding: 10px 12px; resize: vertical; }
    .ad-input:focus { border-color: #11002b; }
    .ad-seg { display: inline-flex; gap: 4px; padding: 4px; background: #f4f2f5; border-radius: 10px; }
    .ad-seg-btn { height: 30px; padding: 0 14px; border: 0; background: transparent; border-radius: 7px; font: 600 13px/18px Mulish, sans-serif; color: #6d5f79; cursor: pointer; }
    .ad-seg-btn.active { background: #fff; color: #11002b; box-shadow: 0 1px 2px rgba(17,0,43,.1); }
    .ad-add { display: inline-flex; align-items: center; gap: 6px; margin-top: 4px; padding: 9px 14px; border: 1px dashed #c1b9cc; background: transparent; border-radius: 8px; font: 600 13px/18px Mulish, sans-serif; color: #11002b; cursor: pointer; }
    .ad-add mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .ad-empty { padding: 14px; text-align: center; color: #6d5f79; font: 400 13px/18px Mulish, sans-serif; }
    .ad-remove-member { display: inline-flex; align-items: center; gap: 6px; margin-top: 16px; padding: 9px 14px; border: 1px solid #f3c2c4; background: #fff; border-radius: 8px; font: 600 13px/18px Mulish, sans-serif; color: #b3261e; cursor: pointer; }
    .ad-remove-member mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .ad-foot { display: flex; align-items: center; gap: 8px; padding: 14px 20px; border-top: 1px solid #e9e7ed; }
    .ad-foot-spacer { flex: 1; }
    .ad-btn { display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 16px; border: 1px solid #e9e7ed; border-radius: 8px; background: #fff; font: 600 13px/18px Mulish, sans-serif; color: #11002b; cursor: pointer; }
    .ad-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .ad-btn-ghost { background: transparent; border-color: transparent; }
    .ad-btn-ghost:hover { background: #f8f7f9; }
    .ad-btn-primary { background: #11002b; border-color: #11002b; color: #fff; }
    .ad-btn-danger { border-color: #f3c2c4; color: #b3261e; }
    .ad-btn-danger:hover { background: #fdecea; }
  `],
})
export class ArtistDialogComponent {
  slot: LineupSlot;
  readonly roles: LineupRole[] = ['headliner', 'opener', 'support'];

  page = signal<Page>('menu');
  editMember = signal<LineupMember | null>(null);

  constructor(
    public ref: MatDialogRef<ArtistDialogComponent, { action: 'save' | 'remove'; slot: LineupSlot } | undefined>,
    @Inject(MAT_DIALOG_DATA) data: { slot: LineupSlot },
  ) {
    // Work on a copy so Cancel discards changes
    this.slot = { ...data.slot, members: data.slot.members.map(m => ({ ...m })) };
  }

  title() {
    switch (this.page()) {
      case 'profile': return 'Edit profile';
      case 'slot': return 'Slot settings';
      case 'members': return 'Members';
      case 'member': return 'Member';
      default: return 'Artist';
    }
  }

  roleLabel(r: LineupRole) { return r.charAt(0).toUpperCase() + r.slice(1); }
  memberAvatar(name: string) { return gradientForName(name); }

  back() {
    if (this.page() === 'member') { this.page.set('members'); this.editMember.set(null); }
    else this.page.set('menu');
  }

  openMember(m: LineupMember) { this.editMember.set(m); this.page.set('member'); }
  addMember() {
    const m: LineupMember = { id: 'm' + Date.now(), name: 'New member', role: '' };
    this.slot.members = [...this.slot.members, m];
    this.openMember(m);
  }
  removeMember(m: LineupMember) {
    this.slot.members = this.slot.members.filter(x => x.id !== m.id);
    this.back();
  }

  save() { this.ref.close({ action: 'save', slot: this.slot }); }
  removeSlot() { this.ref.close({ action: 'remove', slot: this.slot }); }
  cancel() { this.ref.close(); }
}
