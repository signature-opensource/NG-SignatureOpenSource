import { NavigationStart, NavigationEnd } from '@angular/router';

export interface RouterHistory {
  history: HistoryEntry[];
  currentIndex: number;

  event: NavigationStart | NavigationEnd;
  trigger: NavigationTrigger;
  id: number;
  idToRestore: number;
}

export interface HistoryEntry {
  id: number;
  url: string;
  queryParams: string;
}

export type NavigationTrigger = 'imperative' | 'popstate' | 'hashchange';
