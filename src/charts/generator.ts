import { Chart, ChartOptions, Container, RectangleOptions } from '../interfaces/chart';
import { createTextNode, getSize } from '../utils/misc';

import { PyxChart } from './chart';
import { PyxNode } from '../interfaces/node';

export function generateCheckbox(
  id: number,
  key: string,
  label: string,
  checked = true,
): HTMLElement {
  const checkbox = generateNode({
    tag: 'div',
    classList: ['checkbox_container'],
    attrs: {
      key: key,
    },
    children: [
      {
        tag: 'div',
        classList: ['round'],
        children: [
          {
            tag: 'input',
            attrs: {
              id: `checkbox_${id}_${key}`,
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
        textValue: label,
      },
    ],
  }) as HTMLElement;
  return checkbox;
}

export function generateSvgElement(
  type: string,
  classList?: Array<string>,
  attrs?: { [key: string]: string },
  childs?: Array<SVGElement>,
  value?: string,
): SVGElement {
  const element = document.createElementNS('http://www.w3.org/2000/svg', type);

  if (classList) {
    classList.forEach(item => {
      element.classList.add(item);
    });
  }
  if (attrs) {
    Object.keys(attrs).forEach(key => {
      element.setAttribute(key, attrs[key]);
    });
  }

  if (childs) {
    childs.forEach(item => {
      element.appendChild(item);
    });
  }

  if (value) {
    element.appendChild(document.createTextNode(value));
  }

  return element;
}

export function generateNode(node: PyxNode): HTMLElement | SVGSVGElement | null {
  if (node.skip) {
    return null;
  }

  const rootNode =
    node.tag === 'svg'
      ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      : document.createElement(node.tag);

  if (node.textValue) {
    rootNode.appendChild(createTextNode(node.textValue));
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
      attrs: {
        id: `pyx_chart_${id}`,
      },
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
              textValue: 'Switch to Night mode',
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
