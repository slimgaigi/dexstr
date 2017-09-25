import {EventEmitter, Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {environment} from '../../environments/environment';
import * as _ from 'underscore';

@Injectable()
export class ApiService {
  private _cds: Array<CdReference>;
  cdResultsChanged: EventEmitter<boolean> = new EventEmitter();

  constructor(private _http: Http) {
    let
      domain = 'https://data.toulouse-metropole.fr/',
      apiURL = environment.apiV2 ?
      domain + 'api/v2/catalog/datasets/top-500-des-cdsByYear-les-plus-empruntes-a-la-bibliotheque-de-toulouse/exports/json?rows=-1&pretty=false&timezone=UTC' :
      domain + 'api/records/1.0/download/?dataset=top-500-des-cds-les-plus-empruntes-a-la-bibliotheque-de-toulouse&format=json'
    ;

    // Request API
    _http.get(apiURL).subscribe(
      (r) => { // Success
        // Let's record results
        this._cds = environment.apiV2 ? r.json() : _.pluck(r.json(), 'fields');
        // Emit success event passing data payload
        this.cdResultsChanged.emit(true);
      },
      (error) => { // Error
        console.log(error);
      },
      () => { // Complete
        console.log('api request complete');
      }
    );
  }

  // CD data getter
  get cds(): any {
    return this._cds.map(item => item);
  }

}
