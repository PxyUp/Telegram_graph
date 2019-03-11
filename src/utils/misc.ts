import { Point } from '../interfaces/chart';

export function getMin(arr: Array<number>) {
  return Math.min(...arr);
}

export function getMax(arr: Array<number>) {
  return Math.max(...arr);
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

export function animatePath(path: SVGPathElement) {
  const length = path.getTotalLength();
  path.style.transition = 'none';
  path.style.strokeDasharray = length + ' ' + length;
  path.style.strokeDashoffset = length.toString();
  path.getBoundingClientRect();
  path.style.transition = 'stroke-dashoffset 0.8s ease-in-out';
  path.style.strokeDashoffset = '0';
}
