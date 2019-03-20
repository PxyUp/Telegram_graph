import { Chart, ChartOptions } from '../interfaces/chart';
import { getSize, setNodeAttrs } from '../utils/misc';

import { PxyUpChart } from './chart';
import { PxyupNode } from '../interfaces/node';

let id = 0;

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

export function generateNode(node: PxyupNode): HTMLElement | SVGSVGElement | null {
  if (node.skip) {
    return null;
  }

  const rootNode =
    node.tag === 'svg'
      ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      : document.createElement(node.tag);

  if (node.textValue) {
    rootNode.textContent = node.textValue;
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
      if (!item) {
        return;
      }
      if (!item.tag) {
        rootNode.appendChild(item as HTMLHtmlElement);
        return;
      }
      const child = generateNode(item as PxyupNode);
      if (child) {
        rootNode.appendChild(child);
      }
    });
  }

  return rootNode;
}

export function chartsGenerator(
  rootNode: HTMLElement,
): (dataset: Chart, options?: ChartOptions) => PxyUpChart {
  return (dataset: Chart, options: ChartOptions = {}) => {
    const axisContainer = generateNode({
      tag: 'div',
      classList: ['axis_labels'],
      skip: options.withoutAxisLabel,
    });
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
        ...getSize(options.previewContainer, {
          width: '400',
          height: '60',
        }),
      },
    });

    const leftResizeControl = generateNode({
      tag: 'div',
      classList: ['resize'],
      children: [
        generateNode({
          tag: 'div',
          classList: ['caret'],
        }),
      ],
    });

    const rightResizeControl = generateNode({
      tag: 'div',
      classList: ['resize'],
      children: [
        generateNode({
          tag: 'div',
          classList: ['caret'],
        }),
      ],
    });

    const leftPreviewContainer = generateNode({
      tag: 'div',
      classList: ['control', 'left'],
      children: [leftResizeControl],
    });

    const centerPreviewContainer = generateNode({
      tag: 'div',
      classList: ['control', 'center'],
    });

    const rightPreviewContainer = generateNode({
      tag: 'div',
      classList: ['control', 'right'],
      children: [rightResizeControl],
    });

    const previewControlContainer = generateNode({
      tag: 'div',
      classList: ['preview_controls'],
      children: [leftPreviewContainer, centerPreviewContainer, rightPreviewContainer],
    });

    const previewContainer = generateNode({
      tag: 'div',
      skip: options.withoutPreview,
      classList: ['preview_container'],
      children: [previewNode, previewControlContainer],
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
        id: `pxyup_chart_${id}`,
      },
      classList: ['pxyup_chart_container'],
      tag: 'div',
      children: [
        chartsNode,
        axisContainer,
        previewContainer,
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
    return new PxyUpChart(
      id++,
      rootNode.appendChild(basicNode) as HTMLElement,
      chartsNode,
      previewNode,
      toolTipNode as HTMLElement,
      toolTipDateNode as HTMLElement,
      controlsNode as HTMLElement,
      nightModeControl as HTMLElement,
      axisContainer as HTMLElement,
      leftPreviewContainer as HTMLElement,
      rightPreviewContainer as HTMLElement,
      centerPreviewContainer as HTMLElement,
      leftResizeControl as HTMLElement,
      rightResizeControl as HTMLElement,
      previewControlContainer as HTMLElement,
      dataset,
      options,
    );
  };
}
