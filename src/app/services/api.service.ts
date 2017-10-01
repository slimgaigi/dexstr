import {EventEmitter, Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {environment} from '../../environments/environment';
import * as _ from 'underscore';

@Injectable()
export class ApiService {
  private _cds: Array<CdReference>;
  private _cdsByTitle: any;
  private _cdsByYear: any;
  private _compiledData: { titre: number; total: number} [];
  private _compiledTitles: any;
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
        this._cdsByTitle = _.chain(this._cds)
          .groupBy('titre')
          .value()
        ;
        this._cdsByYear = _.chain(this._cds)
          .groupBy('annee')
          .value()
        ;
        // let's create a new list with the data we want to use
        this._compiledData = _.chain(this._cdsByTitle)
          .map((cdRef: Array<CdReference>, title) => {
            return {
              titre: title,
              auteur: cdRef[0].auteur,
              editeur: cdRef[0].editeur,
              cote: cdRef[0].cote,
              total: _.reduce(cdRef, (memo, cd) => {
                return memo + cd.nbre_de_prets;
              }, 0)
            };
          })
          .sortBy('total')
          .reverse()
          .value()
        ;
        // let's get the labels
        this._compiledTitles = _.chain(this._compiledData)
          .pluck('titre')
          .map(title => {
            return title.length > 40 ? title.slice(0, 40) + '...' : title;
          })
          .value()
        ;
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

  get cdsByTitle(): any {
    return this._cdsByTitle;
  }

  get cdsByYear(): any {
    return this._cdsByYear;
  }

  get compiledData(): { titre: number; total: number }[] {
    return this._compiledData;
  }

  get compiledTitles(): any {
    return this._compiledTitles;
  }
}
