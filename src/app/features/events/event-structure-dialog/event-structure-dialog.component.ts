import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type EventStructureChoice = 'single' | 'series' | 'collection' | 'timeslot';

interface ChoiceOption {
  id: EventStructureChoice;
  title: string;
  description: string;
  icon: string;
  hint: string;
}

@Component({
  selector: 'app-event-structure-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-header">
      <div>
        <h2 mat-dialog-title>Create new</h2>
        <p class="dialog-subtitle">Pick a structure to start with</p>
      </div>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <div class="choice-grid">
        @for (opt of options; track opt.id) {
          <button class="choice-card"
                  [class.selected]="selected() === opt.id"
                  (click)="selected.set(opt.id)">
            <div class="choice-icon">
              <mat-icon>{{ opt.icon }}</mat-icon>
            </div>
            <div class="choice-body">
              <h3>{{ opt.title }}</h3>
              <p>{{ opt.description }}</p>
              <span class="choice-hint">{{ opt.hint }}</span>
            </div>
            <mat-icon class="choice-check">{{ selected() === opt.id ? 'radio_button_checked' : 'radio_button_unchecked' }}</mat-icon>
          </button>
        }
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary"
              [disabled]="!selected()"
              (click)="confirm()">
        Continue
        <mat-icon iconPositionEnd>arrow_forward</mat-icon>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: block; font-family: Mulish, sans-serif; }
    .dialog-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 24px 24px 8px;
    }
    .dialog-header h2 {
      margin: 0 0 4px;
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .dialog-subtitle {
      margin: 0;
      font-size: 13px;
      color: var(--text-muted);
    }
    mat-dialog-content {
      padding: 8px 24px 16px !important;
      max-height: 60vh;
    }
    .choice-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .choice-card {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--stroke-default);
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      text-align: left;
      cursor: pointer;
      transition: border-color .15s, background .15s, box-shadow .15s;
      font-family: Mulish, sans-serif;
    }
    .choice-card:hover {
      border-color: var(--brand-accent);
      background: var(--bg-subtle);
    }
    .choice-card.selected {
      border-color: var(--brand-primary);
      background: #fff;
      box-shadow: 0 0 0 2px rgba(17,0,43,0.08);
    }
    .choice-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--bg-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .choice-icon mat-icon {
      color: var(--brand-primary);
      font-size: 22px;
      width: 22px;
      height: 22px;
    }
    .choice-body h3 {
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .choice-body p {
      margin: 0 0 6px;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .choice-hint {
      font-size: 11px;
      color: var(--text-muted);
      font-style: italic;
    }
    .choice-check {
      color: var(--text-muted);
      flex-shrink: 0;
    }
    .selected .choice-check {
      color: var(--brand-primary);
    }
    mat-dialog-actions {
      padding: 16px 24px 20px !important;
      gap: 8px;
    }
    @media (max-width: 600px) {
      .choice-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class EventStructureDialogComponent {
  selected = signal<EventStructureChoice | null>(null);

  options: ChoiceOption[] = [
    {
      id: 'single',
      title: 'Single Event',
      description: 'A standalone event with one date and a single ticket allocation.',
      icon: 'event',
      hint: 'Best for concerts, talks, screenings.',
    },
    {
      id: 'series',
      title: 'Series',
      description: 'Group multiple events under one umbrella with shared metadata.',
      icon: 'layers',
      hint: 'Tours, festivals, recurring shows.',
    },
    {
      id: 'collection',
      title: 'Collection',
      description: 'Curated grouping of events for promotion (no shared sales).',
      icon: 'sell',
      hint: 'Themed lineups, season highlights.',
    },
    {
      id: 'timeslot',
      title: 'Time-Slot Event',
      description: 'One event with multiple time slots customers pick from.',
      icon: 'schedule',
      hint: 'Exhibitions, workshops, museum tours.',
    },
  ];

  constructor(private dialogRef: MatDialogRef<EventStructureDialogComponent, EventStructureChoice>) {}

  confirm() {
    const choice = this.selected();
    if (choice) this.dialogRef.close(choice);
  }
}
