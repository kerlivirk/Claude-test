import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-series-stub',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="stub">
      <mat-icon>layers</mat-icon>
      <h1>Create Series — coming in Phase 4</h1>
      <p>Series creation and management is the next milestone after the single event wizard.</p>
      <a mat-flat-button color="primary" routerLink="/events">
        <mat-icon>arrow_back</mat-icon>
        Back to events
      </a>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .stub {
      max-width: 480px;
      margin: 80px auto;
      text-align: center;
      font-family: Mulish, sans-serif;
      color: var(--text-primary);
    }
    mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: var(--brand-accent);
      margin-bottom: 16px;
    }
    h1 {
      font-size: 22px;
      margin: 0 0 8px;
      font-weight: 700;
    }
    p {
      color: var(--text-muted);
      font-size: 14px;
      margin: 0 0 24px;
      line-height: 1.5;
    }
  `],
})
export class CreateSeriesStubComponent {}
