# PyxCharts
This project havent any 3rd party dependencies for show charts or styling elements all was wrote manual from zero

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

**This repository was created for Telegram JS Contest March 10-24, 2019**

# Size
**34.9 kB** (with gzip **9.15 kB**)
# Build

## Localhost (htpp://localhost:9000)
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
