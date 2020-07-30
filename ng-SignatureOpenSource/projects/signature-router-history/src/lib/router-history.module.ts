import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterHistoryService } from './router-history.service';

@NgModule({
  declarations: [],
  imports: [],
  exports: []
})
export class RouterHistoryModule {
  public static forRoot(): ModuleWithProviders<RouterHistoryModule> {
    return {
      ngModule: RouterHistoryModule,
      providers: [
        {
          provide: RouterHistoryService
        }
      ]
    };
  }
 }
