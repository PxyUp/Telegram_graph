import './styles/main.scss';

import { Chart } from './interfaces/chart';
import { chartsGenerator } from './charts/generator';
import dataSets from './datasets/chart_data.json';

const generator = chartsGenerator(document.querySelector('.draw_engine'));
dataSets.forEach((dataset: any) => {
  generator(dataset as Chart);
});
