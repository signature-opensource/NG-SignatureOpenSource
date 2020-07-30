import { Injectable, Optional } from '@angular/core';
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { BreadcrumbLocation, BreadcrumbLocations } from './breadcrumb.model';

export class BreadcrumbServiceConfig {
  autoGenerate: boolean = true;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private readonly _breadcrumb: BehaviorSubject<BreadcrumbLocations>;
  private oldBreadcrumb: BreadcrumbLocations;

  public readonly breadcrumb: Observable<BreadcrumbLocations>;

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    @Optional() config?: BreadcrumbServiceConfig
  )
  {
    this._breadcrumb = new BehaviorSubject<BreadcrumbLocations>([]);
    this.breadcrumb = this._breadcrumb.asObservable();
    this.oldBreadcrumb = [];

    // Check if the config disable the auto-breadcrumb
    // Activated by default
    if (!config || config.autoGenerate) {
      this.registerRouterChange();
    }
  }

  public get CurrentLocation(): BreadcrumbLocation {
    return this._breadcrumb.value[this._breadcrumb.value.length - 1];
  }
  /**
   * SetLocation
   * Sets all the locations
   * @param breadcrumbLocations
   */
  public SetLocation(breadcrumbLocations: BreadcrumbLocations) {
    this._breadcrumb.next(breadcrumbLocations);
  }

  /**
   * PushLocation
   * Pushes a BreadcrumbLocation at the end the breadcrumb
   * @param breadcrumbLocation
   */
  public PushLocation(breadcrumbLocation: BreadcrumbLocation) {
    this._breadcrumb.next(this._breadcrumb.value.concat([breadcrumbLocation]));
  }

  /**
   * PopLocation
   * Pops the specified amount of BreadcrumbLocations from the end of the breadcrumb
   * @param amount
   */
  public PopLocation(amount: number = 1) {
    const idx = this._breadcrumb.value.length - amount;
    this._breadcrumb.next(this._breadcrumb.value.slice(0, idx));
  }

  /**
   * On Navigation, regenerate breadcrumb.
   */
  private registerRouterChange(): void {
    this._router.events.pipe(
      filter<Event, NavigationEnd>(
        (event: Event): event is NavigationEnd => event instanceof NavigationEnd
      ),
      distinctUntilChanged(),
    ).subscribe(() => {
      const newBreadcrumb = this.buildBreadCrumb(this._activatedRoute.root);
      let hasChanged: boolean = false;

      if (newBreadcrumb.length === this.oldBreadcrumb.length) {
        for (let i = 0; i < newBreadcrumb.length; i++) {
          if (newBreadcrumb[i].label !== this.oldBreadcrumb[i].label || newBreadcrumb[i].url !== this.oldBreadcrumb[i].url) {
            hasChanged = true;
            break;
          }
        }
      } else {
        hasChanged = true;
      }

      if (hasChanged) {
        this._breadcrumb.next(newBreadcrumb);
        this.oldBreadcrumb = newBreadcrumb;
      }
    });
  }

  /**
   * Recursively build breadcrumb according to activated route.
   * @param route
   * @param url
   * @param breadcrumbs
   */
  private buildBreadCrumb(route: ActivatedRoute, url: string = '', breadcrumbs: BreadcrumbLocations = []): BreadcrumbLocations {
    // If no routeConfig is available we are on the root path
    let label = route.routeConfig && route.routeConfig.data ? route.routeConfig.data.breadcrumb : '';
    let path = route.routeConfig && route.routeConfig.data ? route.routeConfig.path : '';

    // If the route is dynamic route such as ':id', remove it
    const lastRoutePart = path!.split('/').pop();
    const isDynamicRoute = lastRoutePart!.startsWith(':');
    if (isDynamicRoute && !!route.snapshot) {
      const paramName = lastRoutePart!.split(':')[1];
      path = path!.replace(lastRoutePart!, route.snapshot.params[paramName]);
      label = route.snapshot.params[paramName];
    }

    // In the routeConfig the complete path is not available,
    // so we rebuild it each time
    const nextUrl = path ? `${url}/${path}` : url;

    const breadcrumb: BreadcrumbLocation = {
      label,
      url: nextUrl
    };
    // Only adding route with non-empty label
    const newBreadcrumbs = breadcrumb.label ? [...breadcrumbs, breadcrumb] : [...breadcrumbs];
    if (route.firstChild) {
      // If we are not on our current path yet,
      // there will be more children to look after, in order to build our breadcumb
      return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
    }
    return newBreadcrumbs;
  }
}
