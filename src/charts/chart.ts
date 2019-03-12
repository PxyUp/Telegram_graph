import { Chart, ChartOptions, Type } from '../interfaces/chart';
import { animatePath, getMax, getMin, getPathByPoints } from '../utils/misc';
import { generateLine, generateNode, generatePath, generateText } from './generator';

const DEFAULT_HOR_STEPS = 6;
const DEFAULT_SPACING = 10;
const DEFAULT_SLICE = 10;
const DEFAULT_DAY_COUNT = 5;
const classNameStepLine = 'line_step';
const verticleLineClass = 'verticle';

const classNameStepTitle = 'text_step';

export class PyxChart {
  private charts_svg: HTMLElement;
  private preview_svg: HTMLElement;

  private maxValue: number;
  private minValue: number;
  private height: number;
  private width: number;

  private night_mod = false;

  horizontSteps: number;

  private sliceStartIndex = 0;

  private sliceEndIndex = 0;

  private verticleLine: SVGLineElement;

  private columnsVisible: { [key: string]: boolean } = Object.create(null);

  private columnDatasets: { [key: string]: Array<number> } = Object.create(null);

  constructor(
    private id: number,
    private node: HTMLElement,
    private dataset: Chart,
    private options: ChartOptions,
  ) {
    this.charts_svg = this.node.querySelector('.main_chart');
    this.preview_svg = this.node.querySelector('.chart_preview');
    this.height = parseInt(this.charts_svg.getAttribute('height'));
    this.width = parseInt(this.charts_svg.getAttribute('width')) - DEFAULT_SPACING;
    Object.keys(this.dataset.names).forEach(key => {
      this.columnsVisible[key] = true;
    });

    this.dataset.columns.forEach(column => {
      const keyOfColumn = column.shift() as any;
      this.columnDatasets[keyOfColumn] = column as any;
      if (!this.sliceEndIndex) {
        this.sliceEndIndex = Math.min(this.columnDatasets[keyOfColumn].length, DEFAULT_SLICE);
      }
    });

    this.horizontSteps = (options && options.horizontSteps) || DEFAULT_HOR_STEPS;
    this.verticleLine = generateLine(
      {
        x1: 0,
        x2: 0,
        y1: 0,
        y2: this.height - DEFAULT_SPACING,
      },
      null,
      [verticleLineClass],
    );
    this.charts_svg.appendChild(this.verticleLine);
    this.addMouseListener();

    this.draw();
  }

  addMouseListener() {
    this.charts_svg.addEventListener('mouseenter', this.onMouseEnter);
    this.charts_svg.addEventListener('mouseleave', this.onMouseLeave);
    this.charts_svg.addEventListener('mousemove', this.onMouseMove);
  }

  destroy() {
    this.charts_svg.removeEventListener('mouseenter', this.onMouseEnter);
    this.charts_svg.removeEventListener('mouseleave', this.onMouseLeave);
    this.charts_svg.removeEventListener('mousemove', this.onMouseMove);
  }

  onMouseEnter = () => {
    this.verticleLine.classList.add('show');
  };

  onMouseLeave = () => {
    this.verticleLine.classList.remove('show');
  };

  onMouseMove = (e: MouseEvent) => {
    // todo create hover effect on point
    this.verticleLine.setAttribute('x1', (e.clientX - DEFAULT_SPACING).toString());
    this.verticleLine.setAttribute('x2', (e.clientX - DEFAULT_SPACING).toString());
  };

  toggleColumnVisible(key: string) {
    this.columnsVisible[key] = !this.columnsVisible[key];
    this.refresh();
  }

  draw() {
    this.setSupportsLines();
    this.drawCurrentSlice();
  }

  refresh() {
    this.draw();
  }

  setRightIndexSlice(size: number) {
    this.sliceStartIndex = size;
    this.refresh();
  }

  setLeftIndexSlice(size: number) {
    this.sliceEndIndex = size;
    this.refresh();
  }

  drawCurrentSlice() {
    const calculatedWidth = this.width - DEFAULT_SPACING * 2;
    const realMinValue = this.minValue > 0 ? 0 : this.minValue;
    const sliceSize = this.sliceEndIndex - this.sliceStartIndex;
    const sliceXSize = Math.round(sliceSize / DEFAULT_DAY_COUNT);
    const classNameAbsLine = 'charts_abs';

    const getXCord = (index: number): number => {
      return 2 * DEFAULT_SPACING + (calculatedWidth / sliceSize) * index;
    };
    const getYCord = (value: number): number => {
      return (
        this.height -
        DEFAULT_SPACING -
        (value / (this.maxValue - realMinValue)) * (this.height - 2 * DEFAULT_SPACING)
      );
    };

    let currentIndex = 0;
    for (let index = this.sliceStartIndex; index <= this.sliceEndIndex; index += sliceXSize) {
      const item = this.columnDatasets[Type.X][index];
      const date = new Date(item);
      const label = date.toLocaleString('en-us', {
        month: 'short',
        day: 'numeric',
      });
      const text = generateText(
        {
          x:
            2 * DEFAULT_SPACING +
            ((this.width - 2 * DEFAULT_SPACING) / (DEFAULT_DAY_COUNT + 1)) * currentIndex,
          y: this.height,
        },
        label,
        [classNameAbsLine],
      );
      this.charts_svg.appendChild(text);
      currentIndex += 1;
    }

    Object.keys(this.columnsVisible).forEach(key => {
      const columnVisible = this.columnsVisible[key];
      const classNameStepLine = `graph_line_${key}`;
      if (columnVisible) {
        this.charts_svg.querySelectorAll(`line.${classNameStepLine}`).forEach(item => {
          item.remove();
        });

        const path = generatePath(
          this.columnDatasets[key]
            .slice(this.sliceStartIndex, this.sliceEndIndex + 1)
            .map((point, index) => {
              return {
                x: getXCord(index),
                y: getYCord(point),
              };
            }),
          this.dataset.colors[key],
          `pyx_path_${key}`,
        );

        this.charts_svg.appendChild(path);
        animatePath(path);
      }
    });
  }

  setSupportsLines() {
    const values = [] as Array<number>;

    Object.keys(this.columnsVisible).forEach(key => {
      const columnVisible = this.columnsVisible[key];
      if (columnVisible) {
        values.push(
          ...this.columnDatasets[key].slice(this.sliceStartIndex, this.sliceEndIndex + 1),
        );
      }
    });

    this.minValue = getMin(values);
    this.maxValue = getMax(values);

    if (this.minValue > 0) {
      const step = parseInt((this.maxValue / this.horizontSteps).toString());
      const stepsArr = [0];
      for (let index = 1; index < this.horizontSteps; index++) {
        stepsArr.push(0 + step * index);
      }
      this.drawSteps(stepsArr);
      return;
    }

    //todo create for minus
  }

  toggleNightMode() {
    this.night_mod = !this.night_mod;
    if (this.night_mod) {
      this.node.classList.add('night');
    } else {
      this.node.classList.remove('night');
    }
  }

  drawSteps(arr: Array<number>) {
    this.charts_svg.querySelectorAll(`line.${classNameStepLine}`).forEach(item => {
      item.remove();
    });

    this.charts_svg.querySelectorAll(`text.${classNameStepTitle}`).forEach(item => {
      item.remove();
    });

    let positionY = this.height - DEFAULT_SPACING;
    let delta = positionY / arr.length - 1;
    arr.forEach(step => {
      const line = generateLine(
        {
          x1: 0,
          x2: this.width,
          y1: positionY,
          y2: positionY,
        },
        null,
        [classNameStepLine],
      );
      const text = generateText(
        {
          x: 0,
          y: positionY - 5,
        },
        step.toString(),
        [classNameStepTitle],
      );
      this.charts_svg.appendChild(line);
      this.charts_svg.appendChild(text);
      positionY -= delta;
    });
  }

  getSelector() {
    return this.node;
  }

  getDataSet() {
    return this.dataset;
  }

  getTranspilingDataset() {
    return this.columnDatasets;
  }
}
