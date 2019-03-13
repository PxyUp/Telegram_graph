import {
  Chart,
  ChartOptions,
  Point,
  PointWithColor,
  PointWithValue,
  PointWithValueAndColor,
  RectangleOptions,
  Type,
} from '../interfaces/chart';
import {
  animatePath,
  changePathOnElement,
  createTextNode,
  getMax,
  getMin,
  getPathByPoints,
  getShortDateByUnix,
  removeAllChild,
} from '../utils/misc';
import { generateCheckbox, generateNode, generateSvgElement } from './generator';

// constant number
const POINT_RADIUS = 5;
const DEFAULT_HOR_STEPS = 6;
const DEFAULT_SPACING = 10;
const DEFAULT_PREVIEW_SPACING = 16;
const DEFAULT_SLICE = 19; // Programming + 1
const SLICE_NUMBER = 5.5;
const DEFAULT_DAY_COUNT = 6;
const MIN_CONTROL_WIDTH = 10;
const RESIZE_CONTROL_WIDTH = MIN_CONTROL_WIDTH;

// ClassNames
const classNameStepLine = 'line_step';
const classControlName = 'control';
const classControlResizeName = 'control_resize';
const verticleLineClass = 'verticle';
const classNameStepTitle = 'text_step';
const classNameAbsLine = 'charts_abs';

export class PyxChart {
  private isDragActive = false;
  private isResizeActive = false;
  private activeResize: boolean | null = null;
  private positions: ClientRect;

  private charts_svg: HTMLElement;
  private preview_svg: HTMLElement;

  private controlsContainer: HTMLElement;

  private toolTip: HTMLElement;
  private toolTipDate: HTMLElement;

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

  private leftControl: SVGElement;
  private rightControl: SVGElement;
  private centerControl: SVGElement;

  private leftResizeControl: SVGElement;
  private rightResizeControl: SVGElement;

  private nightModeControl: HTMLElement;

  private night_mod = false;

  horizontSteps: number;

  private sliceStartIndex = 0;

  private sliceEndIndex = 0;

  private currentSlicePoint: { [key: string]: Array<PointWithValue> } = Object.create(null);

  private verticleLine: SVGElement;

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
    this.toolTip = this.node.querySelector('div.tooltip');
    this.toolTipDate = this.node.querySelector('div.tooltip p.date');
    this.height = parseInt(this.charts_svg.getAttribute('height'));
    this.width = parseInt(this.charts_svg.getAttribute('width'));

    Object.keys(this.dataset.names).forEach(key => {
      this.columnsVisible[key] = true;
    });
    // Create dataset help and set first slice size and indexes
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
        this.sliceEndIndex = this.columnDatasets[keyOfColumn].length;
      }
    });

    this.horizontSteps = (options && options.horizontSteps) || DEFAULT_HOR_STEPS;

    this.verticleLine = generateSvgElement('line', [verticleLineClass], {
      x1: 0 as any,
      x2: 0 as any,
      y1: 0 as any,
      y2: (this.height - DEFAULT_SPACING) as any,
    });

    this.charts_svg.appendChild(this.verticleLine);

    this.addMouseListener();

    this.positions = this.charts_svg.getBoundingClientRect();
    this.draw();

    if (!options.withoutPreview) {
      // Preview
      this.previewHeight = parseInt(this.preview_svg.getAttribute('height'));
      this.previewWidth = parseInt(this.preview_svg.getAttribute('width')) - DEFAULT_SPACING * 2;
      this.drawPreview();
      this.drawPreviewControls(true);
    }

    if (!options.withoutControls) {
      this.controlsContainer = this.node.querySelector('.controls');
      this.generateControls();
    }

    if (!options.withoutNightMode) {
      this.nightModeControl = this.node.querySelector('.night_mode_control a');
      this.addNightModeListener();
    }
  }

  addNightModeListener() {
    this.nightModeControl.addEventListener('click', this.onNightModeClick);
  }

  generateControls() {
    this.controlsContainer.style.width = `${this.width}px`;
    Object.keys(this.columnsVisible).forEach(key => {
      const checkBoxControl = generateCheckbox(
        this.id,
        key,
        this.dataset.names[key],
        this.columnsVisible[key],
      );
      const checkBox = checkBoxControl.querySelector("input[type='checkbox']");
      this.controlsContainer.appendChild(checkBoxControl);
      checkBox.addEventListener('change', this.onCheckBoxClick, false);
      this.setColorCheckboxByKey(key);
    });
  }

  onNightModeClick = () => {
    this.toggleNightMode();
  };

  onCheckBoxClick = (e: MouseEvent) => {
    const key = (e.target as HTMLElement).getAttribute('key');
    this.toggleColumnVisible(key);
  };

  addMouseListener() {
    this.charts_svg.addEventListener('mouseenter', this.onMouseEnter);
    this.charts_svg.addEventListener('mouseleave', this.onMouseLeave);
    this.charts_svg.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  destroy() {
    this.resetTimer();
    this.charts_svg.removeEventListener('mouseenter', this.onMouseEnter);
    this.charts_svg.removeEventListener('mouseleave', this.onMouseLeave);
    this.charts_svg.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);

    if (!this.options.withoutControls) {
      this.controlsContainer.querySelectorAll("input[type='checkbox']").forEach(el => {
        el.removeEventListener('change', this.onCheckBoxClick);
      });
    }

    if (!this.options.withoutNightMode) {
      this.nightModeControl.removeEventListener('click', this.onNightModeClick);
    }
    if (!this.options.withoutPreview) {
      // PC
      // DRAG
      this.centerControl.removeEventListener('mousedown', this.onDragStart);
      this.centerControl.removeEventListener('mousemove', this.onDrag);
      this.centerControl.removeEventListener('mouseout', this.onDrag);
      this.centerControl.removeEventListener('mouseup', this.onDragEnd);
      // RESIZE
      this.leftResizeControl.removeEventListener('mouseup', this.onResizeEndLeft);
      this.leftResizeControl.removeEventListener('mousedown', this.onResizeStartLeft);
      this.rightResizeControl.removeEventListener('mouseup', this.onResizeEndRight);
      this.rightResizeControl.removeEventListener('mousedown', this.onResizeStartRight);
      this.preview_svg.removeEventListener('mousemove', this.onResize);
      // mobile
      //DRAG
      this.centerControl.removeEventListener('touchstart', this.onDragStart);
      this.centerControl.removeEventListener('touchmove', this.onDrag);
      this.centerControl.removeEventListener('touchend', this.onDragEnd);
      this.centerControl.removeEventListener('touchcancel', this.onDrag);
      // RESIZE
      this.leftResizeControl.removeEventListener('touchend', this.onResizeEndLeft);
      this.leftResizeControl.removeEventListener('touchstart', this.onResizeStartLeft);
      this.rightResizeControl.removeEventListener('touchend', this.onResizeEndRight);
      this.rightResizeControl.removeEventListener('touchstart', this.onResizeStartRight);
      this.preview_svg.removeEventListener('touchmove', this.onResize);
      // Right and Left navigation controls
      this.leftControl.removeEventListener('click', this.onPreviewControlClick);
      this.rightControl.removeEventListener('click', this.onPreviewControlClick);
    }
  }

  onMouseUp = () => {
    this.isResizeActive = false;
    this.isDragActive = false;
    this.activeResize = null;
  };

  onResizeStartRight = (e: MouseEvent | TouchEvent) => {
    this.isResizeActive = true;
    this.activeResize = true;
  };

  onResizeStartLeft = (e: MouseEvent | TouchEvent) => {
    this.isResizeActive = true;
    this.activeResize = false;
  };

  onResizeEndLeft = (e: MouseEvent | TouchEvent) => {
    this.isResizeActive = false;
    this.activeResize = null;
  };

  onResizeEndRight = (e: MouseEvent | TouchEvent) => {
    this.isResizeActive = false;
    this.activeResize = null;
  };

  onResize = (e: MouseEvent | TouchEvent) => {
    if (this.isResizeActive) {
      requestAnimationFrame(() => this.doResize(this.activeResize, e));
    }
  };

  onDragStart = (e: MouseEvent | TouchEvent) => {
    this.isDragActive = true;
  };

  onDragEnd = (e: MouseEvent | TouchEvent) => {
    this.isDragActive = false;
  };

  onDrag = (e: MouseEvent | TouchEvent) => {
    if (this.isDragActive) {
      requestAnimationFrame(() => this.onPreviewControlClick(e));
    }
  };

  onMouseEnter = () => {
    this.verticleLine.classList.add('show');
  };

  onMouseLeave = (e: MouseEvent) => {
    if (e.toElement !== this.toolTip || e.offsetY >= this.height - 100) {
      this.removePoints();
      this.verticleLine.classList.remove('show');
      this.toolTip.style.display = 'none';
    }
  };

  doResize(isRight: boolean, e: MouseEvent | TouchEvent) {
    if (isRight === null) {
      return;
    }
    if (!isRight) {
      const cursorX =
        ((e as MouseEvent).offsetX >= 0
          ? (e as MouseEvent).offsetX
          : (e as TouchEvent).touches[0].clientX - this.positions.left) +
        2 * DEFAULT_SPACING;
      this.sliceStartIndex = Math.max(
        0,
        Math.max(
          0,
          Math.ceil(
            ((cursorX - 2 * DEFAULT_SPACING - MIN_CONTROL_WIDTH) / this.previewWidth) *
              this.countElements,
          ),
        ),
      );
      if (this.sliceStartIndex >= this.sliceEndIndex) {
        this.sliceStartIndex = this.sliceEndIndex - 1;
      }
    } else {
      const cursorX =
        ((e as MouseEvent).offsetX >= 0
          ? (e as MouseEvent).offsetX
          : (e as TouchEvent).touches[0].clientX - this.positions.left) +
        2 * DEFAULT_SPACING;
      this.sliceEndIndex = Math.min(
        this.countElements,
        Math.max(
          0,
          Math.ceil(
            ((cursorX - 2 * DEFAULT_SPACING - MIN_CONTROL_WIDTH) / this.previewWidth) *
              this.countElements,
          ),
        ),
      );

      if (this.sliceEndIndex <= this.sliceStartIndex) {
        this.sliceEndIndex = this.sliceStartIndex + 1;
      }
    }

    this.drawPreviewControls();
    this.resetCharts();
    this.draw();
  }

  onPreviewControlClick = (e: MouseEvent | TouchEvent) => {
    const cursorX =
      (e as MouseEvent).offsetX >= 0
        ? (e as MouseEvent).offsetX
        : (e as TouchEvent).touches[0].clientX - this.positions.left;
    const sliceSize = this.sliceEndIndex - this.sliceStartIndex;
    this.sliceStartIndex = Math.min(
      this.countElements - sliceSize,
      Math.max(
        0,
        Math.ceil((cursorX / this.previewWidth) * (this.countElements - 1)) -
          Math.floor(sliceSize / 2),
      ),
    );
    this.sliceEndIndex = Math.min(this.sliceStartIndex + sliceSize, this.countElements);
    if (this.sliceEndIndex === this.countElements) {
      this.sliceStartIndex = Math.max(0, this.sliceEndIndex - sliceSize);
    }
    if (this.sliceStartIndex === 0) {
      this.sliceEndIndex = Math.min(this.sliceStartIndex + sliceSize, this.countElements);
    }
    this.drawPreviewControls();
    this.resetCharts();
    this.draw();
  };

  onMouseMove = (e: MouseEvent) => {
    if (
      e.clientX - this.positions.left > DEFAULT_SPACING * 2 &&
      e.clientX - this.positions.left < this.width
    ) {
      const cordX = e.clientX - this.positions.left;
      const cordY = e.offsetY;
      this.verticleLine.setAttribute('x1', cordX.toString());
      this.verticleLine.setAttribute('x2', cordX.toString());
      const closestIndex = this.findClosesIndexOfPoint(cordX);
      if (closestIndex === null) {
        return;
      }
      const points = Object.keys(this.columnsVisible)
        .filter(key => this.columnsVisible[key])
        .map(key => ({
          key: key,
          color: this.dataset.colors[key],
          x: this.currentSlicePoint[key][closestIndex].x,
          y: this.currentSlicePoint[key][closestIndex].y,
          value: this.currentSlicePoint[key][closestIndex].value,
          date: this.currentSlicePoint[key][closestIndex].date,
        }));
      this.showPoints(points);
      this.showTooltip(points, { x: cordX, y: cordY });
    }
  };

  showPoints(arr: Array<PointWithColor> = []) {
    this.removePoints();
    arr.forEach(point => {
      const circle = generateSvgElement('circle', null, {
        cx: point.x as any,
        cy: point.y as any,
        stroke: point.color,
        r: POINT_RADIUS as any,
      });
      this.charts_svg.appendChild(circle);
    });
  }

  removePoints() {
    this.charts_svg.querySelectorAll('circle').forEach(el => el.remove());
  }

  showTooltip(arr: Array<PointWithValueAndColor>, point: Point) {
    this.toolTip.style.display = 'flex';
    this.toolTip.style.left = `${(point.x as number) + DEFAULT_SPACING}px`;
    this.toolTip.style.top = `${(point.y as number) + DEFAULT_SPACING}px`;
    const childContainer = this.toolTip.querySelector('.items') as HTMLElement;

    // Remove all child from container
    removeAllChild(childContainer);
    removeAllChild(this.toolTipDate);

    this.toolTipDate.appendChild(createTextNode(getShortDateByUnix(arr[0].date)));
    arr
      .map(item =>
        generateNode({
          tag: 'div',
          attrs: {
            style: `color: ${item.color}`,
          },
          children: [
            {
              tag: 'span',
              classList: ['value'],
              value: item.value.toString(),
            },
            {
              tag: 'span',
              classList: ['item'],
              value: this.dataset.names[item.key],
            },
          ],
        }),
      )
      .forEach(item => childContainer.appendChild(item));
  }

  findClosesIndexOfPoint(cordX: number): number | null {
    const arr = Object.keys(this.columnsVisible).filter(key => this.columnsVisible[key]);
    if (!arr.length) {
      return null;
    }
    return this.currentSlicePoint[arr[0]].reduce(
      (prev, curr, index) => {
        return Math.abs((curr.x as number) - cordX) < Math.abs(prev[0] - cordX)
          ? [curr.x as number, index]
          : prev;
      },
      [this.width, null],
    )[1];
  }

  removePathByKey(key: string) {
    const path = this.charts_svg.querySelector(`path#pyx_path_${key}`);
    if (path) {
      path.remove();
    }
  }

  setColorCheckboxByKey(key: string) {
    const color = this.dataset.colors[key];
    const label = this.controlsContainer.querySelector(
      `label[for="checkbox_${this.id}_${key}"]`,
    ) as HTMLElement;
    if (!this.columnsVisible[key]) {
      label.classList.add('not_active');
    } else {
      label.classList.remove('not_active');
      label.style.borderColor = color;
      label.style.backgroundColor = color;
    }
  }

  toggleColumnVisible(key: string) {
    this.columnsVisible[key] = !this.columnsVisible[key];
    this.setColorCheckboxByKey(key);
    if (!this.columnsVisible[key]) {
      this.removePathByKey(key);
    }
    if (!this.options.withoutPreview) {
      this.drawPreview(false);
    }
    this.refresh(false, false);
  }

  drawPreviewControls(withEvents: boolean = false) {
    this.leftControl = this.drawLeftNavigateControl();
    this.rightControl = this.drawRightNavigateControl();
    this.centerControl = this.drawPreviewCenterControl();
    this.leftResizeControl = this.drawPreviewLeftResizeControl();
    this.rightResizeControl = this.drawPreviewRightResizeControl();
    if (withEvents) {
      this.leftControl.addEventListener('click', this.onPreviewControlClick);
      this.rightControl.addEventListener('click', this.onPreviewControlClick);
      // PC
      this.centerControl.addEventListener('mousedown', this.onDragStart, false);
      this.centerControl.addEventListener('mouseup', this.onDragEnd, false);
      this.centerControl.addEventListener('mousemove', this.onDrag, false);
      this.centerControl.addEventListener('mouseout', this.onDrag, false);
      this.leftResizeControl.addEventListener('mouseup', this.onResizeEndLeft, false);
      this.leftResizeControl.addEventListener('mousedown', this.onResizeStartLeft, false);
      this.rightResizeControl.addEventListener('mouseup', this.onResizeEndRight);
      this.rightResizeControl.addEventListener('mousedown', this.onResizeStartRight);
      this.preview_svg.addEventListener('mousemove', this.onResize, false);
      // Mobile
      this.centerControl.addEventListener('touchstart', this.onDragStart, false);
      this.centerControl.addEventListener('touchend', this.onDragEnd, false);
      this.centerControl.addEventListener('touchmove', this.onDrag, false);
      this.centerControl.addEventListener('touchcancel', this.onDrag, false);
      this.leftResizeControl.addEventListener('touchend', this.onResizeEndLeft, false);
      this.leftResizeControl.addEventListener('touchstart', this.onResizeStartLeft, false);
      this.rightResizeControl.addEventListener('touchend', this.onResizeEndRight);
      this.rightResizeControl.addEventListener('touchstart', this.onResizeStartRight);
      this.preview_svg.addEventListener('touchmove', this.onResize, false);
    }
  }

  drawPreviewLeftResizeControl(): SVGElement {
    const leftResizeControlSize = {
      width: RESIZE_CONTROL_WIDTH,
      height: this.previewHeight,
    } as RectangleOptions;
    const leftResizeControlPoint = {
      x: Math.max(Math.floor((this.sliceStartIndex / this.countElements) * this.previewWidth), 0),
      y: 0,
    } as Point;

    if (!this.leftResizeControl) {
      const leftResizeRect = generateSvgElement('rect', [classControlResizeName, 'left'], {
        x: leftResizeControlPoint.x as any,
        y: leftResizeControlPoint.y as any,
        width: leftResizeControlSize.width as any,
        height: leftResizeControlSize.height as any,
        fill: 'none',
      });
      this.preview_svg.appendChild(leftResizeRect);
      return leftResizeRect;
    }

    this.leftResizeControl.setAttribute('x', leftResizeControlPoint.x as any);
    this.leftResizeControl.setAttribute('y', leftResizeControlPoint.y as any);
    this.leftResizeControl.setAttribute('width', leftResizeControlSize.width as any);
    return this.leftResizeControl;
  }

  drawPreviewRightResizeControl(): SVGElement {
    const rightResizeControlSize = {
      width: RESIZE_CONTROL_WIDTH,
      height: this.previewHeight,
    } as RectangleOptions;
    const rightResizeControlPoint = {
      x:
        Math.floor((this.sliceStartIndex / this.countElements) * this.previewWidth) +
        MIN_CONTROL_WIDTH +
        Math.floor((this.sliceEndIndex / this.countElements) * this.previewWidth) -
        Math.floor((this.sliceStartIndex / this.countElements) * this.previewWidth),
      y: 0,
    } as Point;

    if (!this.rightResizeControl) {
      const rightResizeRect = generateSvgElement('rect', [classControlResizeName, 'left'], {
        x: rightResizeControlPoint.x as any,
        y: rightResizeControlPoint.y as any,
        width: rightResizeControlSize.width as any,
        height: rightResizeControlSize.height as any,
        fill: 'none',
      });
      this.preview_svg.appendChild(rightResizeRect);
      return rightResizeRect;
    }

    this.rightResizeControl.setAttribute('x', rightResizeControlPoint.x as any);
    this.rightResizeControl.setAttribute('y', rightResizeControlPoint.y as any);
    this.rightResizeControl.setAttribute('width', rightResizeControlSize.width as any);
    return this.rightResizeControl;
  }

  drawPreviewCenterControl(): SVGElement {
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
      const center = generateSvgElement('rect', ['center'], {
        x: centerControlPoint.x as any,
        y: centerControlPoint.y as any,
        width: centerControlSize.width as any,
        height: centerControlSize.height as any,
        fill: 'transparent',
      });
      this.preview_svg.appendChild(center);
      return center;
    }

    this.centerControl.setAttribute('x', centerControlPoint.x as any);
    this.centerControl.setAttribute('y', centerControlPoint.y as any);
    this.centerControl.setAttribute('width', centerControlSize.width as any);
    return this.centerControl;
  }

  drawLeftNavigateControl(): SVGElement {
    const leftControlSize = {
      width: Math.max(
        Math.floor((this.sliceStartIndex / this.countElements) * this.previewWidth) +
          MIN_CONTROL_WIDTH,
        MIN_CONTROL_WIDTH,
      ),
      height: this.previewHeight,
    } as RectangleOptions;

    const leftControlPoint = {
      x: 0,
      y: 0,
    } as Point;

    if (!this.leftControl) {
      const leftRect = generateSvgElement('rect', [classControlName, 'left'], {
        x: leftControlPoint.x as any,
        y: leftControlPoint.y as any,
        width: leftControlSize.width as any,
        height: leftControlSize.height as any,
        fill: 'none',
      });
      this.preview_svg.appendChild(leftRect);
      return leftRect;
    }

    this.leftControl.setAttribute('x', leftControlPoint.x as any);
    this.leftControl.setAttribute('y', leftControlPoint.y as any);
    this.leftControl.setAttribute('width', leftControlSize.width as any);
    return this.leftControl;
  }

  drawRightNavigateControl(): SVGElement {
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
      const rightRect = generateSvgElement('rect', [classControlName, 'right'], {
        x: rightControlPoint.x as any,
        y: rightControlPoint.y as any,
        width: rightControlSize.width as any,
        height: rightControlSize.height as any,
        fill: 'none',
      });
      this.preview_svg.appendChild(rightRect);
      return rightRect;
    }

    this.rightControl.setAttribute('x', rightControlPoint.x as any);
    this.rightControl.setAttribute('y', rightControlPoint.y as any);
    this.rightControl.setAttribute('width', rightControlSize.width as any);

    return this.rightControl;
  }

  draw(withAnimation = true, withXAxis = true) {
    this.setSupportsLines();
    this.drawCurrentSlice(withAnimation, withXAxis);
  }

  refresh(withAnimation = true, withXAxis = true) {
    this.resetTimer();
    this.draw(withAnimation, withXAxis);
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
    this.charts_svg.querySelectorAll(`g`).forEach(el => el.remove());
  }

  drawCurrentSlice(withAnimation = true, withXAxis = true) {
    const realMinValue = this.minValue > 0 ? 0 : this.minValue;
    const sliceSize = this.sliceEndIndex - this.sliceStartIndex;
    let fullWidth = 0;
    let labelCount = Math.min(DEFAULT_DAY_COUNT, sliceSize + 1);
    const mustGeneratedLabels = labelCount;
    const deltaDays =
      sliceSize > DEFAULT_DAY_COUNT
        ? Math.max(Math.floor(sliceSize / (mustGeneratedLabels - 1)), 1)
        : Math.max(Math.ceil(sliceSize / (mustGeneratedLabels - 1)), 1);
    let index = this.sliceStartIndex;
    if (withXAxis) {
      const arrayOfText = [];
      const firstItem = generateSvgElement(
        'text',
        [classNameAbsLine],
        {
          x: (2 * DEFAULT_SPACING) as any,
          y: this.height as any,
        },
        [],
        getShortDateByUnix(this.columnDatasets[Type.X][this.sliceStartIndex]),
      );
      arrayOfText.push(firstItem);
      index += deltaDays;
      while (labelCount - 2 > 0 && index < this.sliceEndIndex - 1) {
        const item = this.columnDatasets[Type.X][Math.floor(index)];
        const text = generateSvgElement(
          'text',
          [classNameAbsLine],
          {
            x: (2 * DEFAULT_SPACING) as any,
            y: this.height as any,
          },
          [],
          getShortDateByUnix(item),
        );
        arrayOfText.push(text);
        labelCount -= 1;
        index += deltaDays;
      }
      const lastItem = generateSvgElement(
        'text',
        [classNameAbsLine],
        {
          x: (2 * DEFAULT_SPACING) as any,
          y: this.height as any,
        },
        [],
        getShortDateByUnix(this.columnDatasets[Type.X][this.sliceEndIndex - 1]),
      );
      arrayOfText.push(lastItem);
      const group = generateSvgElement('g', null, null, arrayOfText);
      this.charts_svg.appendChild(group);

      this.charts_svg.querySelectorAll(`text.${classNameAbsLine}`).forEach(item => {
        fullWidth += item.getBoundingClientRect().width;
      });

      const textDelta =
        (this.width - 2 * DEFAULT_SPACING - fullWidth) / Math.max(mustGeneratedLabels - 1, 2);
      let relWidth = 0;
      this.charts_svg.querySelectorAll(`text.${classNameAbsLine}`).forEach((item, index) => {
        item.setAttribute('x', (2 * DEFAULT_SPACING + index * textDelta + relWidth) as any);
        relWidth += item.getBoundingClientRect().width;
      });
    }

    const calculatedWidth = this.width - 4 * DEFAULT_SPACING;

    const getXCord = (index: number): number => {
      return 4 * DEFAULT_SPACING + (calculatedWidth / sliceSize) * index;
    };
    const getYCord = (value: number): number => {
      return (
        this.height -
        DEFAULT_SPACING -
        (value / (this.maxValue - realMinValue)) * (this.height - 2 * DEFAULT_SPACING)
      );
    };

    Object.keys(this.columnsVisible).forEach(key => {
      const columnVisible = this.columnsVisible[key];

      if (columnVisible) {
        const currentPath = this.charts_svg.querySelector(
          `path#${`pyx_path_${key}`}`,
        ) as SVGPathElement;

        this.currentSlicePoint[key] = this.columnDatasets[key]
          .slice(this.sliceStartIndex, this.sliceEndIndex)
          .map((point, index) => {
            return {
              x: getXCord(index),
              y: getYCord(point),
              value: point,
              date: this.columnDatasets[Type.X][this.sliceStartIndex + index],
            };
          });

        if (currentPath) {
          changePathOnElement(currentPath, getPathByPoints(this.currentSlicePoint[key]));
          return;
        }

        const path = generateSvgElement('path', [], {
          id: `pyx_path_${key}`,
          stroke: this.dataset.colors[key],
          fill: 'none',
          d: getPathByPoints(this.currentSlicePoint[key]),
        });

        this.charts_svg.appendChild(path);
        if (withAnimation) {
          this.timer = animatePath(path);
        }
      }
    });
  }

  drawPreview(withAnimation = true) {
    this.preview_svg.querySelectorAll(`path`).forEach(el => el.remove());
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
        const path = generateSvgElement('path', [], {
          id: `pyx_path_preview_${key}`,
          d: getPathByPoints(
            this.columnDatasets[key].map((point, index) => ({
              x: getXCord(index),
              y: getYCord(point),
            })),
          ),
          stroke: this.dataset.colors[key],
          fill: 'none',
        });

        this.preview_svg.prepend(path);
        if (withAnimation) {
          this.timerPreview = animatePath(path);
        }
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
    // I Hope all values not negative
    if (this.minValue >= 0) {
      const step = parseInt((this.maxValue / this.horizontSteps).toString());
      const stepsArr = [0];
      for (let index = 1; index < this.horizontSteps; index++) {
        stepsArr.push(0 + step * index || index);
      }
      this.drawSteps(stepsArr);
      return;
    }
  }

  toggleNightMode() {
    this.night_mod = !this.night_mod;
    removeAllChild(this.nightModeControl);
    if (this.night_mod) {
      this.node.classList.add('night');

      this.nightModeControl.appendChild(createTextNode('Switch to day mode'));
    } else {
      this.node.classList.remove('night');
      this.nightModeControl.appendChild(createTextNode('Switch to night mode'));
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
      const line = generateSvgElement('line', [classNameStepLine], {
        x1: 0 as any,
        x2: this.width as any,
        y1: positionY as any,
        y2: positionY as any,
      });
      const text = generateSvgElement(
        'text',
        [classNameStepTitle],
        {
          x: 0 as any,
          y: (positionY - 5) as any,
        },
        [],
        step.toString(),
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
