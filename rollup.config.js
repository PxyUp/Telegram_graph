import copy from 'rollup-plugin-copy';
import html from 'rollup-plugin-bundle-html';
import sass from 'rollup-plugin-sass';
import typescript from "rollup-plugin-typescript2";
import { uglify } from "rollup-plugin-uglify";

export default {
    input: "src/index.ts",
    output: {
        file: "./docs/bundle.js",
        format: 'umd',
        sourcemap: true,
    },
    plugins: [
        typescript(),
        sass({
            insert: true
          }),
          uglify(),
          copy({
            "./src/datasets/chart_data.json": "./docs/chart_data.json",
            verbose: true
        }),
          html({
            template: './src/index.html',
            dest: "./docs",
            filename: 'index.html',
            inject: 'body',
        })
    ],
}