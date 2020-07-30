import { Params } from '@angular/router';

export interface BreadcrumbLocation {
  label: string;
  url: string;
  queryParams?: Params;
  onClick?: () => void;
  childs?: BreadcrumbLocations;
}

export type BreadcrumbLocations = ReadonlyArray<BreadcrumbLocation>;
