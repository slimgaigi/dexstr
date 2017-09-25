import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {ApiService} from '../../services/api.service';
import * as _ from 'underscore';
import Chart from 'chart.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  maxCount = 10;
  context: CanvasRenderingContext2D;
  chart: Chart;

  @ViewChild('dataChart') chartCanvas;

  constructor(private _apiService: ApiService) {
    // Let's subscribe to API change Event Emitter
    this._apiService.cdResultsChanged.subscribe(
      (success) => {
        let
          cdsByTitle: any,
          rawData: { titre: number; total: number }[],
          labels,
          datasets
        ;

        if (success) { // Success

          // let's get the list of CDs grouped by Title
          cdsByTitle = this.getCdsByTitle();

          // let's create a new list with the data we want to use
          rawData = _.chain(cdsByTitle)
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
          labels = _.chain(rawData)
            .pluck('titre')
            .map(title => {
              return title.length > 20 ? title.slice(0, 20) + '...' : title;
            })
            .value()
            .slice(0, this.maxCount)
          ;

          // let's get the datasets for the chart
          datasets = [{label: 'Total toutes années confondues', data: _.pluck(rawData, 'total')}].slice(0, this.maxCount);

          if (!this.chart) { // no chart generated yet
            this.chart = new Chart(this.context, {
              type: 'bar',
              data: {
                labels: labels,
                datasets: datasets
              }
            });
          } else { // let's update the chart with new data
            this.chart.data.labels = labels;
            this.chart.data.datasets = datasets;
            this.chart.update();
          }
        }
      }
    );
  }

  private getCdsByYear(): CdByYear {
    return _.chain(this._apiService.cds)
      .groupBy('annee')
      .value()
      ;
  }

  private getCdsByTitle(): any {
    return _.chain(this._apiService.cds)
      .groupBy('titre')
      .value()
      ;
  }

  ngAfterViewInit(): void {
    let canvas = this.chartCanvas.nativeElement;
    this.context = canvas.getContext('2d');
  }
}
