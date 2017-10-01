import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {ApiService} from '../../services/api.service';
import * as _ from 'underscore';
import Chart from 'chart.js';

function hue2rgb(t) {
  if (t < 0) {
    t += 1;
  }
  if (t > 1) {
    t -= 1;
  }
  if (t < 1 / 6) {
    return 6 * t;
  }
  if (t < 1 / 2) {
    return 1;
  }
  if (t < 2 / 3) {
    return (2 / 3 - t) * 6;
  }
  return 0;
}

function hslToRgb(h) {
  let r, g, b;
  r = hue2rgb(h + 1 / 3);
  g = hue2rgb(h);
  b = hue2rgb(h - 1 / 3);

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function setColorTones(n: number): Array<string> {
  let tones = [];
  if (!n) {
    tones.push('rgba(128,128,128,1)');
    return tones;
  }
  for (let rgb, i = 0; i < n; i++) {
    rgb = hslToRgb(i / n);
    tones[i] = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},1)`;
  }
  return tones;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  maxCount = 10;
  context: CanvasRenderingContext2D;
  chart: Chart;
  chartType = 0;
  switchLabels = ['Voir le détail par années', 'Voir les données compilées'];
  colorTones: Array<string>;

  @ViewChild('dataChart') chartCanvas;
  @ViewChild('switcherCta') switchButton;

  constructor(private _apiService: ApiService) {
    // Let's subscribe to API change Event Emitter
    this._apiService.cdResultsChanged.subscribe(
      (success) => {
        if (success) { // Success
          this.colorTones = setColorTones(_.keys(this._apiService.cdsByYear).length);
          this.createOrUpdateChart([{
            label: 'Total toutes années confondues',
            data: _.pluck(this._apiService.compiledData, 'total')
          }].slice(0, this.maxCount));
        }
      },
      error => console.log(error),
      () => console.log('cd results change complete!')
    );
  }

  createOrUpdateChart(datasets) {
    if (!this.chart) { // no chart generated yet
      this.chart = new Chart(this.context, {
        type: 'bar',
        data: {
          labels: this._apiService.compiledTitles.slice(0, this.maxCount),
          datasets: datasets
        },
        options: {
          scales: {
            xAxes: [{
              stacked: true
            }],
            yAxes: [{
              stacked: true
            }]
          }
        }
      });
    } else { // let's update the chart with new data
      this.chart.data.labels = this._apiService.compiledTitles.slice(0, this.maxCount);
      this.chart.data.datasets = datasets;
      this.chart.update();
    }
  }

  switchView() {
    let datasets: Array<any> = [],
      titles
    ;

    if (this.chartType) { // Let's switch to default view
      this.chartType = 0;
      datasets.push({
        label: 'Total toutes années confondues',
        data: _.pluck(this._apiService.compiledData, 'total')
      });
    } else { // Let's switch to detailed view
      this.chartType = 1;
      titles = _.pluck(this._apiService.compiledData, 'titre').slice(0, this.maxCount);

      _.keys(this._apiService.cdsByYear).forEach((year, i) => {
        let dataset = {
          label: year,
          data: [],
          backgroundColor: this.colorTones[i]
        };

        titles.forEach(title => {
          let lends = _.find(this._apiService.cdsByYear[year], cd => cd['titre'] === title);
          dataset.data.push(lends ? lends['nbre_de_prets'] : 0);
        });

        datasets.push(dataset);
      });
    }
    this.createOrUpdateChart(datasets.slice(0, this.maxCount));
  }

  ngAfterViewInit(): void {
    let canvas = this.chartCanvas.nativeElement;
    this.context = canvas.getContext('2d');
  }
}
