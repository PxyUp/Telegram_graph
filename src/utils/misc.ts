import { Point } from '../interfaces/chart';

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

export function getMin(arr: Array<number>) {
  return Math.min.apply(Math, arr);
}

export function getMax(arr: Array<number>) {
  return Math.max.apply(Math, arr);
}

export function getShortDateByUnix(unix: number): string {
  const date = new Date(unix);
  return date.toLocaleString('en-us', {
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
  const duration = 0.8;
  const oldTransition = path.style.transition;
  path.style.strokeDasharray = length + ' ' + length;
  path.style.strokeDashoffset = length.toString();
  path.getBoundingClientRect();
  path.style.transition = `stroke-dashoffset ${duration}s ease-in-out`;
  path.style.strokeDashoffset = '0';

  return setTimeout(() => {
    path.style.transition = oldTransition;
    path.style.strokeDasharray = 'none';
  }, duration * 1000);
}
