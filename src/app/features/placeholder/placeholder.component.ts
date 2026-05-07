import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="ph">
      <mat-icon>construction</mat-icon>
      <h1>{{ title }}</h1>
      <p>This area is on the roadmap. Phase 1 ships single events &amp; series first.</p>
      <a mat-flat-button color="primary" routerLink="/events">
        <mat-icon>arrow_back</mat-icon>
        Go to Single Events &amp; Series
      </a>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ph {
      max-width: 520px;
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
    h1 { font-size: 24px; margin: 0 0 8px; font-weight: 800; }
    p { color: var(--text-muted); font-size: 14px; margin: 0 0 24px; line-height: 1.5; }
  `],
})
export class PlaceholderComponent {
  private route = inject(ActivatedRoute);
  title = this.route.snapshot.data?.['title'] ?? 'Coming soon';
}
