# PyxCharts
This project havent any 3rd party dependencies for show charts or styling elements all was wrote manual from zero

# API 
```ts
import { Chart, chartsGenerator } from './charts';

const width = document.body.clientWidth;
const generator = chartsGenerator(document.querySelector('.draw_engine'));

fetch('./chart_data.json')
  .then(res => res.json())
  .then(dataSets => {
    dataSets.forEach((dataset: any) => {
      generator(dataset as Chart, {
        withoutPreview: true, // default false
        withoutControls: true, // default false
        withoutAxisLabel: true, // default false
        withoutNightMode: true, // default false
        horizontSteps: 10, // default 6
        chartsContainer: { // default not need set
          size: {
            width: width, // default 400
            height: width, // default 400
          }
        },
        previewContainer: { // default not need set
          size: {
            width, // default 400
            height: 60, // default 60
          }
        }
      });
    });
  });

```

# Timeline
1. Start developing - 11 Mar 2019, 15:09 CET
2. Funcional working - 13 Mar 2019, 15:55 CET
3. Refactor(ts and scss) - 13 Mar 2019, 20:47 CET
4. Improve checkbox click - 13 Mar 2019, 22:02 CET
5. Support negative value - 13 Mar 2019, 23:38 CET
6. Improve tooltip msgBox - 14 Mar 2019, 11:55 CET
7. Move many function to utils - 14 Mar 2019, 15:21 CET
8. Add weekday in tooltip - 14 Mar 2019, 20:55 CET
9. Change min max function to faster one - 14 Mar 2019, 21:47 CET
10. Improve performance for chart(minMax, offset, tooltip) - 15 Mar 2019, 13:30 CET
11. Split bundle to lib and datasets - 15 Mar 2019, 15:14 CET
12. Improve speed with querySelector and fix tooltip error - 15 Mar 2019, 18:13 CET
13. Rewrote setAttr to transform - 16 Mar 2019, 18:47 CET
14. Fix issue with drag - 16 Mar 2019, 20:38 CET
15. Was submit - 16 Mar 2019, 21:50 CET

**This repository was created for Telegram JS Contest March 10-24, 2019**

# Size
**36.2 kB** (with gzip **9.76 kB**)

# Performance 5 graph(with example dataset)

![Performance](https://github.com/PxyUp/Telegram_graph/raw/master/perf_screen.png)

# Build

## Localhost (http://localhost:9000)
```bash
yarn install
yarn serve
```
## Create bundle (After that you will have folder dist with index.html)
```bash
yarn install
yarn build:prod
```

## devDependencies (For develop process)
```json
    "copy-webpack-plugin": "^5.0.1",
    "css-loader": "^2.1.1",
    "html-webpack-plugin": "^3.2.0",
    "husky": "^1.3.1",
    "lint-staged": "^8.1.5",
    "node-sass": "^4.11.0",
    "prettier": "^1.16.4",
    "sass-loader": "^7.1.0",
    "style-loader": "^0.23.1",
    "ts-loader": "^5.3.3",
    "tslint": "^5.13.1",
    "typescript": "^3.3.3333",
    "webpack": "^4.29.6",
    "webpack-cli": "^3.2.3",
    "webpack-dev-server": "^3.2.1"
```
