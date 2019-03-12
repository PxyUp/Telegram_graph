import {
  Chart,
  ChartOptions,
  Container,
  LinePoints,
  Point,
  RectangleOptions,
} from '../interfaces/chart';

import { PyxChart } from './chart';
import { PyxNode } from '../interfaces/node';
import { getPathByPoints } from '../utils/misc';

const getSize = (container: Container, defaultValue?: any): RectangleOptions => {
  if (container && container.size) {
    return {
      height: container.size.height,
      width: container.size.width,
    };
  }
  return defaultValue;
};

export function generatePath(points: Array<Point>, color: string, id?: string): SVGPathElement {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', getPathByPoints(points));
  path.setAttribute('stroke', color);
  path.setAttribute('fill', 'none');
  if (id) {
    path.setAttribute('id', id);
  }
  return path;
}

export function generateLine(
  point: LinePoints,
  color: string | null,
  classList: Array<string> = [],
): SVGLineElement {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', point.x1 as any);
  line.setAttribute('x2', point.x2 as any);
  line.setAttribute('y1', point.y1 as any);
  line.setAttribute('y2', point.y2 as any);
  if (color) {
    line.setAttribute('stroke', color);
  }

  classList.forEach(item => {
    line.classList.add(item);
  });
  return line;
}

export function generateText(
  point: Point,
  text: string,
  classList: Array<string> = [],
): SVGTextElement {
  const textSvgNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');

  textSvgNode.setAttribute('x', point.x as any);
  textSvgNode.setAttribute('y', point.y as any);
  classList.forEach(item => {
    textSvgNode.classList.add(item);
  });
  textSvgNode.appendChild(document.createTextNode(text));

  return textSvgNode;
}

export function generateNode(node: PyxNode): HTMLElement | SVGSVGElement | null {
  if (node.skip) {
    return null;
  }

  const rootNode =
    node.tag === 'svg'
      ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      : document.createElement(node.tag);

  if (node.value) {
    rootNode.nodeValue = node.value;
  }
  if (node.id) {
    rootNode.setAttribute('id', node.id);
  }

  if (node.classList) {
    node.classList.forEach(item => {
      rootNode.classList.add(item);
    });
  }

  if (node.attrs) {
    if (node.tag === 'svg') {
      Object.keys(node.attrs).forEach(key => {
        rootNode.setAttributeNS(null, key, node.attrs[key]);
      });
      rootNode.setAttributeNS(
        null,
        'viewBox',
        `0 0 ${node.attrs['width']} ${node.attrs['height']}`,
      );
    } else {
      Object.keys(node.attrs).forEach(key => {
        rootNode.setAttribute(key, node.attrs[key]);
      });
    }
  }

  if (node.children) {
    node.children.forEach(item => {
      const child = generateNode(item);
      if (child) {
        rootNode.appendChild(child);
      }
    });
  }

  return rootNode;
}

export function chartsGenerator(
  rootNode: HTMLElement,
): (dataset: Chart, options?: ChartOptions) => PyxChart {
  let id = 0;
  return (dataset: Chart, options: ChartOptions = {}) => {
    const basicNode = generateNode({
      id: `pyx_chart_${id}`,
      classList: ['pyx_chart_container'],
      tag: 'div',
      children: [
        {
          tag: 'svg',
          classList: ['main_chart'],
          attrs: {
            ...getSize(options.chartsContainer, {
              width: '400',
              height: '400',
            }),
          },
        },
        {
          tag: 'svg',
          skip: options.withoutPreview,
          classList: ['chart_preview'],
          attrs: {
            ...getSize(options.chartsContainer, {
              width: '400',
              height: '60',
            }),
          },
        },
      ],
    });
    rootNode.appendChild(basicNode);
    id++;
    const pyxChart = new PyxChart(id, basicNode as HTMLElement, dataset, options);
    return pyxChart;
  };
}
