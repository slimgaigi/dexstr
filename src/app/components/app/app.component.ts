import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {ApiService} from "../../services/api.service";
import * as _ from 'underscore';
import Chart from 'chart.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  maxCount: number = 10;
  context: CanvasRenderingContext2D;
  chart: Chart;

  @ViewChild('dataChart') chartCanvas;

  constructor(private _apiService: ApiService) {
    this._apiService.cdResultsChanged.subscribe(
      (cds) => {
        let
          cdsByTitle: any,
          rawData: { titre: number; total: number }[],
          labels,
          datasets
        ;

        if (cds && cds.length) {
          cdsByTitle = this.getCdsByTitle();
          rawData = _.chain(cdsByTitle)
            .map((cdRef: Array<CdReference>, title) => {
              return {
                titre: title,
                total: _.reduce(cdRef, (memo, cd) => {
                  return memo + cd.nbre_de_prets;
                }, 0)
              }
                ;
            })
            .sortBy('total')
            .reverse()
            .value()
          ;
          labels = _.chain(rawData)
            .pluck('titre')
            .map(title => {
              return title.length > 20 ? title.slice(0,20) + '...' : title;
            })
            .value()
            .slice(0, this.maxCount)
          ;
          datasets = [{data: _.pluck(rawData, 'total')}].slice(0, this.maxCount);

          if (!this.chart) {
            this.chart = new Chart(this.context, {
              type: 'bar',
              data: {
                labels: labels,
                datasets: datasets
              }
            });
          } else {
            this.chart.data.labels = labels;
            this.chart.data.datasets = datasets;
            this.chart.update();
          }
        }
      }
    )
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
