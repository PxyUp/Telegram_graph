import {
  Chart,
  ChartOptions,
  Point,
  PointWithColor,
  PointWithValue,
  PointWithValueAndColor,
  Type,
} from '../interfaces/chart';
import {
  addNodeListener,
  changePathOnElement,
  createTextNode,
  findClosestIndexPointX,
  getCoordsX,
  getCoordsY,
  getLeftTransitionByIndex,
  getMinMax,
  getPathByPoints,
  getRelativeOffset,
  getRightTransitionByIndex,
  getShortDateByUnix,
  relativeIndexByOffset,
  removeAllChild,
  removeNodeListener,
  setNodeAttrs,
  setStyleBatch,
} from '../utils/misc';
import { generateNode, generateSvgElement } from './generator';

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

// ClassNames
const classNameStepLine = 'line_step';
const verticleLineClass = 'verticle';
const classNameStepTitle = 'text_step';

export class PxyUpChart {
  private isDragActive = false;
  private isResizeActive = false;
  private activeResize: boolean | null = null;
  private resizeAnimationFrame: number | null = null;
  private dragAnimationFrame: number | null = null;
  private mouseMoveAnimationFrame: number | null = null;
  private toggleColumnAnimationFrame: number | null = null;

  private maxValue: number;
  private minValue: number;

  private maxValueGlobal: number;
  private minValueGlobal: number;

  private height: number;
  private width: number;

  private previewWidth: number;
  private previewHeight: number;

  private night_mod = false;

  private horizontSteps: number;

  private sliceStartIndex = 0;

  private sliceEndIndex = 0;

  private currentSlicePoint: { [key: string]: Array<PointWithValue> } = {};

  private verticleLine: SVGElement;

  private columnsVisible: { [key: string]: boolean } = {};

  private columnDatasets: { [key: string]: Array<number> } = {};

  private countElements: number;

  private _position: ClientRect;

  private animationTimer: number | null = null;

  constructor(
    private id: number,
    private node: HTMLElement,
    private charts_svg: HTMLElement | SVGElement,
    private preview_svg: HTMLElement | SVGElement,
    private toolTip: HTMLElement,
    private toolTipDate: HTMLElement,
    private controlsContainer: HTMLElement,
    private nightModeControl: HTMLElement,
    private axisContainer: HTMLElement,
    private leftPreviewControl: HTMLElement,
    private rightPreviewControl: HTMLElement,
    private centerPreviewControl: HTMLElement,
    private leftResizeControl: HTMLElement,
    private rightResizeControl: HTMLElement,
    private previewControlContainer: HTMLElement,
    private dataset: Chart,
    private options: ChartOptions,
  ) {
    // Hi Telegram Team!
    // I tried charts with get min time for Scripting/Rendering/Painting in Chrome Dev Tools and Application size
    // And i tried do it scalable, animation of axis X with point on chart > 1000, will be slow
    // Because you every time need hide/show/translate more > 994 elements, i wanna scalable solution
    // That reason why i tried optimize all of them appendChild, remove, setStyle and more another things
    // Thank you for challenge!
    this.height = +this.charts_svg.getAttribute('height');
    this.width = +this.charts_svg.getAttribute('width');
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
      y2: (this.height - DEFAULT_SPACING_BTM) as any,
    });

    this.charts_svg.appendChild(this.verticleLine);

    this.addMouseListener();

    if (!options.withoutAxisLabel) {
      setStyleBatch(this.axisContainer, {
        top: `${this.height - DEFAULT_SPACING_BTM}px`,
        width: `${this.width - (DEFAULT_SPACING_LEFT + DEFAULT_SPACING_RIGHT) / 2}px`,
        'padding-left': `${(DEFAULT_SPACING_LEFT / 3) * 2}px`,
        'padding-right': `${DEFAULT_SPACING_RIGHT / 2}px`,
      });
    }
    this.draw();

    if (!options.withoutPreview) {
      this.previewHeight = +this.preview_svg.getAttribute('height');
      this.previewWidth = +this.preview_svg.getAttribute('width');
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
      const checkBoxControl = generateNode({
        tag: 'div',
        classList: ['checkbox_container'],
        attrs: {
          key: key,
        },
        children: [
          {
            tag: 'div',
            classList: ['round'],
          },
          {
            tag: 'div',
            classList: ['label'],
            textValue: this.dataset.names[key],
          },
        ],
      });
      this.controlsContainer.appendChild(checkBoxControl);
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
    if (this.toggleColumnAnimationFrame) {
      cancelAnimationFrame(this.toggleColumnAnimationFrame);
    }
    this.toggleColumnAnimationFrame = requestAnimationFrame(() => {
      this.removePoints();
      let target = e.target as HTMLElement;
      let key = target.getAttribute('key');
      while (!key || target === document.body) {
        target = target.parentNode as HTMLElement;
        key = target.getAttribute('key');
      }
      if (key) {
        this.toggleColumnVisible(key);
      }
    });
  };

  addMouseListener() {
    addNodeListener(this.charts_svg, this.SVG_CHARTS_LISTENERS);
    addNodeListener(document, this.DOCUMENT_LISTENERS);
    addNodeListener(this.toolTip, this.TOOLTIP_LISTENERS);
  }

  destroy(withRemove = true) {
    this.resetTimer();
    removeNodeListener(this.charts_svg, this.SVG_CHARTS_LISTENERS);
    removeNodeListener(document, this.DOCUMENT_LISTENERS);
    removeNodeListener(this.toolTip, this.TOOLTIP_LISTENERS);

    if (!this.options.withoutControls) {
      this.controlsContainer.querySelectorAll('.round').forEach(item => {
        item.removeEventListener('click', this.onCheckBoxClick);
      });
    }

    if (!this.options.withoutNightMode) {
      this.nightModeControl.removeEventListener('click', this.onNightModeClick);
    }
    if (!this.options.withoutPreview) {
      removeNodeListener(this.centerPreviewControl, this.CENTRAL_CONTROL_LISTENERS);

      removeNodeListener(this.previewControlContainer, this.PREVIEW_CHART_LISTENERS);

      removeNodeListener(this.leftResizeControl, this.LEFT_RESIZE_CONTROL_LISTENERS);

      removeNodeListener(this.rightResizeControl, this.RIGHT_RESIZE_CONTROL_LISTENERS);

      removeNodeListener(this.leftPreviewControl, {
        click: this.onPreviewControlClick,
      });

      removeNodeListener(this.rightPreviewControl, {
        click: this.onPreviewControlClick,
      });
    }
    if (withRemove) {
      this.node.remove();
    }
  }

  onMouseUp = (e: any) => {
    this.isResizeActive = false;
    this.isDragActive = false;
    this.activeResize = null;
  };

  onResizeStartRight = (e: MouseEvent) => {
    e.stopPropagation();
    this.isDragActive = false;
    this.hideHoverLineAndPoints();
    this.isResizeActive = true;
    this.activeResize = true;
  };

  onResizeStartLeft = (e: MouseEvent) => {
    e.stopPropagation();
    this.isDragActive = false;
    this.hideHoverLineAndPoints();
    this.isResizeActive = true;
    this.activeResize = false;
  };

  stopProp = (e: MouseEvent) => {
    e.stopPropagation();
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
    e.preventDefault();
    if (this.isResizeActive) {
      if (this.resizeAnimationFrame) {
        cancelAnimationFrame(this.resizeAnimationFrame);
      }
      this.resizeAnimationFrame = requestAnimationFrame(() => this.doResize(this.activeResize, e));
    }
  };

  onDragStart = (e: MouseEvent | TouchEvent) => {
    e.stopPropagation();
    this.hideHoverLineAndPoints();
    this.isDragActive = true;
  };

  onDragEnd = (e: MouseEvent | TouchEvent) => {
    this.isDragActive = false;
  };

  onDrag = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
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

  onToolTipLeave = () => {
    this.hideHoverLineAndPoints();
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
    const cursorX = getRelativeOffset(
      (e as MouseEvent).clientX || (e as TouchEvent).touches[0].clientX,
      this.positions.left,
    );
    const offsetIndex = relativeIndexByOffset(
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
    const cursorX = getRelativeOffset(
      (e as MouseEvent).clientX || (e as TouchEvent).touches[0].clientX,
      this.positions.left,
    );
    const sliceSize = this.sliceEndIndex - this.sliceStartIndex;
    const offsetIndexLeft = Math.floor(
      relativeIndexByOffset(
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
      this.sliceEndIndex = Math.min(this.sliceStartIndex + sliceSize, this.countElements - 1);
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
      const cordX = e.offsetX;
      const cordY = e.offsetY;
      if (
        cordX > DEFAULT_SPACING_LEFT / 2 &&
        cordX < this.width - DEFAULT_SPACING_RIGHT / 2 &&
        cordY < this.height - DEFAULT_SPACING_BTM
      ) {
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
    arr.forEach(item =>
      childContainer.appendChild(
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
      ),
    );

    if (leftPosition > this.width - MIN_TOOLTIP_WIDTH - DEFAULT_SPACING_RIGHT) {
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
    const path = this.charts_svg.querySelector(`path#pxyup_path_${this.id}_${key}`);
    if (path) {
      path.remove();
    }
  }

  setColorCheckboxByKey(key: string) {
    const color = this.dataset.colors[key];
    const checkbox = this.controlsContainer.querySelector(
      `.checkbox_container[key="${key}"] .round`,
    ) as HTMLElement;
    if (!this.columnsVisible[key]) {
      checkbox.classList.add('not_active');
    } else {
      checkbox.classList.remove('not_active');
      setStyleBatch(checkbox, {
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
    this.node.classList.add('animation');
    if (!this.options.withoutPreview) {
      this.drawPreview(false);
    }
    this.refresh(false, false);
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
    }
    this.animationTimer = window.setTimeout(() => {
      this.node.classList.remove('animation');
    }, 150);
  }

  drawPreviewControls(withEvents: boolean = false) {
    const leftControlTranslate = getLeftTransitionByIndex(
      this.sliceStartIndex,
      this.previewWidth,
      DEFAULT_PREVIEW_SPACING,
      DEFAULT_PREVIEW_SPACING,
      this.countElements,
    );
    const rightControlTranslate = getRightTransitionByIndex(
      this.sliceEndIndex,
      this.previewWidth,
      DEFAULT_PREVIEW_SPACING,
      DEFAULT_PREVIEW_SPACING,
      this.countElements,
    );
    setStyleBatch(this.leftPreviewControl, {
      transform: `translateX(${leftControlTranslate}px)`,
    });
    setStyleBatch(this.rightPreviewControl, {
      transform: `translateX(${rightControlTranslate}px)`,
    });
    const centralWidth = Math.ceil(
      Math.abs(
        Math.abs(this.previewWidth - rightControlTranslate) - Math.abs(leftControlTranslate),
      ),
    );
    setStyleBatch(this.centerPreviewControl, {
      width: `${centralWidth}px`,
      transform: `translateX(${Math.round(rightControlTranslate - centralWidth)}px)`,
    });

    if (withEvents) {
      addNodeListener(this.leftPreviewControl, {
        click: this.onPreviewControlClick,
      });

      addNodeListener(this.rightPreviewControl, {
        click: this.onPreviewControlClick,
      });

      // PC

      addNodeListener(this.centerPreviewControl, this.CENTRAL_CONTROL_LISTENERS);

      addNodeListener(this.previewControlContainer, this.PREVIEW_CHART_LISTENERS);

      addNodeListener(this.leftResizeControl, this.LEFT_RESIZE_CONTROL_LISTENERS);

      addNodeListener(this.rightResizeControl, this.RIGHT_RESIZE_CONTROL_LISTENERS);
    }
  }

  draw(withAnimation = true, withXAxis = true) {
    this.setSupportsLines();
    this.drawCurrentSlice(withAnimation, withXAxis);
  }

  refresh(withAnimation = true, withXAxis = true) {
    this.resetTimer();
    this.draw(withAnimation, withXAxis);
  }

  drawAxisX() {
    removeAllChild(this.axisContainer);
    const sliceSize = this.sliceEndIndex - this.sliceStartIndex + 1;
    let labelCount = Math.min(DEFAULT_DAY_COUNT, sliceSize + 1);
    const mustGeneratedLabels = labelCount;
    const deltaDays =
      sliceSize <= DEFAULT_DAY_COUNT + 2 ? 1 : Math.max(sliceSize / (mustGeneratedLabels - 1), 1);
    let index = this.sliceStartIndex;

    const generateLabel = (text: string) => {
      return generateNode({
        tag: 'div',
        textValue: text,
      });
    };
    if (deltaDays == 1) {
      for (let i = this.sliceStartIndex; i <= this.sliceEndIndex; i++) {
        this.axisContainer.appendChild(
          generateLabel(getShortDateByUnix(this.columnDatasets[Type.X][i])),
        );
      }
    } else {
      this.axisContainer.appendChild(
        generateLabel(getShortDateByUnix(this.columnDatasets[Type.X][this.sliceStartIndex])),
      );
      index += deltaDays;

      while (labelCount - 2 > 0 && index < this.sliceEndIndex - 2) {
        this.axisContainer.appendChild(
          generateLabel(getShortDateByUnix(this.columnDatasets[Type.X][Math.ceil(index)])),
        );
        labelCount -= 1;
        index += deltaDays;
      }
      this.axisContainer.appendChild(
        generateLabel(getShortDateByUnix(this.columnDatasets[Type.X][this.sliceEndIndex])),
      );
    }
  }

  resetTimer() {
    if (this.dragAnimationFrame) {
      cancelAnimationFrame(this.dragAnimationFrame);
      this.dragAnimationFrame = null;
    }
    if (this.resizeAnimationFrame) {
      cancelAnimationFrame(this.resizeAnimationFrame);
      this.resizeAnimationFrame = null;
    }
    if (this.mouseMoveAnimationFrame) {
      cancelAnimationFrame(this.mouseMoveAnimationFrame);
      this.mouseMoveAnimationFrame = null;
    }
    if (this.toggleColumnAnimationFrame) {
      cancelAnimationFrame(this.toggleColumnAnimationFrame);
      this.toggleColumnAnimationFrame = null;
    }
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
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

    Object.keys(this.columnsVisible).forEach(key => {
      const columnVisible = this.columnsVisible[key];

      if (columnVisible) {
        const currentPath = this.charts_svg.querySelector(
          `path#${`pxyup_path_${this.id}_${key}`}`,
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

        if (currentPath) {
          changePathOnElement(currentPath, getPathByPoints(this.currentSlicePoint[key]));
          return;
        }

        const path = generateSvgElement('path', [], {
          id: `pxyup_path_${this.id}_${key}`,
          stroke: this.dataset.colors[key],
          fill: 'none',
          d: getPathByPoints(this.currentSlicePoint[key]),
        });

        this.charts_svg.appendChild(path);
      }
    });

    if (!this.options.withoutAxisLabel && withXAxis) {
      this.drawAxisX();
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
          id: `pxyup_path_preview_${this.id}_${key}`,
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
    if (values.length === 0) {
      this.minValue = undefined;
      this.maxValue = undefined;
      this.removeSteps();
      return;
    }
    const minMax = getMinMax(values);
    if (this.minValue === minMax.min && this.maxValue === minMax.max) {
      return;
    }
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

  removeSteps() {
    const groupSteps = this.charts_svg.querySelector('g.steps');
    if (groupSteps) {
      groupSteps.remove();
    }
  }

  drawSteps(arr: Array<number>) {
    this.removeSteps();
    const realMinValue = this.minValue >= 0 ? 0 : this.minValue;
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

  preventDrag = (e: DragEvent) => {
    e.preventDefault();
    return false;
  };

  getTranspilingDataset() {
    return this.columnDatasets;
  }

  onMouseEnterPreview = () => {
    this.hideHoverLineAndPoints();
  };

  private SVG_CHARTS_LISTENERS = {
    mouseenter: this.onMouseEnter,
    mouseleave: this.onMouseLeave,
    mousemove: this.onMouseMove,
  };

  private CENTRAL_CONTROL_LISTENERS = {
    mousedown: this.onDragStart,
    dragstart: this.preventDrag,
    mouseup: this.onDragEnd,
    touchstart: this.onDragStart,
    touchend: this.onDragEnd,
  };

  private PREVIEW_CHART_LISTENERS = {
    mouseenter: this.onMouseEnterPreview,
    mousemove: [this.onDrag, this.onResize],
    touchmove: [this.onDrag, this.onResize],
  };

  private DOCUMENT_LISTENERS = {
    mouseup: this.onMouseUp,
  };

  private TOOLTIP_LISTENERS = {
    mouseleave: this.onToolTipLeave,
  };

  private LEFT_RESIZE_CONTROL_LISTENERS = {
    mouseup: this.onResizeEndLeft,
    dragstart: this.preventDrag,
    mousedown: this.onResizeStartLeft,
    touchend: this.onResizeEndLeft,
    touchstart: this.onResizeStartLeft,
    click: this.stopProp,
  };

  private RIGHT_RESIZE_CONTROL_LISTENERS = {
    mouseup: this.onResizeEndRight,
    dragstart: this.preventDrag,
    mousedown: this.onResizeStartRight,
    touchend: this.onResizeEndRight,
    touchstart: this.onResizeStartRight,
    click: this.stopProp,
  };

  get positions() {
    if (!this._position) {
      this._position = this.charts_svg.getBoundingClientRect();
    }
    return this._position;
  }
}
