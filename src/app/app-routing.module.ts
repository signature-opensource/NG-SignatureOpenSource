import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { FirstPageComponent } from './components/first-page/first-page.component';
import { SecondPageComponent } from './components/second-page/second-page.component';

const routingConfiguration: ExtraOptions = {
  enableTracing: true,
};

const routes: Routes = [
  { path: 'first', component: FirstPageComponent,
    data: {
      breadcrumb: 'first'
    }
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
