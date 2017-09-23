import {EventEmitter, Injectable} from '@angular/core';
import {Http} from "@angular/http";

@Injectable()
export class ApiService {
  private _cds: Array<CdReference>;
  cdResultsChanged: EventEmitter<any> = new EventEmitter();

  constructor(private _http: Http) {

    _http.get('https://data.toulouse-metropole.fr/api/v2/catalog/datasets/top-500-des-cds-les-plus-empruntes-a-la-bibliotheque-de-toulouse/exports/json?rows=-1&pretty=false&timezone=UTC').subscribe(
      (r) => {
        console.log(r.json());
        this._cds = r.json();
        this.cdResultsChanged.emit(this._cds);
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
    return this._cds;
  }

}
