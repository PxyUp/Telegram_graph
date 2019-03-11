import { Chart, ChartOptions, Container, LinePoints, RectangleOptions, TextPoints } from "../interfaces/chart";

import { PyxChart } from "./chart";
import { PyxNode } from "../interfaces/node";

const getSize = (container: Container, defaultValue?: any): RectangleOptions => {
    if(container && container.size) {
        return {
            height: container.size.height,
            width: container.size.width
        }
    }
    return defaultValue
}

export function generateLine(points: LinePoints, color: string, classList: Array<string> = []): SVGLineElement {
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute("x1", points.x1 as any)
    line.setAttribute("x2", points.x2  as any)
    line.setAttribute("y1", points.y1  as any)
    line.setAttribute("y2", points.y2  as any)
    line.setAttribute("stroke", color)
    classList.forEach((item) => {
        line.classList.add(item)
    })
    return line
}

export function generateText(points: TextPoints, text: string, classList: Array<string> = []): SVGTextElement {
    const textSvgNode = document.createElementNS('http://www.w3.org/2000/svg','text');

    textSvgNode.setAttribute("x", points.x as any)
    textSvgNode.setAttribute("y", points.y  as any)
    classList.forEach((item) => {
        textSvgNode.classList.add(item)
    })
    textSvgNode.appendChild(document.createTextNode(text))
    
    return textSvgNode
}

export function generateNode(node: PyxNode): HTMLElement | SVGSVGElement | null  {
    if (node.skip) {
        return null
    }
    
    const rootNode = node.tag === 'svg' ? document.createElementNS('http://www.w3.org/2000/svg', 'svg') : document.createElement(node.tag);

    if (node.value) {
        rootNode.nodeValue = node.value;
    }
    if (node.id) {
        rootNode.setAttribute("id", node.id)
    }

    if (node.classList) {
        node.classList.forEach((item) => {
            rootNode.classList.add(item)
        })
    }

    if (node.attrs) {
        if(node.tag === 'svg') {
            Object.keys(node.attrs).forEach((key) => {
                rootNode.setAttributeNS(null, key, node.attrs[key])
            })
            rootNode.setAttributeNS(null, "viewbox", `0 0 ${node.attrs["width"]} ${node.attrs["height"]}`)
        } else {
            Object.keys(node.attrs).forEach((key) => {
                rootNode.setAttribute(key, node.attrs[key])
            })
        }

    }

    if(node.children) {
        node.children.forEach((item) => {
            const child = generateNode(item)
            if (child) {
                rootNode.appendChild(child)
            }
        })
    }

    return rootNode
}

export function chartsGenerator(rootNode: HTMLElement): (dataset: Chart, options?: ChartOptions) => PyxChart {
    let id = 0;
    return (dataset: Chart, options: ChartOptions = {}) => {
        const basicNode = generateNode({
            id: `pyx_chart_${id}`,
            classList: ["pyx_chart_container"],
            tag: "div",
            children: [
                {
                    tag: "svg",
                    classList: ["main_chart"],
                    attrs: {
                        ...getSize(options.chartsContainer, {
                            width: "400",
                            height: "400"
                        }),
                    }
                },
                {
                    tag: "svg",
                    skip: options.withoutPreview,
                    classList: ["chart_preview"],
                    attrs: {
                        ...getSize(options.chartsContainer, {
                            width: "100",
                            height: "100"
                        })
                    }
                },
                {
                    tag: "div",
                    skip: options.withoutControls,
                    children: [
                        {
                            tag: "button"
                        },
                        {
                            tag: "button"
                        }
                    ]
                }
            ]
        })
        rootNode.appendChild(basicNode)
        id++
        return new PyxChart(id, basicNode as HTMLElement, dataset, options)
    }
}