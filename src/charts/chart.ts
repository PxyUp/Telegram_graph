import { Chart, ChartOptions, Point, RectangleOptions, Type } from '../interfaces/chart';
import { animatePath, changePathOnElement, getMax, getMin, getPathByPoints } from '../utils/misc';
import { generateLine, generatePath, generateRect, generateText } from './generator';

const DEFAULT_HOR_STEPS = 6;
const DEFAULT_SPACING = 10;
const DEFAULT_PREVIEW_SPACING = 16;
const DEFAULT_SLICE = 19; // Programming + 1
const SLICE_NUMBER = 5.5;
const DEFAULT_DAY_COUNT = 5;
const classNameStepLine = 'line_step';
const classControlName = 'control';
const verticleLineClass = 'verticle';
const classNameStepTitle = 'text_step';
const classNameAbsLine = 'charts_abs';
const MIN_CONTROL_WIDTH = 10;

export class PyxChart {
  private isDragActive = false;
  private positions: ClientRect;

  private charts_svg: HTMLElement;
  private preview_svg: HTMLElement;

  private timer: number | null = null;
  private timerPreview: number | null = null;

  private maxValue: number;
  private minValue: number;

  private maxValueGlobal: number;
  private minValueGlobal: number;

  private height: number;
  private width: number;

  private previewWidth: number;
  private previewHeight: number;

  private leftControl: SVGRectElement;
  private rightControl: SVGRectElement;
  private centerControl: SVGRectElement;

  private night_mod = false;

  horizontSteps: number;

  private sliceStartIndex = 0;

  private sliceEndIndex = 0;

  private verticleLine: SVGLineElement;

  private columnsVisible: { [key: string]: boolean } = Object.create(null);

  private columnDatasets: { [key: string]: Array<number> } = Object.create(null);

  private countElements: number;

  constructor(
    private id: number,
    private node: HTMLElement,
    private dataset: Chart,
    private options: ChartOptions,
  ) {
    this.charts_svg = this.node.querySelector('.main_chart');
    this.preview_svg = this.node.querySelector('.chart_preview');
    this.height = parseInt(this.charts_svg.getAttribute('height'));
    this.width = parseInt(this.charts_svg.getAttribute('width'));

    Object.keys(this.dataset.names).forEach(key => {
      this.columnsVisible[key] = true;
    });
    this.dataset.columns.forEach(column => {
      const keyOfColumn = column.shift() as any;
      this.columnDatasets[keyOfColumn] = column as any;
      if (!this.countElements) {
        this.countElements = this.columnDatasets[keyOfColumn].length;
      }
      if (!this.sliceStartIndex) {
        const sliceSize = Math.max(DEFAULT_SLICE, Math.floor(this.countElements / SLICE_NUMBER));
        this.sliceStartIndex = Math.max(this.columnDatasets[keyOfColumn].length - sliceSize - 1, 0);
      }
      if (!this.sliceEndIndex) {
        this.sliceEndIndex = this.columnDatasets[keyOfColumn].length - 1;
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

    if (!options.withoutPreview) {
      // Preview
      this.previewHeight = parseInt(this.preview_svg.getAttribute('height'));
      this.previewWidth = parseInt(this.preview_svg.getAttribute('width')) - DEFAULT_SPACING * 2;
      this.drawPreview();
      this.drawPreviewControls(true);
    }
  }

  addMouseListener() {
    this.charts_svg.addEventListener('mouseenter', this.onMouseEnter);
    this.charts_svg.addEventListener('mouseleave', this.onMouseLeave);
    this.charts_svg.addEventListener('mousemove', this.onMouseMove);
  }

  destroy() {
    this.resetTimer();
    this.charts_svg.removeEventListener('mouseenter', this.onMouseEnter);
    this.charts_svg.removeEventListener('mouseleave', this.onMouseLeave);
    this.charts_svg.removeEventListener('mousemove', this.onMouseMove);
    if (!this.options.withoutPreview) {
      // PC
      this.centerControl.removeEventListener('mousedown', this.onDragStart);
      this.centerControl.removeEventListener('mousemove', this.onDrag);
      this.centerControl.removeEventListener('mouseout', this.onDrag);
      this.centerControl.removeEventListener('mouseup', this.onDragEnd);
      // mobile
      this.centerControl.removeEventListener('touchstart', this.onDragStart);
      this.centerControl.removeEventListener('touchmove', this.onDrag);
      this.centerControl.removeEventListener('touchend', this.onDragEnd);
      // Right and Left navigation controls
      this.leftControl.removeEventListener('click', this.onPreviewControlClick);
      this.rightControl.removeEventListener('click', this.onPreviewControlClick);
    }
  }

  onDragStart = (e: MouseEvent | TouchEvent) => {
    this.isDragActive = true;
    this.positions = this.charts_svg.getBoundingClientRect();
  };

  onDragEnd = (e: MouseEvent | TouchEvent) => {
    this.isDragActive = false;
  };

  onDrag = (e: MouseEvent | TouchEvent) => {
    if (this.isDragActive) {
      this.onPreviewControlClick(e);
    }
  };

  onMouseEnter = () => {
    this.verticleLine.classList.add('show');
  };

  onMouseLeave = () => {
    this.verticleLine.classList.remove('show');
  };

  onPreviewControlClick = (e: MouseEvent | TouchEvent) => {
    const cursorX =
      (e as MouseEvent).offsetX || (e as TouchEvent).touches[0].clientX - this.positions.left;
    const sliceSize = this.sliceEndIndex - this.sliceStartIndex;
    this.sliceStartIndex = Math.min(
      this.countElements - sliceSize - 1,
      Math.max(0, Math.ceil((cursorX / this.previewWidth) * this.countElements) - sliceSize / 2),
    );
    this.sliceEndIndex = Math.min(this.sliceStartIndex + sliceSize, this.countElements);

    this.drawPreviewControls();
    this.resetCharts();
    this.draw();
  };

  onMouseMove = (e: MouseEvent) => {
    // todo create hover effect on point
    this.verticleLine.setAttribute('x1', (e.clientX - DEFAULT_SPACING).toString());
    this.verticleLine.setAttribute('x2', (e.clientX - DEFAULT_SPACING).toString());
  };

  toggleColumnVisible(key: string) {
    this.columnsVisible[key] = !this.columnsVisible[key];
    if (!this.options.withoutPreview) {
      this.drawPreview();
    }
    this.refresh();
  }

  drawPreviewControls(withEvents: boolean = false) {
    this.leftControl = this.drawLeftNavigateControl();
    this.rightControl = this.drawRightNavigateControl();
    this.centerControl = this.drawPreviewCenterControl();
    if (withEvents) {
      this.leftControl.addEventListener('click', this.onPreviewControlClick);
      this.rightControl.addEventListener('click', this.onPreviewControlClick);
      // PC
      this.centerControl.addEventListener('mousedown', this.onDragStart, false);
      this.centerControl.addEventListener('mouseup', this.onDragEnd, false);
      this.centerControl.addEventListener('mousemove', this.onDrag, false);
      this.centerControl.addEventListener('mouseout', this.onDrag, false);
      // Mobile
      this.centerControl.addEventListener('touchstart', this.onDragStart, false);
      this.centerControl.addEventListener('touchend', this.onDragEnd, false);
      this.centerControl.addEventListener('touchmove', this.onDrag, false);
      this.centerControl.addEventListener('touchcancel', this.onDrag, false);
    }
  }

  drawPreviewCenterControl() {
    const centerControlSize = {
      width:
        MIN_CONTROL_WIDTH +
        Math.floor((this.sliceEndIndex / this.countElements) * this.previewWidth) -
        Math.floor((this.sliceStartIndex / this.countElements) * this.previewWidth),
      height: this.previewHeight,
    } as RectangleOptions;
    const centerControlPoint = {
      x: Math.floor((this.sliceStartIndex / this.countElements) * this.previewWidth),
      y: 0,
    } as Point;

    if (!this.centerControl) {
      const center = generateRect(centerControlPoint, centerControlSize, 'transparent');
      this.preview_svg.appendChild(center);
      return center;
    }

    this.centerControl.setAttribute('x', centerControlPoint.x as any);
    this.centerControl.setAttribute('y', centerControlPoint.y as any);
    this.centerControl.setAttribute('width', centerControlSize.width as any);
    return this.centerControl;
  }

  drawLeftNavigateControl(): SVGRectElement {
    const leftControlSize = {
      width: Math.max(
        Math.floor(
          (this.sliceStartIndex / this.countElements) *
            (this.previewWidth + DEFAULT_PREVIEW_SPACING),
        ),
        MIN_CONTROL_WIDTH,
      ),
      height: this.previewHeight,
    } as RectangleOptions;
    const leftControlPoint = {
      x: 0,
      y: 0,
    } as Point;

    if (!this.leftControl) {
      const leftRect = generateRect(leftControlPoint, leftControlSize, null, [
        classControlName,
        'left',
      ]);
      this.preview_svg.appendChild(leftRect);
      return leftRect;
    }

    this.leftControl.setAttribute('x', leftControlPoint.x as any);
    this.leftControl.setAttribute('y', leftControlPoint.y as any);
    this.leftControl.setAttribute('width', leftControlSize.width as any);
    return this.leftControl;
  }

  drawRightNavigateControl(): SVGRectElement {
    const rightControlSize = {
      width: Math.max(
        Math.floor(
          ((this.countElements - this.sliceEndIndex) / this.countElements) * this.previewWidth,
        ),
        MIN_CONTROL_WIDTH,
      ),
      height: this.previewHeight,
    } as RectangleOptions;
    const rightControlPoint = {
      x:
        Math.floor((this.sliceStartIndex / this.countElements) * this.previewWidth) +
        MIN_CONTROL_WIDTH +
        Math.floor((this.sliceEndIndex / this.countElements) * this.previewWidth) -
        Math.floor((this.sliceStartIndex / this.countElements) * this.previewWidth),
      y: 0,
    } as Point;

    if (!this.rightControl) {
      const rightRect = generateRect(rightControlPoint, rightControlSize, null, [
        classControlName,
        'right',
      ]);
      this.preview_svg.appendChild(rightRect);
      return rightRect;
    }

    this.rightControl.setAttribute('x', rightControlPoint.x as any);
    this.rightControl.setAttribute('y', rightControlPoint.y as any);
    this.rightControl.setAttribute('width', rightControlSize.width as any);

    return this.rightControl;
  }

  draw() {
    this.setSupportsLines();
    this.drawCurrentSlice();
  }

  refresh() {
    this.resetTimer();
    this.draw();
  }

  resetTimer() {
    clearTimeout(this.timer);
    this.timer = null;
    clearTimeout(this.timerPreview);
    this.timerPreview = null;
  }

  setRightIndexSlice(size: number) {
    this.sliceStartIndex = size;
    this.refresh();
  }

  setLeftIndexSlice(size: number) {
    this.sliceEndIndex = size;
    this.refresh();
  }

  resetCharts() {
    this.charts_svg.querySelectorAll(`text.${classNameAbsLine}`).forEach(el => el.remove());
  }

  drawCurrentSlice() {
    const calculatedWidth = this.width - DEFAULT_SPACING;
    const realMinValue = this.minValue > 0 ? 0 : this.minValue;
    const sliceSize = this.sliceEndIndex - this.sliceStartIndex;
    const sliceXSize = Math.floor(sliceSize / DEFAULT_DAY_COUNT);

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
    for (let index = this.sliceStartIndex - 1; index < this.sliceEndIndex; index += sliceXSize) {
      const item = this.columnDatasets[Type.X][Math.floor(index)];
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

      if (columnVisible) {
        const currentPath = this.charts_svg.querySelector(
          `path#${`pyx_path_${key}`}`,
        ) as SVGPathElement;

        if (currentPath) {
          changePathOnElement(
            currentPath,
            getPathByPoints(
              this.columnDatasets[key]
                .slice(this.sliceStartIndex, this.sliceEndIndex + 1)
                .map((point, index) => {
                  return {
                    x: getXCord(index),
                    y: getYCord(point),
                  };
                }),
            ),
          );

          return;
        }

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
        this.timer = animatePath(path);
      }
    });
  }

  drawPreview() {
    const values = [] as Array<number>;

    Object.keys(this.columnsVisible).forEach(key => {
      const columnVisible = this.columnsVisible[key];
      if (columnVisible) {
        values.push(...this.columnDatasets[key]);
      }
    });

    this.minValueGlobal = getMin(values);
    this.maxValueGlobal = getMax(values);

    const getXCord = (index: number): number => {
      return MIN_CONTROL_WIDTH + (this.previewWidth / this.countElements) * index;
    };

    const getYCord = (value: number): number => {
      return (
        this.previewHeight -
        DEFAULT_PREVIEW_SPACING -
        ((value - this.minValueGlobal) / (this.maxValueGlobal - this.minValueGlobal)) *
          (this.previewHeight - 2 * DEFAULT_PREVIEW_SPACING)
      );
    };

    Object.keys(this.columnsVisible).forEach(key => {
      const columnVisible = this.columnsVisible[key];
      if (columnVisible) {
        const path = generatePath(
          this.columnDatasets[key].map((point, index) => {
            return {
              x: getXCord(index),
              y: getYCord(point),
            };
          }),
          this.dataset.colors[key],
          `pyx_path_preview_${key}`,
        );

        this.preview_svg.appendChild(path);
        this.timerPreview = animatePath(path);
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
      this.charts_svg.prepend(line);
      this.charts_svg.prepend(text);
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
