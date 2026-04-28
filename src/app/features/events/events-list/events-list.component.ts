import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

interface Ev { id:string; name:string; category:string; date:string; venue:string; status:string; ticketsSold:number; totalTickets:number; }

const MOCK: Ev[] = [
  {id:'1',name:'Jazz Night',category:'Music',date:'2026-02-12',venue:'Tallinn Arena',status:'Active',ticketsSold:324,totalTickets:500},
  {id:'2',name:'Rock Festival',category:'Music',date:'2026-06-20',venue:'Song Festival Grounds',status:'Scheduled',ticketsSold:0,totalTickets:2000},
  {id:'3',name:'Contemporary Dance',category:'Dance',date:'2026-03-05',venue:'Estonian National Opera',status:'Active',ticketsSold:180,totalTickets:400},
  {id:'4',name:'Comedy Night',category:'Comedy',date:'2026-01-30',venue:'Comedy Club Tallinn',status:'Ended',ticketsSold:150,totalTickets:150},
  {id:'5',name:'Art Exhibition Opening',category:'Art',date:'2026-04-10',venue:'Kumu Art Museum',status:'Draft',ticketsSold:0,totalTickets:300},
];

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatMenuModule],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss',
})
export class EventsListComponent {
  readonly ev = signal<Ev[]>(MOCK);
  q = ''; sf = ''; tab: 'events'|'series' = 'events';

  get fe() {
    let l = this.ev();
    const q = this.q.toLowerCase(), s = this.sf;
    if (q) l = l.filter(e => e.name.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));
    if (s) l = l.filter(e => e.status === s);
    return l;
  }

  bs(s: string) { return 'badge badge-' + s.toLowerCase(); }

  ts(e: Ev) {
    if (e.ticketsSold >= e.totalTickets) return 'Sold out';
    if (e.totalTickets > 0) return 'Configured';
    return 'Not configured';
  }

  tsCls(e: Ev) {
    const s = this.ts(e);
    return 'mi ' + (s === 'Sold out' ? 'tr' : s === 'Configured' ? 'tg' : 'to');
  }

  fmtDate(d: string) { return new Date(d).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}); }
}
