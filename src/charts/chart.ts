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
  addNodeListener,
  animatePath,
  changePathOnElement,
  createTextNode,
  findClosestIndexPointX,
  getCoordsX,
  getCoordsY,
  getMinMax,
  getOffsetIndex,
  getPathByPoints,
  getRelativeOffset,
  getShortDateByUnix,
  removeAllChild,
  removeNodeListener,
  setNodeAttrs,
  setStyleBatch,
} from '../utils/misc';
import { generateCheckbox, generateNode, generateSvgElement } from './generator';

// constant number
const POINT_RADIUS = 5;
const MIN_TOOLTIP_WIDTH = 90;
const DEFAULT_HOR_STEPS = 6;
const DEFAULT_SPACING_RIGHT = 30;
const DEFAULT_SPACING_LEFT = 30;
const DEFAULT_SPACING_PREVIEW = 10;
const DEFAULT_SPACING_TOP = 10;
const DEFAULT_SPACING_BTM = 10;
const DEFAULT_SPACING_TOP_PREVIEW = 5;
const DEFAULT_SPACING_BTM_PREVIEW = 5;
const DEFAULT_SPACING = DEFAULT_SPACING_RIGHT + DEFAULT_SPACING_LEFT;
const DEFAULT_PREVIEW_SPACING = 10;
const DEFAULT_SLICE = 19; // Programming + 1
const SLICE_NUMBER = 5.5;
const DEFAULT_DAY_COUNT = 6;
const MIN_CONTROL_WIDTH = DEFAULT_PREVIEW_SPACING;
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

  private timer: number | null = null;
  private timerPreview: number | null = null;
  private resizeAnimationFrame: number | null = null;
  private dragAnimationFrame: number | null = null;
  private mouseMoveAnimationFrame: number | null = null;

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

  private night_mod = false;

  private horizontSteps: number;

  private sliceStartIndex = 0;

  private sliceEndIndex = 0;

  private currentSlicePoint: { [key: string]: Array<PointWithValue> } = {};

  private verticleLine: SVGElement;

  private columnsVisible: { [key: string]: boolean } = {};

  private columnDatasets: { [key: string]: Array<number> } = {};

  private countElements: number;

  constructor(
    private id: number,
    private node: HTMLElement,
    private charts_svg: HTMLElement | SVGElement,
    private preview_svg: HTMLElement | SVGElement,
    private toolTip: HTMLElement,
    private toolTipDate: HTMLElement,
    private controlsContainer: HTMLElement,
    private nightModeControl: HTMLElement,
    private dataset: Chart,
    private options: ChartOptions,
  ) {
    this.height = parseInt(this.charts_svg.getAttribute('height'));
    this.width = parseInt(this.charts_svg.getAttribute('width'));
    // Set tooltip max width
    this.toolTip.style.maxWidth = `${this.width - 2 * DEFAULT_SPACING}px`;

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
        this.sliceEndIndex = this.columnDatasets[keyOfColumn].length - 1;
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
      this.previewHeight = parseInt(this.preview_svg.getAttribute('height'));
      this.previewWidth = parseInt(this.preview_svg.getAttribute('width'));
      this.drawPreview();
      this.drawPreviewControls(true);
    }

    if (!options.withoutControls) {
      this.generateControls();
    }

    if (!options.withoutNightMode) {
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
      this.controlsContainer.appendChild(checkBoxControl);
      const label = checkBoxControl.querySelector("input[type='checkbox']");
      label.addEventListener('click', this.doPreventDefault, false);
      checkBoxControl.addEventListener('click', this.onCheckBoxClick, false);
      this.setColorCheckboxByKey(key);
    });
  }

  doPreventDefault = (e: MouseEvent) => {
    e.stopPropagation();
  };

  onNightModeClick = () => {
    this.toggleNightMode();
  };

  onCheckBoxClick = (e: MouseEvent) => {
    let target = e.target as HTMLElement;
    let key = target.getAttribute('key');
    while (!key || target === document.body) {
      target = target.parentNode as HTMLElement;
      key = target.getAttribute('key');
    }
    if (key) {
      this.toggleColumnVisible(key);
    }
  };

  addMouseListener() {
    addNodeListener(this.charts_svg, this.SVG_CHARTS_LISTENERS);
    addNodeListener(document, {
      mouseup: this.onMouseUp,
    });
  }

  destroy(withRemove = true) {
    this.resetTimer();
    removeNodeListener(this.charts_svg, this.SVG_CHARTS_LISTENERS);
    removeNodeListener(document, {
      mouseup: this.onMouseUp,
    });

    if (!this.options.withoutControls) {
      this.controlsContainer.querySelectorAll("input[type='checkbox']").forEach(el => {
        el.removeEventListener('change', this.onCheckBoxClick);
      });
      this.controlsContainer.querySelectorAll('label').forEach(el => {
        el.removeEventListener('click', this.doPreventDefault);
      });
    }

    if (!this.options.withoutNightMode) {
      this.nightModeControl.removeEventListener('click', this.onNightModeClick);
    }
    if (!this.options.withoutPreview) {
      removeNodeListener(this.centerControl, this.CENTRAL_CONTROL_LISTENERS);

      removeNodeListener(this.preview_svg, this.PREVIEW_CHART_LISTENERS);

      removeNodeListener(this.leftResizeControl, this.LEFT_RESIZE_CONTROL_LISTENERS);

      removeNodeListener(this.rightResizeControl, this.RIGHT_RESIZE_CONTROL_LISTENERS);

      removeNodeListener(this.leftControl, {
        click: this.onPreviewControlClick,
      });

      removeNodeListener(this.rightControl, {
        click: this.onPreviewControlClick,
      });
    }
    if (withRemove) {
      this.node.remove();
    }
  }

  onMouseUp = () => {
    this.isResizeActive = false;
    this.isDragActive = false;
    this.activeResize = null;
  };

  onResizeStartRight = () => {
    this.hideHoverLineAndPoints();
    this.isResizeActive = true;
    this.activeResize = true;
  };

  onResizeStartLeft = () => {
    this.hideHoverLineAndPoints();
    this.isResizeActive = true;
    this.activeResize = false;
  };

  onResizeEndLeft = () => {
    this.isResizeActive = false;
    this.activeResize = null;
  };

  onResizeEndRight = () => {
    this.isResizeActive = false;
    this.activeResize = null;
  };

  onResize = (e: MouseEvent | TouchEvent) => {
    if (this.isResizeActive) {
      if (this.resizeAnimationFrame) {
        cancelAnimationFrame(this.resizeAnimationFrame);
      }
      this.resizeAnimationFrame = requestAnimationFrame(() => this.doResize(this.activeResize, e));
    }
  };

  onDragStart = (e: MouseEvent | TouchEvent) => {
    this.hideHoverLineAndPoints();
    this.isDragActive = true;
  };

  onDragEnd = (e: MouseEvent | TouchEvent) => {
    this.isDragActive = false;
  };

  onDrag = (e: MouseEvent | TouchEvent) => {
    if (this.isDragActive) {
      if (this.dragAnimationFrame) {
        cancelAnimationFrame(this.dragAnimationFrame);
      }
      this.dragAnimationFrame = requestAnimationFrame(() => this.onPreviewControlClick(e));
    }
  };

  onMouseEnter = () => {
    this.verticleLine.classList.add('show');
  };

  onMouseLeave = (e: MouseEvent) => {
    const cordY = getRelativeOffset(e.clientY, this.positions.top);
    if (e.toElement !== this.toolTip || cordY >= this.height - 100) {
      this.hideHoverLineAndPoints();
    }
  };

  hideHoverLineAndPoints() {
    this.removePoints();
    this.verticleLine.classList.remove('show');
    this.toolTip.style.display = 'none';
  }

  doResize(isRight: boolean, e: MouseEvent | TouchEvent) {
    if (isRight === null) {
      return;
    }
    const cursorX =
      getRelativeOffset(
        (e as MouseEvent).clientX || (e as TouchEvent).touches[0].clientX,
        this.positions.left,
      ) -
      DEFAULT_PREVIEW_SPACING -
      MIN_CONTROL_WIDTH;
    const offsetIndex = getOffsetIndex(
      cursorX,
      this.previewWidth,
      DEFAULT_PREVIEW_SPACING,
      DEFAULT_PREVIEW_SPACING,
      this.countElements,
    );
    if (!isRight) {
      this.sliceStartIndex = offsetIndex;
      if (this.sliceStartIndex >= this.sliceEndIndex) {
        this.sliceStartIndex = this.sliceEndIndex - 1;
      }
    } else {
      this.sliceEndIndex = offsetIndex;

      if (this.sliceEndIndex <= this.sliceStartIndex) {
        this.sliceEndIndex = this.sliceStartIndex + 1;
      }
    }

    this.drawPreviewControls();
    this.removeAxisXCharts();
    this.draw();
  }

  onPreviewControlClick = (e: MouseEvent | TouchEvent) => {
    const cursorX =
      Math.ceil(
        getRelativeOffset(
          (e as MouseEvent).clientX || (e as TouchEvent).touches[0].clientX,
          this.positions.left,
        ),
      ) -
      2 * DEFAULT_PREVIEW_SPACING;
    const sliceSize = this.sliceEndIndex - this.sliceStartIndex;
    const offsetIndexLeft = Math.floor(
      getOffsetIndex(
        cursorX,
        this.previewWidth,
        DEFAULT_PREVIEW_SPACING,
        DEFAULT_PREVIEW_SPACING,
        this.countElements,
      ) -
        sliceSize / 2,
    );
    this.sliceStartIndex = Math.max(offsetIndexLeft, 0);
    this.sliceEndIndex = Math.min(this.sliceStartIndex + sliceSize, this.countElements - 1);
    if (this.sliceEndIndex === this.countElements - 1) {
      this.sliceStartIndex = Math.max(0, this.sliceEndIndex - sliceSize);
    }
    if (this.sliceStartIndex === 0) {
      this.sliceEndIndex = Math.min(this.sliceStartIndex + sliceSize, this.countElements - 2);
    }
    this.drawPreviewControls();
    this.removeAxisXCharts();
    this.draw();
  };

  onMouseMove = (e: MouseEvent) => {
    if (this.mouseMoveAnimationFrame) {
      cancelAnimationFrame(this.mouseMoveAnimationFrame);
    }
    this.mouseMoveAnimationFrame = requestAnimationFrame(() => {
      const cordX = getRelativeOffset(e.clientX, this.positions.left);
      if (cordX > DEFAULT_SPACING_LEFT / 2 && cordX < this.width - DEFAULT_SPACING_RIGHT / 2) {
        const cordY = e.offsetY;
        setNodeAttrs(this.verticleLine, {
          x1: cordX as any,
          x2: cordX as any,
        });
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
    });
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
    const leftPosition = (point.x as number) + DEFAULT_SPACING_LEFT;
    const topPosition = (point.y as number) + DEFAULT_SPACING_TOP;
    const stylesTooltip = {
      display: 'flex',
      right: 'unset',
      left: `${leftPosition}px`,
      top: `${topPosition}px`,
    };
    const childContainer = this.toolTip.querySelector('.items') as HTMLElement;

    removeAllChild(childContainer);
    removeAllChild(this.toolTipDate);

    this.toolTipDate.appendChild(createTextNode(getShortDateByUnix(arr[0].date, true)));
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
              textValue: item.value as any,
            },
            {
              tag: 'span',
              classList: ['item'],
              textValue: this.dataset.names[item.key],
            },
          ],
        }),
      )
      .forEach(item => childContainer.appendChild(item));

    if (leftPosition > this.width - MIN_TOOLTIP_WIDTH) {
      stylesTooltip.right = `${Math.min(
        MIN_TOOLTIP_WIDTH,
        this.width - leftPosition + DEFAULT_SPACING_LEFT + DEFAULT_SPACING_RIGHT,
      )}px`;
      stylesTooltip.left = 'unset';
    }

    setStyleBatch(this.toolTip, stylesTooltip);
  }

  findClosesIndexOfPoint(cordX: number): number | null {
    const arr = Object.keys(this.columnsVisible).filter(key => this.columnsVisible[key]);
    if (!arr.length) {
      return null;
    }
    return findClosestIndexPointX(this.currentSlicePoint[arr[0]], cordX);
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
      setStyleBatch(label, {
        'border-color': color,
        'background-color': color,
      });
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
      addNodeListener(this.leftControl, {
        click: this.onPreviewControlClick,
      });

      addNodeListener(this.rightControl, {
        click: this.onPreviewControlClick,
      });

      // PC

      addNodeListener(this.centerControl, this.CENTRAL_CONTROL_LISTENERS);

      addNodeListener(this.preview_svg, this.PREVIEW_CHART_LISTENERS);

      addNodeListener(this.leftResizeControl, this.LEFT_RESIZE_CONTROL_LISTENERS);

      addNodeListener(this.rightResizeControl, this.RIGHT_RESIZE_CONTROL_LISTENERS);
    }
  }

  drawPreviewLeftResizeControl(): SVGElement {
    const leftResizeControlSize = {
      width: RESIZE_CONTROL_WIDTH,
      height: this.previewHeight,
    } as RectangleOptions;
    const leftResizeControlPoint = {
      x: Math.max(
        0,
        DEFAULT_PREVIEW_SPACING +
          (this.sliceStartIndex / (this.countElements - 1)) * this.previewWidth -
          2 * MIN_CONTROL_WIDTH,
      ),
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
    setNodeAttrs(this.leftResizeControl, {
      x: leftResizeControlPoint.x as any,
      y: leftResizeControlPoint.y as any,
      width: leftResizeControlSize.width as any,
    });
    return this.leftResizeControl;
  }

  drawPreviewRightResizeControl(): SVGElement {
    const rightResizeControlSize = {
      width: RESIZE_CONTROL_WIDTH,
      height: this.previewHeight,
    } as RectangleOptions;
    const rightResizeControlPoint = {
      x: Math.min(
        this.previewWidth - DEFAULT_PREVIEW_SPACING,
        -DEFAULT_PREVIEW_SPACING +
          this.previewWidth * (this.sliceEndIndex / (this.countElements - 1)),
      ),
      y: 0,
    } as Point;

    if (!this.rightResizeControl) {
      const rightResizeRect = generateSvgElement('rect', [classControlResizeName, 'right'], {
        x: rightResizeControlPoint.x as any,
        y: rightResizeControlPoint.y as any,
        width: rightResizeControlSize.width as any,
        height: rightResizeControlSize.height as any,
        fill: 'none',
      });
      this.preview_svg.appendChild(rightResizeRect);
      return rightResizeRect;
    }

    setNodeAttrs(this.rightResizeControl, {
      x: rightResizeControlPoint.x as any,
      y: rightResizeControlPoint.y as any,
      width: rightResizeControlSize.width as any,
    });
    return this.rightResizeControl;
  }

  drawPreviewCenterControl(): SVGElement {
    const centerControlSize = {
      width:
        Math.max(
          0,
          Math.min(
            this.previewWidth - DEFAULT_PREVIEW_SPACING,
            -DEFAULT_PREVIEW_SPACING +
              this.previewWidth * (this.sliceEndIndex / (this.countElements - 1)),
          ) -
            (DEFAULT_PREVIEW_SPACING +
              (this.sliceStartIndex / (this.countElements - 1)) * this.previewWidth),
          0,
        ) + MIN_CONTROL_WIDTH,
      height: this.previewHeight,
    } as RectangleOptions;
    const centerControlPoint = {
      x:
        DEFAULT_PREVIEW_SPACING +
        (this.sliceStartIndex / (this.countElements - 1)) * this.previewWidth -
        MIN_CONTROL_WIDTH,
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

    setNodeAttrs(this.centerControl, {
      x: centerControlPoint.x as any,
      y: centerControlPoint.y as any,
      width: centerControlSize.width as any,
    });

    return this.centerControl;
  }

  drawLeftNavigateControl(): SVGElement {
    const leftControlSize = {
      width:
        DEFAULT_PREVIEW_SPACING +
        (this.sliceStartIndex / (this.countElements - 1)) * this.previewWidth -
        MIN_CONTROL_WIDTH,
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
    setNodeAttrs(this.leftControl, {
      x: leftControlPoint.x as any,
      y: leftControlPoint.y as any,
      width: leftControlSize.width as any,
    });

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
      x: Math.min(
        this.previewWidth - DEFAULT_PREVIEW_SPACING,
        -DEFAULT_PREVIEW_SPACING +
          this.previewWidth * (this.sliceEndIndex / (this.countElements - 1)),
      ),
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

    setNodeAttrs(this.rightControl, {
      x: rightControlPoint.x as any,
      y: rightControlPoint.y as any,
      width: rightControlSize.width as any,
    });

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
    cancelAnimationFrame(this.dragAnimationFrame);
    this.dragAnimationFrame = null;
    cancelAnimationFrame(this.resizeAnimationFrame);
    this.resizeAnimationFrame = null;
    cancelAnimationFrame(this.mouseMoveAnimationFrame);
    this.mouseMoveAnimationFrame = null;
  }

  setRightIndexSlice(size: number) {
    this.sliceStartIndex = size;
    this.refresh();
  }

  setLeftIndexSlice(size: number) {
    this.sliceEndIndex = size;
    this.refresh();
  }

  removeAxisXCharts() {
    const el = this.charts_svg.querySelector(`g.axis`);
    if (el) {
      el.remove();
    }
  }

  drawCurrentSlice(withAnimation = true, withXAxis = true) {
    const realMinValue = this.minValue >= 0 ? 0 : this.minValue;
    const sliceSize = this.sliceEndIndex - this.sliceStartIndex + 1;
    let fullWidth = 0;
    let labelCount = Math.min(DEFAULT_DAY_COUNT, sliceSize + 1);
    const mustGeneratedLabels = labelCount;
    const deltaDays =
      sliceSize <= DEFAULT_DAY_COUNT + 2 ? 1 : Math.max(sliceSize / (mustGeneratedLabels - 1), 1);
    let index = this.sliceStartIndex;

    const drawTextAxis = (firstX: number, lastX: number) => {
      const arrayOfText = [];

      if (deltaDays == 1) {
        for (let i = this.sliceStartIndex; i <= this.sliceEndIndex; i++) {
          const text = generateSvgElement(
            'text',
            [classNameAbsLine],
            {
              x: 0 as any,
              y: this.height as any,
            },
            [],
            getShortDateByUnix(this.columnDatasets[Type.X][i]),
          );
          arrayOfText.push(text);
        }
      } else {
        const firstItem = generateSvgElement(
          'text',
          [classNameAbsLine],
          {
            x: 0 as any,
            y: this.height as any,
          },
          [],
          getShortDateByUnix(this.columnDatasets[Type.X][this.sliceStartIndex]),
        );
        arrayOfText.push(firstItem);
        index += deltaDays;

        while (labelCount - 2 > 0 && index < this.sliceEndIndex - 2) {
          const item = this.columnDatasets[Type.X][Math.ceil(index)];
          const text = generateSvgElement(
            'text',
            [classNameAbsLine],
            {
              x: 0 as any,
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
            x: 0 as any,
            y: this.height as any,
          },
          [],
          getShortDateByUnix(this.columnDatasets[Type.X][this.sliceEndIndex]),
        );
        arrayOfText.push(lastItem);
      }
      const group = generateSvgElement('g', ['axis'], null, arrayOfText);
      this.charts_svg.appendChild(group);
      let firstItemX: number;
      let lastItemX: number;
      const lengthChild = group.children.length;
      for (let index = 0; index < lengthChild; index++) {
        const item = group.children[index].getBoundingClientRect().width;
        fullWidth += item;
        if (index === 0) {
          firstItemX = item / 2;
        }
        if (index === group.children.length - 1) {
          lastItemX = item / 2;
        }
      }

      if (lengthChild === 1) {
        setNodeAttrs(group.children[0], {
          x: (firstX - firstItemX) as any,
        });
      } else {
        const textDelta =
          (Math.max(lastX + lastItemX) - (firstX - firstItemX) - fullWidth) /
          Math.max(arrayOfText.length - 1, 1);
        let relWidth = 0;
        for (let index = 0; index < lengthChild; index++) {
          const item = group.children[index];
          setNodeAttrs(item, {
            x: (firstItemX + relWidth + textDelta * index) as any,
          });
          relWidth += item.getBoundingClientRect().width;
        }
      }
    };

    let firstPointX: number;
    let lastPointX: number;

    Object.keys(this.columnsVisible).forEach(key => {
      const columnVisible = this.columnsVisible[key];

      if (columnVisible) {
        const currentPath = this.charts_svg.querySelector(
          `path#${`pyx_path_${key}`}`,
        ) as SVGPathElement;

        this.currentSlicePoint[key] = this.columnDatasets[key]
          .slice(this.sliceStartIndex, this.sliceEndIndex + 1)
          .map((point, index) => {
            return {
              x: getCoordsX(
                this.width,
                DEFAULT_SPACING_LEFT,
                DEFAULT_SPACING_RIGHT,
                index,
                sliceSize,
              ),
              y: getCoordsY(
                this.height,
                DEFAULT_SPACING_TOP,
                DEFAULT_SPACING_BTM,
                this.maxValue,
                realMinValue,
                point,
              ),
              value: point,
              date: this.columnDatasets[Type.X][this.sliceStartIndex + index],
            };
          });
        if (firstPointX === undefined) {
          firstPointX = this.currentSlicePoint[key][0].x as any;
        }
        if (lastPointX === undefined) {
          lastPointX = this.currentSlicePoint[key][this.sliceEndIndex - this.sliceStartIndex]
            .x as any;
        }

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

    if (withXAxis) {
      drawTextAxis(firstPointX, lastPointX);
    }
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

    const minMax = getMinMax(values);
    this.minValueGlobal = minMax.min;
    this.maxValueGlobal = minMax.max;

    Object.keys(this.columnsVisible).forEach(key => {
      const columnVisible = this.columnsVisible[key];
      if (columnVisible) {
        const path = generateSvgElement('path', [], {
          id: `pyx_path_preview_${key}`,
          d: getPathByPoints(
            this.columnDatasets[key].map((point, index) => ({
              x: getCoordsX(
                this.previewWidth,
                DEFAULT_SPACING_PREVIEW,
                DEFAULT_SPACING_PREVIEW,
                index,
                this.countElements,
              ),
              y: getCoordsY(
                this.previewHeight,
                DEFAULT_SPACING_TOP_PREVIEW,
                DEFAULT_SPACING_BTM_PREVIEW,
                this.maxValueGlobal,
                this.minValueGlobal,
                point,
              ),
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

    const minMax = getMinMax(values);
    this.minValue = minMax.min;
    this.maxValue = minMax.max;
    const step =
      values.length === 0
        ? 0
        : Math.ceil(
            (this.minValue > 0 ? this.maxValue : this.maxValue - this.minValue) /
              this.horizontSteps,
          );

    const stepsArr = this.minValue > 0 ? [0] : [this.minValue];
    for (let index = 1; index < this.horizontSteps; index++) {
      stepsArr.push(stepsArr[0] + step * index || index);
    }

    this.drawSteps(stepsArr);
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
    const realMinValue = this.minValue >= 0 ? 0 : this.minValue;
    const groupSteps = this.charts_svg.querySelector('g.steps');
    if (groupSteps) {
      groupSteps.remove();
    }
    const stepsElements = [] as Array<SVGElement>;
    arr.forEach((step, index) => {
      const cordY =
        index === 0
          ? this.height - DEFAULT_SPACING_BTM
          : (getCoordsY(
              this.height,
              DEFAULT_SPACING_TOP,
              DEFAULT_SPACING_BTM,
              this.maxValue,
              realMinValue,
              step,
            ) as any);
      const line = generateSvgElement('line', [classNameStepLine], {
        x1: 0 as any,
        x2: this.width as any,
        y1: cordY,
        y2: cordY,
      });
      const text = generateSvgElement(
        'text',
        [classNameStepTitle],
        {
          x: 0 as any,
          y: (cordY - 5) as any,
        },
        [],
        step as any,
      );
      stepsElements.push(line);
      stepsElements.push(text);
    });
    const groupStepsEl = generateSvgElement('g', ['steps'], null, stepsElements);
    this.charts_svg.prepend(groupStepsEl);
  }

  getTranspilingDataset() {
    return this.columnDatasets;
  }

  private SVG_CHARTS_LISTENERS = {
    mouseenter: this.onMouseEnter,
    mouseleave: this.onMouseLeave,
    mousemove: this.onMouseMove,
  };

  private CENTRAL_CONTROL_LISTENERS = {
    mousedown: this.onDragStart,
    mouseout: this.onDrag,
    mouseup: this.onDragEnd,
    touchstart: this.onDragStart,
    touchmove: this.onDrag,
    touchend: this.onDragEnd,
    touchcancel: this.onDrag,
  };

  private PREVIEW_CHART_LISTENERS = {
    mousemove: [this.onDrag, this.onResize],
    touchmove: [this.onDrag, this.onResize],
  };

  private LEFT_RESIZE_CONTROL_LISTENERS = {
    mouseup: this.onResizeEndLeft,
    mousedown: this.onResizeStartLeft,
    touchend: this.onResizeEndLeft,
    touchstart: this.onResizeStartLeft,
  };

  private RIGHT_RESIZE_CONTROL_LISTENERS = {
    mouseup: this.onResizeEndRight,
    mousedown: this.onResizeStartRight,
    touchend: this.onResizeEndRight,
    touchstart: this.onResizeStartRight,
  };
}
