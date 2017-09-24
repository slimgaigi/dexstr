import {EventEmitter, Injectable} from '@angular/core';
import {Http} from "@angular/http";
import {environment} from "../../environments/environment";
import * as _ from 'underscore';

@Injectable()
export class ApiService {
  private _cds: Array<CdReference>;
  cdResultsChanged: EventEmitter<any> = new EventEmitter();

  constructor(private _http: Http) {
    let apiURL = environment.apiV2 ? 'https://data.toulouse-metropole.fr/api/v2/catalog/datasets/top-500-des-cdsByYear-les-plus-empruntes-a-la-bibliotheque-de-toulouse/exports/json?rows=-1&pretty=false&timezone=UTC' : 'https://data.toulouse-metropole.fr/api/records/1.0/download/?dataset=top-500-des-cds-les-plus-empruntes-a-la-bibliotheque-de-toulouse&format=json';
    _http.get(apiURL).subscribe(
      (r) => {
        this._cds = environment.apiV2 ? r.json() : _.pluck(r.json(), 'fields');
        this.cdResultsChanged.emit(this._cds.map(item => item));
      },
      (error) => {
        console.log(error);
      },
      () => {
        console.log('api request complete');
      }
    )
  }

  get cds(): any {
    return this._cds.map(item => item);
  }

}
