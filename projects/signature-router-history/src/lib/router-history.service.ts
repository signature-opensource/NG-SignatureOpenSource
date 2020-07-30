import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router, NavigationStart, NavigationEnd, Event } from '@angular/router';
import { filter, scan } from 'rxjs/operators';
import { RouterHistory, HistoryEntry } from '../lib/router-history.model';
import { Location, PopStateEvent, LocationStrategy } from '@angular/common';

export type RouterNavigationEvent = NavigationStart | NavigationEnd;

@Injectable({
  providedIn: 'root'
})
export class RouterHistoryService {
  public previousUrl$: BehaviorSubject<string | null>;
  public currentUrl$: BehaviorSubject<string | null>;
  public browserBack$: Subject<PopStateEvent>;
  public browserForward$: Subject<PopStateEvent>;

  private currentIndex: number;
  private historyList: Array<HistoryEntry>;
  private historyCallbacks: { [id: string]: Array<() => void> };

  constructor(
    private router: Router,
    private location: Location,
    private locationStrategy: LocationStrategy
  ) {
    this.previousUrl$ = new BehaviorSubject<string | null>(null);
    this.currentUrl$ = new BehaviorSubject<string | null>(null);
    this.browserBack$ = new Subject<PopStateEvent>();
    this.browserForward$ = new Subject<PopStateEvent>();

    this.currentIndex = 0;
    this.historyList = new Array<HistoryEntry>();
    this.historyCallbacks = {};

    // Listen to browser forward and backward events, to execute the corresponding callback
    this.location.subscribe((event: PopStateEvent) => {
      const callbackList = this.historyCallbacks[event.state.navigationId];
      if (callbackList && callbackList.length > 0) {
        callbackList[callbackList.length - 1]();
        callbackList.splice(callbackList.length - 1);
      }
    });

    // Build navigation history, according to Angular's router history
    // ( cf https://semanticbits.com/route-history-service-in-angular )
    this.router.events
      .pipe(
        filter<Event, RouterNavigationEvent>(
          (event: Event): event is RouterNavigationEvent =>
            event instanceof NavigationStart || event instanceof NavigationEnd
        ),
        scan<RouterNavigationEvent, RouterHistory>(
          (acc: any, event) => {
            if (event instanceof NavigationStart) {
              return {
                ...acc,
                event,
                trigger: event.navigationTrigger,
                id: event.id,
                idToRestore:
                  (event.restoredState && event.restoredState.navigationId) ||
                  undefined
              };
            }

            // NavigationEnd events
            const history = [...acc.history];
            let currentIndex = acc.currentIndex;

            // router events are imperative (router.navigate or routerLink)
            if (acc.trigger === 'imperative') {
              // remove all events in history that come after the current index
              history.splice(currentIndex + 1);

              // add the new event to the end of the history and set that as our current index
              const fullPath = event.urlAfterRedirects.split('?');
              history.push({ id: acc.id, url: fullPath[0], queryParams: fullPath.length > 1 ? fullPath[1] : '' });
              currentIndex = history.length - 1;
            }

            // browser events (back/forward) are popstate events
            if (acc.trigger === 'popstate') {
              // get the history item that references the idToRestore
              const idx = history.findIndex(x => x.id === acc.idToRestore);

              // if found, set the current index to that history item and update the id
              if (idx > -1) {
                currentIndex = idx;
                history[idx].id = acc.id;
              } else {
                currentIndex = 0;
              }
            }

            return {
              ...acc,
              event,
              history,
              currentIndex
            };
          },
          {
            event: null,
            history: [],
            trigger: null,
            id: 0,
            idToRestore: 0,
            currentIndex: 0
          } as any
        ),
        filter(
          ({ event, trigger }) => event instanceof NavigationEnd && !!trigger
        )
      )
      .subscribe(({ history, currentIndex }: any) => {
        const previous = history[currentIndex - 1];
        const current = history[currentIndex];
        this.currentIndex = currentIndex;
        this.historyList = history;

        // update current and previous urls
        this.previousUrl$.next(previous ? previous.url : null);
        this.currentUrl$.next(current.url);
      });
  }

  // Pushes HistoryEntry and manages callbacks
  public async pushState(title: string, queryParams?: string, url?: string, callback?: () => void): Promise<void> {
    if (!url) {
      url = this.historyList[this.currentIndex].url;
    }
    if (!queryParams) {
      queryParams = '';
    }

    this.locationStrategy.pushState(
      { navigationId: this.historyList[this.currentIndex].id + 1 },
      title,
      url,
      queryParams
    );
    this.historyList.push({ id: history.state, url, queryParams });
    this.previousUrl$.next(this.currentUrl$.getValue());
    this.currentUrl$.next(url + queryParams);

    if (callback) {
      if (this.historyCallbacks[this.historyList[this.currentIndex].id]) {
        this.historyCallbacks[this.historyList[this.currentIndex].id].push(callback);
      } else {
        this.historyCallbacks[this.historyList[this.currentIndex].id] = [callback];
      }
    }
  }
}
