import { Chart, ChartOptions } from "../interfaces/chart";
import { generateLine, generateNode, generateText } from "./generator";
import { getMax, getMin } from "../utils/misc";

const DEFAULT_HOR_STEPS = 6;
const DEFAULT_SPACING = 10;

export class PyxChart {
    
    private charts_svg: HTMLElement
    private preview_svg: HTMLElement

    horizontSteps: number;

    private columnsVisible: {[key: string]: boolean} = Object.create(null);

    private columnDatasets: {[key: string]: Array<number>} = Object.create(null);

    constructor(private id: number, private node: HTMLElement, private dataset: Chart, private options: ChartOptions) {
        this.charts_svg = this.node.querySelector(".main_chart")
        this.preview_svg = this.node.querySelector(".chart_preview")
        Object.keys(this.dataset.names).forEach((key) => {
            this.columnsVisible[key] = true;
        })

        this.dataset.columns.forEach((column) => {
            const keyOfColumn = column.shift() as any;
            this.columnDatasets[keyOfColumn] = column as any;
        })
        this.horizontSteps = options && options.horizontSteps || DEFAULT_HOR_STEPS;
        this.draw();
    }

    toggleColumnVisible(key: string) {
        this.columnsVisible[key] = !this.columnsVisible[key]
        this.refresh()
    }

    draw() {
        this.setSupportsLines();
    }

    refresh() {
        
    }

    setSupportsLines() {
        const values = [] as Array<number>;

        Object.keys(this.columnsVisible).forEach((key) => {
            const columnVisible = this.columnsVisible[key]
            if (columnVisible) {
                values.push(...this.columnDatasets[key])
            }
        })

        const minValue = getMin(values);
        const maxValue = getMax(values);
        if (minValue > 0) {
            const step = parseInt(((maxValue-minValue) / (this.horizontSteps - 1)).toString())
            const stepsArr = [0, minValue]
            for(let index = 1; index < this.horizontSteps - 1; index++) {
                stepsArr.push(minValue + step*index)
            }
            this.drawSteps(stepsArr)
            return;
        }
         
        //todo create for minus
    }

    drawSteps(arr: Array<number>) {
        const height = this.charts_svg.getAttribute("height")
        const width = this.charts_svg.getAttribute("width")

        const classNameStepLine = "line_step";

        const classNameStepTitle = "text_step";

        this.charts_svg.querySelectorAll(`line.${classNameStepLine}`).forEach((item) => {
            item.remove();
        })

        this.charts_svg.querySelectorAll(`text.${classNameStepTitle}`).forEach((item) => {
            item.remove();
        })

        let positionY = parseInt(height) - DEFAULT_SPACING;
        let delta = positionY/ arr.length
        arr.forEach((step) => {
            const line = generateLine({
                    x1: 0,
                    x2: width,
                    y1: positionY,
                    y2: positionY,
                }, "red"
            )
            const text = generateText({
                    x: 0,
                    y: positionY - 5,
                },
                step.toString()
            )
            positionY -= delta;
            this.charts_svg.appendChild(line)
            this.charts_svg.appendChild(text)
        })
    }
    
    getSelector() {
        return this.node
    }

    getDataSet() {
        return this.dataset
    }
}

