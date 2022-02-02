import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { FirstPageComponent } from './components/first-page/first-page.component';
import { SecondPageComponent } from './components/second-page/second-page.component';
import { SubFirstPageComponent } from './components/sub-first-page/sub-first-page.component';

const routingConfiguration: ExtraOptions = {
    enableTracing: true,
    relativeLinkResolution: 'legacy'
};

const routes: Routes = [
  { path: 'first', component: FirstPageComponent,
    data: {
      breadcrumb: 'first'
    },
    children: [
      {
        path: 'sub-first',
        component: SubFirstPageComponent,
        data: {
          breadcrumb: 'sub-first'
        }
      }
    ]
  },
  { path: 'second', component: SecondPageComponent,
    data: {
      breadcrumb: 'second'
    }
  },
  { path: '**', redirectTo: '/first', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routingConfiguration)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
