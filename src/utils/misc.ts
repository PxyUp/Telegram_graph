import { Container, MinMax, Point, RectangleOptions } from '../interfaces/chart';

const computedDateArr = {} as { [key: number]: Date };

export function setStyleBatch(node: HTMLElement | SVGElement, styles: { [key: string]: string }) {
  const computedStyle = Object.keys(styles)
    .map(key => `${key}: ${styles[key]}`)
    .join(';');
  node.style.cssText = computedStyle;
}

export function getSize(container: Container, defaultValue?: any): RectangleOptions {
  if (container && container.size) {
    return {
      height: container.size.height,
      width: container.size.width,
    };
  }
  return defaultValue;
}

export function getRelativeOffset(targetCoords: number, parentCoords: number): number {
  return targetCoords - parentCoords;
}

export function findClosestIndexPointX(arr: Array<Point>, value: number): number {
  let rightIndex = 0;
  let leftIndex = arr.length - 1;
  let middleIndex;
  while (leftIndex - rightIndex > 1) {
    middleIndex = Math.floor((rightIndex + leftIndex) / 2);
    if (value < arr[middleIndex].x) {
      leftIndex = middleIndex;
    } else {
      if (value > arr[middleIndex].x) {
        rightIndex = middleIndex;
      } else {
        return middleIndex;
      }
    }
  }
  if (value - (arr[rightIndex].x as number) <= (arr[leftIndex].x as number) - value) {
    return rightIndex;
  }
  return leftIndex;
}

export function getMinMax(arr: Array<number>): MinMax {
  const minMax = {
    min: Number.POSITIVE_INFINITY,
    max: Number.NEGATIVE_INFINITY,
  };
  return arr.reduce((prev, curr) => {
    prev['min'] = Math.min(prev.min, curr);
    prev['max'] = Math.max(prev.max, curr);
    return prev;
  }, minMax);
}

export function getShortDateByUnix(unix: number, withWeekday = false): string {
  if (!computedDateArr[unix]) {
    computedDateArr[unix] = new Date(unix);
  }
  return computedDateArr[unix].toLocaleString('en-us', {
    weekday: withWeekday ? 'short' : undefined,
    month: 'short',
    day: 'numeric',
  });
}

export function getPathByPoints(points: Array<Point>): string {
  return points
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `L ${point.x} ${point.y}`;
    })
    .join(' ');
}

export function changePathOnElement(el: SVGPathElement, path: string) {
  el.setAttribute('d', path);
}

export function removeAllChild(node: HTMLElement) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

export function createTextNode(text: string): Text {
  return document.createTextNode(text);
}

export function animatePath(path: SVGElement): number {
  const length = (path as SVGPathElement).getTotalLength();
  const oldTransition = path.style.transition;
  path.style.strokeDasharray = length + ' ' + length;
  path.style.strokeDashoffset = length.toString();
  path.getBoundingClientRect();
  path.style.transition = `stroke-dashoffset 0.8s ease-in-out`;
  path.style.strokeDashoffset = '0';

  return setTimeout(() => {
    path.style.transition = oldTransition;
    path.style.strokeDasharray = 'none';
  }, 800);
}

export function addNodeListener(
  node: HTMLElement | Document | SVGElement,
  listeners: { [key: string]: any | Array<any> },
) {
  Object.keys(listeners).forEach(event => {
    if (!Array.isArray(listeners[event])) {
      node.addEventListener(event, listeners[event]);
      return;
    }
    listeners[event].forEach((callback: any) => {
      node.addEventListener(event, callback);
    });
  });
}

export function removeNodeListener(
  node: HTMLElement | Document | SVGElement,
  listeners: { [key: string]: any | Array<any> },
) {
  Object.keys(listeners).forEach(event => {
    if (!Array.isArray(listeners[event])) {
      node.removeEventListener(event, listeners[event]);
      return;
    }
    listeners[event].forEach((callback: any) => {
      node.removeEventListener(event, callback);
    });
  });
}

export function setNodeAttrs(
  node: HTMLElement | SVGElement | Element,
  attrs: { [key: string]: string },
) {
  Object.keys(attrs).forEach(key => {
    node.setAttribute(key, attrs[key]);
  });
}

export function getCoordsX(
  chartsWidth: number,
  spacingLeft: number,
  spacingRight: number,
  indexElem: number,
  count: number,
): number {
  if (count === 1) {
    return spacingLeft + (chartsWidth - spacingLeft - spacingRight) / 2;
  }
  return spacingLeft + ((chartsWidth - spacingLeft - spacingRight) / (count - 1)) * indexElem;
}

export function getCoordsY(
  chartsHeight: number,
  spacingTop: number,
  spacingBtn: number,
  maxValue: number,
  minValue: number,
  value: number,
): number {
  if (value === maxValue) {
    return spacingTop;
  }
  if (value === minValue) {
    return chartsHeight - spacingBtn;
  }
  if (minValue === maxValue) {
    return chartsHeight - spacingBtn - (chartsHeight - spacingTop - spacingBtn) / 2;
  }

  return (
    chartsHeight -
    spacingBtn -
    (chartsHeight - spacingTop - spacingBtn) * ((value - minValue) / (maxValue - minValue))
  );
}

export function relativeIndexByOffset(
  offsetX: number,
  fullWidth: number,
  spacingLeft: number,
  spacingRight: number,
  count: number,
): number {
  if (offsetX <= spacingLeft) {
    return 0;
  }

  if (offsetX >= fullWidth - spacingRight) {
    return count - 1;
  }

  return Math.min(
    count - 1,
    Math.round(((offsetX - spacingLeft) / (fullWidth - spacingLeft - spacingRight)) * (count - 1)),
  );
}

export function getLeftTransitionByIndex(
  leftIndex: number,
  fullWidth: number,
  spacingLeft: number,
  spacingRight: number,
  count: number,
): number {
  return -(
    fullWidth -
    (leftIndex / (count - 1)) * (fullWidth - spacingLeft - spacingRight) -
    spacingRight
  );
}

export function getRightTransitionByIndex(
  rightIndex: number,
  fullWidth: number,
  spacingLeft: number,
  spacingRight: number,
  count: number,
): number {
  return (rightIndex / (count - 1)) * (fullWidth - spacingLeft - spacingRight) + spacingLeft;
}

export function setOptionsForEvent(e: DragEvent) {
  if (e.type === 'dragstart') {
    document.body.style.cursor = 'pointer';
    (e as DragEvent).dataTransfer.effectAllowed = 'move';
    (e as DragEvent).dataTransfer.setDragImage(new Image(), 0, 0);
  }
}
