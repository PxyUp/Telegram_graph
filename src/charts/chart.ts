import { Chart } from "../interfaces/chart";

export class PyxChart {
    constructor(private id: number, private node: HTMLElement, private dataset: Chart) {
    }

    getSelector() {
        return this.node
    }

    getDataSet() {
        return this.dataset
    }
}

