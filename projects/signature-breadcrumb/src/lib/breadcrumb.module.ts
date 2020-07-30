import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbServiceConfig } from './breadcrumb.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class BreadcrumbModule {
  static forRoot(config?: BreadcrumbServiceConfig): ModuleWithProviders<BreadcrumbModule> {
    return {
      ngModule: BreadcrumbModule,
      providers: [
        { provide: BreadcrumbServiceConfig, useValue: config }
      ]
    };
  }
}
