import { Component, OnInit } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { BreadcrumbLocation, BreadcrumbLocations } from '../../../../projects/signature-breadcrumb/src/lib/breadcrumb.model';
import { BreadcrumbService } from '../../../../projects/signature-breadcrumb/src/lib/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.less']
})
export class BreadcrumbComponent implements OnInit {
  public breadcrumbItemList: BreadcrumbLocations;

  constructor(
    private _breadcrumbService: BreadcrumbService,
    private _router: Router
  ) {
    this.breadcrumbItemList = [];
  }

  ngOnInit(): void {
    this._breadcrumbService.breadcrumb.subscribe(result => {
      this.breadcrumbItemList = result;
    });
  }

  public revert(item: BreadcrumbLocation) {
    const amount = this.breadcrumbItemList.length - this.breadcrumbItemList.findIndex(value => value === item) - 1;
    this._breadcrumbService.PopLocation(amount);
    if (item.onClick !== undefined) {
      item.onClick();
    } else {
      const urlArray: Array<string> = item.url.split('/');
      this._router.navigate(urlArray, {queryParams: item.queryParams});
    }
  }

  public goto(child: BreadcrumbLocation, parent: BreadcrumbLocation) {
    const amount = this.breadcrumbItemList.length - this.breadcrumbItemList.findIndex(value => value === parent) - 1;
    this._breadcrumbService.PopLocation(amount);
    if (child.onClick !== undefined) {
      child.onClick();
    } else {
      this._router.navigateByUrl(child.url);
    }
  }
}
