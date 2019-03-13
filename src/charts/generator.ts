import {
  Chart,
  ChartOptions,
  Container,
  LinePoints,
  Point,
  PointWithColor,
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

export function generateCheckbox(
  id: number,
  key: string,
  label: string,
  checked = true,
): HTMLElement {
  const checkbox = generateNode({
    tag: 'div',
    classList: ['checkbox_container'],
    children: [
      {
        tag: 'div',
        classList: ['round'],
        children: [
          {
            tag: 'input',
            id: `checkbox_${id}_${key}`,
            attrs: {
              key: key,
              type: 'checkbox',
              checked: checked,
            },
          },
          {
            tag: 'label',
            attrs: {
              for: `checkbox_${id}_${key}`,
            },
          },
        ],
      },
      {
        tag: 'div',
        classList: ['label'],
        value: label,
      },
    ],
  }) as HTMLElement;
  return checkbox;
}

export function generateRect(
  point: Point,
  size: RectangleOptions,
  color?: string,
  classList?: Array<string>,
  id?: string,
): SVGRectElement {
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', point.x as any);
  rect.setAttribute('y', point.y as any);
  rect.setAttribute('width', size.width as any);
  rect.setAttribute('height', size.height as any);
  if (color) {
    rect.setAttribute('fill', color);
  }
  if (classList) {
    classList.forEach(item => {
      rect.classList.add(item);
    });
  }

  if (id) {
    rect.setAttribute('id', id);
  }
  return rect;
}

export function generateGroup(child: Array<SVGElement> = []): SVGElement {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  child.forEach(item => {
    group.appendChild(item);
  });
  return group;
}

export function generateCircle(point: PointWithColor, radius: number = 5): SVGCircleElement {
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', point.x as any);
  circle.setAttribute('cy', point.y as any);
  circle.setAttribute('stroke', point.color);
  if (radius) {
    circle.setAttribute('r', radius as any);
  }
  return circle;
}

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

  if (classList) {
    classList.forEach(item => {
      line.classList.add(item);
    });
  }

  return line;
}

export function generateText(
  point: Point,
  text: string,
  classList: Array<string> = [],
  width?: string,
): SVGTextElement {
  const textSvgNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');

  textSvgNode.setAttribute('x', point.x as any);
  textSvgNode.setAttribute('y', point.y as any);
  classList.forEach(item => {
    textSvgNode.classList.add(item);
  });
  textSvgNode.appendChild(document.createTextNode(text));
  if (width) {
    textSvgNode.setAttribute('width', width as any);
  }
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
    rootNode.innerHTML = node.value;
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
        {
          tag: 'div',
          classList: ['tooltip'],
          children: [
            {
              tag: 'p',
              classList: ['date'],
            },
            {
              tag: 'div',
              classList: ['items'],
            },
          ],
        },
        {
          tag: 'div',
          classList: ['controls'],
          skip: options.withoutControls,
        },
        {
          tag: 'div',
          classList: ['night_mode_control'],
          skip: options.withoutNightMode,
          children: [
            {
              tag: 'a',
              value: 'Switch to Night mode',
            },
          ],
        },
      ],
    });
    rootNode.appendChild(basicNode);
    id++;
    return new PyxChart(id, basicNode as HTMLElement, dataset, options);
  };
}
