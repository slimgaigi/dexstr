import {Component} from '@angular/core';
import {ApiService} from "../../services/api.service";
import * as _ from 'underscore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  cds: Array<CdReference>;

  constructor(private _apiService: ApiService) {
    this._apiService.cdResultsChanged.subscribe(
      (cds) => {
        if (cds) {
          this.cds = _.chain(cds)
            .sortBy('nbre_de_prets')
            .reverse()
            .value()
          ;
        }
      }
    )
  }
}
