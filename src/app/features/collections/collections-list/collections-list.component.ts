import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-collections-list',
  standalone: true,
  imports: [CommonModule],
  template: `<div style="padding:24px;background:#fff;border-radius:12px;border:1px solid #e9e7ed"><h2 style="font-family:Mulish,sans-serif;color:#11002b;margin:0">Collections</h2><p style="color:#84738f;font-family:Mulish,sans-serif">Collections management coming soon.</p></div>`
})
export class CollectionsListComponent {}
