import { Chart } from './interfaces/chart';
import { chartsGenerator } from './charts';

const generator = chartsGenerator(document.querySelector('.draw_engine'));

fetch('/chart_data.json')
  .then(res => res.json())
  .then(dataSets => {
    dataSets.forEach((dataset: any) => {
      generator(dataset as Chart);
    });
  });
