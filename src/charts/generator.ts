import { Chart, ChartOptions } from '../interfaces/chart';
import { createTextNode, getSize, isWin, setNodeAttrs } from '../utils/misc';

import { PyxChart } from './chart';
import { PyxNode } from '../interfaces/node';

let id = 0;
const isWindows = isWin();

export function generateCheckbox(
  id: number,
  key: string,
  label: string,
  checked = true,
): HTMLElement {
  return generateNode({
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
    setNodeAttrs(element, attrs);
  }

  if (childs) {
    childs.forEach(item => {
      element.appendChild(item);
    });
  }

  if (value !== undefined) {
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
      setNodeAttrs(rootNode, node.attrs);
    }
  }

  if (node.children) {
    node.children.forEach((item: any) => {
      if (!item.tag) {
        rootNode.appendChild(item as HTMLHtmlElement);
        return;
      }
      const child = generateNode(item as PyxNode);
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
  return (dataset: Chart, options: ChartOptions = {}) => {
    const chartsNode = generateNode({
      tag: 'svg',
      classList: ['main_chart'],
      attrs: {
        ...getSize(options.chartsContainer, {
          width: '400',
          height: '400',
        }),
      },
    });
    const previewNode = generateNode({
      tag: 'svg',
      skip: options.withoutPreview,
      classList: ['chart_preview'],
      attrs: {
        ...getSize(options.chartsContainer, {
          width: '400',
          height: '60',
        }),
      },
    });
    const toolTipDateNode = generateNode({
      tag: 'p',
      classList: ['date'],
    });
    const toolTipNode = generateNode({
      tag: 'div',
      classList: ['tooltip'],
      children: [
        toolTipDateNode,
        {
          tag: 'div',
          classList: ['items'],
        },
      ],
    });
    const controlsNode = generateNode({
      tag: 'div',
      classList: ['controls'],
      skip: options.withoutControls,
    });
    const nightModeControl = generateNode({
      tag: 'a',
      textValue: 'Switch to Night mode',
    });
    const basicNode = generateNode({
      attrs: {
        id: `pyx_chart_${id}`,
      },
      classList: ['pyx_chart_container'],
      tag: 'div',
      children: [
        chartsNode,
        previewNode,
        toolTipNode,
        controlsNode,
        {
          tag: 'div',
          classList: ['night_mode_control'],
          skip: options.withoutNightMode,
          children: [nightModeControl],
        },
      ],
    });
    return new PyxChart(
      id++,
      rootNode.appendChild(basicNode) as HTMLElement,
      chartsNode,
      previewNode,
      toolTipNode as HTMLElement,
      toolTipDateNode as HTMLElement,
      controlsNode as HTMLElement,
      nightModeControl as HTMLElement,
      dataset,
      options,
      isWindows,
    );
  };
}
